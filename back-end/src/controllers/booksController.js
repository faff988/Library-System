const path = require('path');
const fs = require('fs');
const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logAction = require('../utils/logAction');
const notify = require('../utils/notify');
const { getPagination, buildMeta } = require('../utils/pagination');
const { baseUploadsDir } = require('../middleware/upload');

const LANGUAGES = ['Khmer', 'English', 'French'];

// The 10 standard Dewey Decimal Classification main classes, in order.
// This is a fixed international standard - not something a library
// customizes - so it's safe to hardcode.
const DDC_CATEGORIES = [
  'Computer Science, Information & General Works', // 000-099
  'Philosophy & Psychology',                        // 100-199
  'Religion',                                       // 200-299
  'Social Sciences',                                // 300-399
  'Language',                                       // 400-499
  'Science',                                        // 500-599
  'Technology',                                     // 600-699
  'Arts & Recreation',                              // 700-799
  'Literature',                                     // 800-899
  'History & Geography',                            // 900-999
];

// Derives a book's category from its Dewey code's main class, per the
// international DDC standard. A short code like "5" or "83" is read as
// "the 500s" / "the 830s" (pad on the RIGHT, not the left) so it maps to
// the correct hundred-range. Returns null if the code doesn't start with
// a recognizable number (e.g. a bare Cutter/fiction prefix like "F823").
// This is always recomputed server-side and never trusts a client-sent
// category value, so the two can never drift out of sync.
function categoryFromDeweyCode(deweyCode) {
  if (!deweyCode) return null;
  const match = String(deweyCode).trim().match(/^(\d{1,3})/);
  if (!match) return null;
  const wholePart = match[1].padEnd(3, '0').slice(0, 3);
  const mainClass = Math.floor(Number(wholePart) / 100);
  return DDC_CATEGORIES[mainClass] ?? null;
}

function computeStatus(book) {
  const total = book.total_copies ?? 0;
  const available = book.available_copies ?? 0;
  if (total === 0 || available === 0) return 'OUT OF STOCK';
  if (available / total <= 0.3) return 'LOW STOCK';
  if (available < total) return 'BORROWED';
  return 'AVAILABLE';
}

function serializeBook(book) {
  return {
    ...book,
    status: computeStatus(book),
    borrowed_copies: (book.total_copies ?? 0) - (book.available_copies ?? 0),
    cover_image_url: book.cover_image ? `/uploads/covers/${book.cover_image}` : null,
  };
}

function parseBoolean(value, defaultValue) {
  if (value === undefined) return defaultValue;
  return value === true || value === 'true';
}

function deleteCoverFile(filename) {
  const filePath = path.join(baseUploadsDir, 'covers', filename);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.warn('⚠️ Failed to delete cover file:', filePath, err.message);
    }
  });
}

// GET /api/books
const list = asyncHandler(async (req, res) => {
  const { search, section, language, category, borrowable, status } = req.query;
  const { skip, take, page, limit } = getPagination(req.query, 10);

  const sortBy = ['title', 'author', 'dewey_code', 'language', 'category', 'added_at', 'available_copies'].includes(req.query.sortBy)
    ? req.query.sortBy
    : 'title';
  const sortDir = req.query.sortDir === 'desc' ? 'desc' : 'asc';

  const where = {
    ...(section ? { section } : {}),
    ...(language ? { language } : {}),
    ...(category ? { category: { contains: category } } : {}),
    ...(borrowable !== undefined ? { is_borrowable: borrowable === 'true' } : {}),
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

  let data;
  let totalItems;

  if (!status || status === 'All Status') {
    totalItems = await prisma.books.count({ where });
    const rows = await prisma.books.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip,
      take,
    });
    data = rows.map(serializeBook);
  } else {
    const rows = await prisma.books.findMany({ where, orderBy: { [sortBy]: sortDir } });
    const serialized = rows.map(serializeBook);

    const filtered = serialized.filter(
      (b) => b.status.toUpperCase() === String(status).toUpperCase()
    );

    totalItems = filtered.length;
    data = filtered.slice(skip, skip + take);
  }

  res.json({ success: true, data, meta: buildMeta(page, limit, totalItems) });
});

