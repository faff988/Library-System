const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logAction = require('../utils/logAction');
const notify = require('../utils/notify');
const { getPagination, buildMeta } = require('../utils/pagination');

/**
 * IMPORTANT - this table has two MySQL triggers already doing work for us:
 *
 *   after_book_borrow  (BEFORE INSERT) - forces due_date = NOW() + 14 days
 *                                        (whatever due_date you send is ignored) and does
 *                                        `books.available_copies -= 1`.
 *
 *   after_book_return  (BEFORE UPDATE) - when status changes to 'Returned',
 *                                        sets return_date = NOW() and does
 *                                        `books.available_copies += 1`.
 *
 * Because of this, the controller below NEVER manually decrements/increments
 * available_copies or sets due_date/return_date itself - doing so would
 * double-count against the trigger. What the controller DOES do is the
 * validation the triggers don't perform: refusing to borrow a book with 0
 * copies left, a member who is over their membership's book limit, etc.
 * See README "Known mismatches" #4/#5.
 */

function serialize(record) {
  const isOverdue = record.status === 'Borrowed' && new Date(record.due_date) < new Date();
  return { ...record, isOverdue };
}

/** GET /api/borrow-records?search=&status=&memberId=&bookId=&page=&limit= */
const list = asyncHandler(async (req, res) => {
  const { search, status, memberId, bookId } = req.query;
  const { skip, take, page, limit } = getPagination(req.query, 10);

  const where = {
    ...(status && status !== 'All Transactions' ? { status } : {}),
    ...(memberId ? { member_id: Number(memberId) } : {}),
    ...(bookId ? { book_id: Number(bookId) } : {}),
    ...(search
      ? {
          OR: [
            { members: { full_name: { contains: search } } },
            { books: { title: { contains: search } } },
          ],
        }
      : {}),
  };

  const [rows, totalItems] = await Promise.all([
    prisma.borrow_records.findMany({
      where,
      include: {
        members: { select: { member_id: true, full_name: true, email: true } },
        books: { select: { book_id: true, title: true, author: true } },
        users: { select: { user_id: true, first_name: true, last_name: true } },
      },
      skip,
      take,
      orderBy: { borrow_date: 'desc' },
    }),
    prisma.borrow_records.count({ where }),
  ]);

  res.json({ success: true, data: rows.map(serialize), meta: buildMeta(page, limit, totalItems) });
});

/** GET /api/borrow-records/:id */
const getOne = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const record = await prisma.borrow_records.findUnique({
    where: { borrow_id: id },
    include: { members: true, books: true, users: { select: { first_name: true, last_name: true } }, damage_reports: true },
  });
  if (!record) throw ApiError.notFound('Borrow record not found');
  res.json({ success: true, data: serialize(record) });
});

/**
 * POST /api/borrow-records
 * Body: { memberId, bookId }
 * issued_by is always taken from the authenticated staff user (req.user),
 * never from the request body.
 */
