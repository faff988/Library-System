const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

function dateRangeFilter(from, to) {
  if (!from && !to) return undefined;
  return {
    ...(from ? { gte: new Date(from) } : {}),
    ...(to ? { lte: new Date(to) } : {}),
  };
}

// Single definition of "overdue" reused everywhere it's counted, so
// /books/stats, /reports/fines, and /reports/borrow-return can never
// disagree with each other again.
function isOverdue(record) {
  return ['Borrowed', 'Overdue'].includes(record.status) && new Date(record.due_date) < new Date();
}

const popularBooks = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const borrowDateFilter = dateRangeFilter(from, to);

  const grouped = await prisma.borrow_records.groupBy({
    by: ['book_id'],
    _count: { book_id: true },
    ...(borrowDateFilter ? { where: { borrow_date: borrowDateFilter } } : {}),
    orderBy: { _count: { book_id: 'desc' } },
    take: limit,
  });

  const books = await prisma.books.findMany({ where: { book_id: { in: grouped.map((g) => g.book_id) } } });
  const bookMap = new Map(books.map((b) => [b.book_id, b]));

  const data = grouped
    .map((g) => ({ book: bookMap.get(g.book_id), timesBorrowed: g._count.book_id }))
    .filter((row) => row.book);

  res.json({ success: true, data });
});

function computeStatus(total, available) {
  if (total === 0 || available === 0) return 'OUT OF STOCK';
  if (available / total <= 0.3) return 'LOW STOCK';
  if (available < total) return 'BORROWED';
  return 'AVAILABLE';
}

const bookInventory = asyncHandler(async (req, res) => {
  const { search, category, status } = req.query;

  const where = {
    ...(category && category !== 'All Categories' ? { category: { contains: category } } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search } },
            { author: { contains: search } },
            { dewey_code: { contains: search } },
            { category: { contains: search } },
            { isbn: { contains: search } },
          ],
        }
      : {}),
  };

  const books = await prisma.books.findMany({
    where,
    select: { section: true, total_copies: true, available_copies: true },
  });

  const filtered =
    status && status !== 'All Status'
      ? books.filter((b) => computeStatus(b.total_copies ?? 0, b.available_copies ?? 0) === status)
      : books;

  const sectionMap = new Map();
  filtered.forEach((b) => {
    const key = b.section || null;
    const entry = sectionMap.get(key) || { section: key, titleCount: 0, totalCopies: 0, availableCopies: 0 };
    entry.titleCount += 1;
    entry.totalCopies += b.total_copies || 0;
    entry.availableCopies += b.available_copies || 0;
    sectionMap.set(key, entry);
  });

  const totals = filtered.reduce(
    (acc, b) => ({
      titleCount: acc.titleCount + 1,
      totalCopies: acc.totalCopies + (b.total_copies || 0),
      availableCopies: acc.availableCopies + (b.available_copies || 0),
    }),
    { titleCount: 0, totalCopies: 0, availableCopies: 0 }
  );

  res.json({ success: true, data: { bySection: Array.from(sectionMap.values()), totals } });
});

const borrowReturn = asyncHandler(async (req, res) => {
  const { from, to, status } = req.query;
  const borrowDateFilter = dateRangeFilter(from, to);

  const where = {
    ...(status ? { status } : {}),
    ...(borrowDateFilter ? { borrow_date: borrowDateFilter } : {}),
  };

  const records = await prisma.borrow_records.findMany({
    where,
    include: {
      members: { select: { full_name: true } },
      books: { select: { title: true, author: true } },
      users: { select: { first_name: true, last_name: true } },
    },
    orderBy: { borrow_date: 'desc' },
    take: 500,
  });

  const summary = {
    total: records.length,
    borrowed: records.filter((r) => r.status === 'Borrowed').length,
    returned: records.filter((r) => r.status === 'Returned').length,
    // Was `r.status === 'Overdue'` only, which returns 0 whenever nothing
    // flips the enum from 'Borrowed' to 'Overdue' on schedule. Now shares
    // the same due_date-based check as /books/stats and /reports/fines.
    overdue: records.filter(isOverdue).length,
  };

  res.json({ success: true, data: { records, summary } });
});

const PERIOD_FORMATS = {
  daily: '%Y-%m-%d',
  weekly: '%x-W%v',
  monthly: '%Y-%m',
};

const transactions = asyncHandler(async (req, res) => {
  const period = ['daily', 'weekly', 'monthly'].includes(req.query.period) ? req.query.period : 'daily';
  const format = PERIOD_FORMATS[period];
  const from = req.query.from ? new Date(req.query.from) : new Date(new Date().setMonth(new Date().getMonth() - 1));
  const to = req.query.to ? new Date(req.query.to) : new Date();

  const borrows = await prisma.$queryRawUnsafe(
    `SELECT DATE_FORMAT(borrow_date, ?) AS bucket, COUNT(*) AS count
     FROM borrow_records
     WHERE borrow_date BETWEEN ? AND ?
     GROUP BY bucket ORDER BY bucket ASC`,
    format,
    from,
    to
  );

  const returns = await prisma.$queryRawUnsafe(
    `SELECT DATE_FORMAT(return_date, ?) AS bucket, COUNT(*) AS count
     FROM borrow_records
     WHERE return_date IS NOT NULL AND return_date BETWEEN ? AND ?
     GROUP BY bucket ORDER BY bucket ASC`,
    format,
    from,
    to
  );

  const bucketMap = new Map();
  const toRow = (bucket) => bucketMap.get(bucket) || { bucket, borrows: 0, returns: 0 };

  borrows.forEach((r) => {
    const row = toRow(r.bucket);
    row.borrows = Number(r.count);
    bucketMap.set(r.bucket, row);
  });
  returns.forEach((r) => {
    const row = toRow(r.bucket);
    row.returns = Number(r.count);
    bucketMap.set(r.bucket, row);
  });

  const data = Array.from(bucketMap.values()).sort((a, b) => (a.bucket > b.bucket ? 1 : -1));
  res.json({ success: true, data: { period, rows: data } });
});