// GET /api/books/stats
// GET /api/books/stats
const stats = asyncHandler(async (req, res) => {
  const [totalAgg, books] = await Promise.all([
    prisma.books.aggregate({
      _sum: { total_copies: true, available_copies: true },
      _count: { _all: true },
    }),
    prisma.books.findMany({ select: { section: true } }),
  ]);

  const totalBooks = totalAgg._count._all || 0;
  const totalCopies = totalAgg._sum.total_copies || 0;
  const availableCopies = totalAgg._sum.available_copies || 0;
  const borrowedCopies = totalCopies - availableCopies;
  const sectionsInUse = new Set(books.map((b) => b.section).filter(Boolean)).size;

  // borrow_records_status is an enum (Borrowed | Returned | Overdue). A
  // record can be past its due_date while still sitting at 'Borrowed' if
  // nothing has flipped it to 'Overdue' yet, so both statuses are checked
  // alongside due_date rather than trusting the enum value alone. Kept in
  // sync with reportsController.fines/borrowReturn.
  const overdueCount = await prisma.borrow_records.count({
    where: { status: { in: ['Borrowed', 'Overdue'] }, due_date: { lt: new Date() } },
  });

  res.json({
    success: true,
    data: {
      totalBooks,
      totalCopies,
      availableCopies,
      borrowedCopies,
      overdueCount,
      sectionsInUse,
      availabilityRate: totalCopies ? Number(((availableCopies / totalCopies) * 100).toFixed(1)) : 0,
    },
  });
});

// GET /api/books/options/sections
// Returns the distinct section values already in use, for the front end
// to offer as autocomplete suggestions on the now-freeform section input.
const sectionOptions = asyncHandler(async (req, res) => {
  const rows = await prisma.books.findMany({
    where: { section: { not: null } },
    distinct: ['section'],
    select: { section: true },
    orderBy: { section: 'asc' },
  });
  res.json({ success: true, data: rows.map((r) => r.section) });
});

// GET /api/books/:id
const getOne = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const book = await prisma.books.findUnique({ where: { book_id: id } });
  if (!book) throw ApiError.notFound('Book not found');

  res.json({ success: true, data: serializeBook(book) });
});

// GET /api/books/:id/history
const history = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const limit = Math.min(50, Number(req.query.limit) || 10);

  const records = await prisma.borrow_records.findMany({
    where: { book_id: id },
    include: {
      members: { select: { full_name: true } },
      users: { select: { first_name: true, last_name: true } },
    },
    orderBy: { borrow_date: 'desc' },
    take: limit,
  });

  res.json({
    success: true,
    data: records.map((r) => ({
      borrow_id: r.borrow_id,
      member_name: r.members?.full_name || 'Unknown Member',
      issued_by: r.users ? `${r.users.first_name} ${r.users.last_name}` : 'System',
      borrow_date: r.borrow_date,
      due_date: r.due_date,
      return_date: r.return_date,
      status: r.status,
    })),
  });
});

// POST /api/books
const create = asyncHandler(async (req, res) => {
  const { title, author, deweyCode, language, section, publicationYear, totalCopies, isBorrowable, isbn, publisher, description } = req.body;

  if (!title || !author || !deweyCode) {
    throw ApiError.badRequest('title, author, and deweyCode are required');
  }
  if (!language || !LANGUAGES.includes(language)) {
    throw ApiError.badRequest(`language must be one of: ${LANGUAGES.join(', ')}`);
  }
  if (section && section.length > 20) {
    throw ApiError.badRequest('section must be 20 characters or fewer');
  }

  const copies = totalCopies !== undefined ? Number(totalCopies) : 1;
  const resolvedCategory = categoryFromDeweyCode(deweyCode) || 'General';

  const book = await prisma.books.create({
    data: {
      title,
      author,
      dewey_code: deweyCode,
      language,
      category: resolvedCategory,
      section: section || null,
      publication_year: publicationYear ? Number(publicationYear) : null,
      total_copies: copies,
      available_copies: copies,
      is_borrowable: parseBoolean(isBorrowable, true),
      isbn: isbn || null,
      publisher: publisher || null,
      description: description || null,
      cover_image: req.file ? req.file.filename : null,
    },
  });

  try {
    await logAction({
      userId: req.user?.userId || null,
      action: 'CREATE',
      tableName: 'books',
      recordId: book.book_id,
      req,
      details: { title },
    });
  } catch (logError) {
    console.warn('⚠️ Non-fatal tracking log error:', logError.message);
  }

  // --- AUTOMATIC NOTIFICATION FOR NEW BOOK ---
  await notify({
    title: 'Book Added',
    message: `"${book.title}" by ${book.author} was added to the inventory.`,
  });

  res.status(201).json({ success: true, data: serializeBook(book) });
});