const create = asyncHandler(async (req, res) => {
  const { memberId, bookId } = req.body;
  if (!memberId || !bookId) throw ApiError.badRequest('memberId and bookId are required');
  if (!req.user?.userId) throw ApiError.unauthorized('Must be logged in as staff to issue a borrow');

  const [member, book] = await Promise.all([
    prisma.members.findUnique({ where: { member_id: Number(memberId) }, include: { membership_types: true } }),
    prisma.books.findUnique({ where: { book_id: Number(bookId) } }),
  ]);

  if (!member) throw ApiError.notFound('Member not found');
  if (!book) throw ApiError.notFound('Book not found');

  if (member.status !== 'Active') {
    throw ApiError.badRequest(`Member is ${member.status.toLowerCase()} and cannot borrow books`);
  }
  if (!book.is_borrowable) throw ApiError.badRequest('This book is marked as not borrowable');
  if (book.available_copies <= 0) throw ApiError.badRequest('No copies of this book are currently available');

  if (member.membership_types) {
    const activeCount = await prisma.borrow_records.count({
      where: { member_id: member.member_id, status: { in: ['Borrowed', 'Overdue'] } },
    });
    if (activeCount >= member.membership_types.max_books_allowed) {
      throw ApiError.badRequest(
        `Member has reached their borrow limit (${member.membership_types.max_books_allowed} books for ${member.membership_types.type_name})`
      );
    }
  }

  // due_date is required by the schema type but will be OVERWRITTEN by the
  // `after_book_borrow` trigger to NOW() + 14 days - the value sent here is
  // just a placeholder to satisfy the NOT NULL column before the trigger runs.
  const placeholderDueDate = new Date();
  placeholderDueDate.setDate(placeholderDueDate.getDate() + 14);

  const record = await prisma.borrow_records.create({
    data: {
      member_id: member.member_id,
      book_id: book.book_id,
      issued_by: req.user.userId,
      due_date: placeholderDueDate,
      status: 'Borrowed',
    },
    include: { members: true, books: true },
  });

  // --- AUTOMATIC NOTIFICATION FOR BORROWING ---
  await notify({
    title: 'Book Borrowed',
    message: `"${book.title}" was borrowed by ${member.full_name}. Due in 14 days.`,
  });

  await logAction({
    userId: req.user.userId,
    action: 'BORROW',
    tableName: 'borrow_records',
    recordId: record.borrow_id,
    req,
    details: { member: member.full_name, book: book.title },
  });

  res.status(201).json({ success: true, data: serialize(record) });
});

/**
 * PUT /api/borrow-records/:id/return
 * Only flips status -> 'Returned'. The `after_book_return` trigger handles
 * return_date and restocking available_copies.
 */
const returnBook = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const existing = await prisma.borrow_records.findUnique({
    where: { borrow_id: id },
    include: { members: true, books: true },
  });
  if (!existing) throw ApiError.notFound('Borrow record not found');
  if (existing.status === 'Returned') throw ApiError.badRequest('This book has already been returned');

  const record = await prisma.borrow_records.update({
    where: { borrow_id: id },
    data: { status: 'Returned' },
    include: { members: true, books: true },
  });

  // --- AUTOMATIC NOTIFICATION FOR RETURN ---
  await notify({
    title: 'Book Returned',
    message: `"${existing.books?.title || 'A book'}" was returned by ${existing.members?.full_name || 'a member'}.`,
  });

  await logAction({ userId: req.user?.userId, action: 'RETURN', tableName: 'borrow_records', recordId: id, req });
  res.json({ success: true, data: serialize(record) });
});

/**
 * POST /api/borrow-records/refresh-overdue
 * The `borrow_records_status` enum has an 'Overdue' value, but nothing in
 * the schema/triggers ever sets it automatically. Call this endpoint from
 * a scheduled job (or a button on the Borrow/Return page) to flip any
 * 'Borrowed' record whose due_date has passed into 'Overdue'.
 */
const refreshOverdue = asyncHandler(async (req, res) => {
  // Find all records that are about to become overdue to create notifications for them
  const recordsToMarkOverdue = await prisma.borrow_records.findMany({
    where: { status: 'Borrowed', due_date: { lt: new Date() } },
    include: { members: true, books: true },
  });

  const result = await prisma.borrow_records.updateMany({
    where: { status: 'Borrowed', due_date: { lt: new Date() } },
    data: { status: 'Overdue' },
  });

  // --- AUTOMATIC NOTIFICATION FOR OVERDUE BOOKS ---
  if (recordsToMarkOverdue.length > 0) {
    const notificationPromises = recordsToMarkOverdue.map((rec) =>
      notify({
        title: 'Overdue Reminder',
        message: `"${rec.books?.title || 'Book'}" borrowed by ${rec.members?.full_name || 'Member'} is now overdue!`,
      })
    );
    await Promise.all(notificationPromises);
  }

  await logAction({ userId: req.user?.userId, action: 'REFRESH_OVERDUE', tableName: 'borrow_records', req, details: { count: result.count } });
  res.json({ success: true, message: `${result.count} record(s) marked Overdue` });
});

module.exports = { list, getOne, create, returnBook, refreshOverdue };