const entries = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  const entryTimeFilter = dateRangeFilter(from, to);

  const rows = await prisma.library_entries.findMany({
    where: entryTimeFilter ? { entry_time: entryTimeFilter } : {},
    orderBy: { entry_time: 'desc' },
    take: 1000,
  });

  const byDay = new Map();
  rows.forEach((r) => {
    const day = r.entry_time.toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) || 0) + 1);
  });

  res.json({
    success: true,
    data: {
      totalEntries: rows.length,
      averageAge: rows.length ? Number((rows.reduce((s, r) => s + r.age, 0) / rows.length).toFixed(1)) : 0,
      byDay: Array.from(byDay.entries()).map(([day, count]) => ({ day, count })),
      entries: rows,
    },
  });
});

const fines = asyncHandler(async (req, res) => {
  const overdue = await prisma.borrow_records.findMany({
    where: { status: { in: ['Overdue', 'Borrowed'] }, due_date: { lt: new Date() } },
    include: { members: { select: { full_name: true, email: true } }, books: { select: { title: true } } },
    orderBy: { due_date: 'asc' },
  });

  const data = overdue.map((r) => {
    const daysOverdue = Math.max(0, Math.floor((Date.now() - new Date(r.due_date).getTime()) / 86400000));
    return {
      borrow_id: r.borrow_id,
      member: r.members.full_name,
      email: r.members.email,
      book: r.books.title,
      due_date: r.due_date,
      daysOverdue,
    };
  });

  res.json({
    success: true,
    notice:
      'No `fines` table or fine-rate setting exists in the current database schema, so no monetary amounts are calculated here - only overdue records and days-overdue. Add a fine rate + fines table to compute real amounts.',
    data,
  });
});

const members = asyncHandler(async (req, res) => {
  const { status, membershipTypeId } = req.query;
  const where = {
    ...(status ? { status } : {}),
    ...(membershipTypeId ? { membership_type_id: Number(membershipTypeId) } : {}),
  };

  const rows = await prisma.members.findMany({
    where,
    include: {
      membership_types: true,
      _count: { select: { borrow_records: true } },
    },
    orderBy: { created_at: 'desc' },
  });

  const byStatus = rows.reduce((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1;
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      totalMembers: rows.length,
      byStatus,
      members: rows.map((m) => ({
        member_id: m.member_id,
        full_name: m.full_name,
        email: m.email,
        status: m.status,
        membership_type: m.membership_types?.type_name || null,
        created_at: m.created_at,
        totalBorrows: m._count.borrow_records,
      })),
    },
  });
});

const staffActivity = asyncHandler(async (req, res) => {
  const { from, to, userId } = req.query;
  const createdAtFilter = dateRangeFilter(from, to);

  const where = {
    ...(userId ? { user_id: Number(userId) } : {}),
    ...(createdAtFilter ? { created_at: createdAtFilter } : {}),
  };

  const [logs, byUser] = await Promise.all([
    prisma.system_logs.findMany({
      where,
      include: { users: { select: { first_name: true, last_name: true, email: true } } },
      orderBy: { created_at: 'desc' },
      take: 500,
    }),
    prisma.system_logs.groupBy({ by: ['user_id'], _count: { log_id: true }, where }),
  ]);

  const users = await prisma.users.findMany({
    where: { user_id: { in: byUser.map((b) => b.user_id).filter((id) => id !== null) } },
    select: { user_id: true, first_name: true, last_name: true },
  });
  const userMap = new Map(users.map((u) => [u.user_id, u]));

  res.json({
    success: true,
    data: {
      logs,
      byUser: byUser.map((b) => ({
        userId: b.user_id,
        name: userMap.has(b.user_id) ? `${userMap.get(b.user_id).first_name} ${userMap.get(b.user_id).last_name}` : 'Unknown',
        actionCount: b._count.log_id,
      })),
    },
  });
});

const lostDamaged = asyncHandler(async (req, res) => {
  const rows = await prisma.damage_reports.findMany({
    include: {
      // `category` added to the select - it's a required, always-populated
      // column on `books` (see booksController.categoryFromDeweyCode), so
      // once it's actually selected here every row has a real category
      // instead of falling back to "Uncategorized" on the frontend.
      books: { select: { title: true, author: true, dewey_code: true, category: true } },
      borrow_records: { include: { members: { select: { full_name: true } } } },
      users: { select: { first_name: true, last_name: true } },
    },
    orderBy: { reported_at: 'desc' },
  });

  const summary = {
    total: rows.length,
    damaged: rows.filter((r) => r.book_condition === 'Damaged').length,
    fair: rows.filter((r) => r.book_condition === 'Fair').length,
    lost: rows.filter((r) => r.book_condition === 'Lost').length,
  };

  res.json({ success: true, data: { rows, summary } });
});

module.exports = {
  popularBooks,
  bookInventory,
  borrowReturn,
  transactions,
  entries,
  fines,
  members,
  staffActivity,
  lostDamaged,
};