// PUT /api/books/:id
const update = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const existing = await prisma.books.findUnique({ where: { book_id: id } });
  if (!existing) throw ApiError.notFound('Book not found');

  const { title, author, deweyCode, language, section, publicationYear, totalCopies, isBorrowable, isbn, publisher, description, removeCover } = req.body;

  if (language && !LANGUAGES.includes(language)) {
    throw ApiError.badRequest(`language must be one of: ${LANGUAGES.join(', ')}`);
  }
  if (section !== undefined && section && section.length > 20) {
    throw ApiError.badRequest('section must be 20 characters or fewer');
  }

  const data = {
    ...(title !== undefined ? { title } : {}),
    ...(author !== undefined ? { author } : {}),
    ...(deweyCode !== undefined ? { dewey_code: deweyCode } : {}),
    ...(language !== undefined ? { language } : {}),
    ...(section !== undefined ? { section: section || null } : {}),
    // Category is always re-derived whenever the Dewey code changes, so
    // the two can never fall out of sync.
    ...(deweyCode !== undefined ? { category: categoryFromDeweyCode(deweyCode) || 'General' } : {}),
    ...(publicationYear !== undefined ? { publication_year: publicationYear ? Number(publicationYear) : null } : {}),
    ...(isBorrowable !== undefined ? { is_borrowable: parseBoolean(isBorrowable, true) } : {}),
    ...(isbn !== undefined ? { isbn: isbn || null } : {}),
    ...(publisher !== undefined ? { publisher: publisher || null } : {}),
    ...(description !== undefined ? { description: description || null } : {}),
  };

  if (totalCopies !== undefined) {
    const newTotal = Number(totalCopies);
    if (!Number.isInteger(newTotal) || newTotal < 0) {
      throw ApiError.badRequest('totalCopies must be a non-negative integer');
    }
    const delta = newTotal - existing.total_copies;
    const newAvailable = Math.max(0, existing.available_copies + delta);
    data.total_copies = newTotal;
    data.available_copies = newAvailable;
  }

  let oldCoverToDelete = null;
  if (req.file) {
    data.cover_image = req.file.filename;
    if (existing.cover_image) oldCoverToDelete = existing.cover_image;
  } else if (removeCover === 'true' && existing.cover_image) {
    data.cover_image = null;
    oldCoverToDelete = existing.cover_image;
  }

  const book = await prisma.books.update({ where: { book_id: id }, data });

  if (oldCoverToDelete) deleteCoverFile(oldCoverToDelete);

  await logAction({ userId: req.user?.userId, action: 'UPDATE', tableName: 'books', recordId: id, req });

  // --- AUTOMATIC NOTIFICATION FOR BOOK UPDATE ---
  await notify({
    title: 'Book Updated',
    message: `"${book.title}" was updated.`,
  });

  res.json({ success: true, data: serializeBook(book) });
});

// DELETE /api/books/:id
const remove = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const existing = await prisma.books.findUnique({ where: { book_id: id } });
  if (!existing) throw ApiError.notFound('Book not found');

  try {
    await prisma.books.delete({ where: { book_id: id } });
  } catch (error) {
    if (error.code === 'P2003') {
      throw ApiError.badRequest('Cannot delete this book; it is associated with existing borrow histories.');
    }
    throw error;
  }

  if (existing.cover_image) deleteCoverFile(existing.cover_image);

  await logAction({ userId: req.user?.userId, action: 'DELETE', tableName: 'books', recordId: id, req });

  // --- AUTOMATIC NOTIFICATION FOR BOOK DELETION ---
  await notify({
    title: 'Book Removed',
    message: `"${existing.title}" was removed from the inventory.`,
  });

  res.json({ success: true, message: 'Book deleted' });
});

module.exports = { list, stats, getOne, history, create, update, remove, sectionOptions };