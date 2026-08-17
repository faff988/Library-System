const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logAction = require('../utils/logAction');
const { getPagination, buildMeta } = require('../utils/pagination');

const CONDITIONS = ['Fair', 'Damaged'];

/** GET /api/damage-reports?condition=&page=&limit= */
const list = asyncHandler(async (req, res) => {
  const { condition } = req.query;
  const { skip, take, page, limit } = getPagination(req.query, 10);

  const where = condition ? { book_condition: condition } : {};

  const [rows, totalItems] = await Promise.all([
    prisma.damage_reports.findMany({
      where,
      include: {
        // `category` added - it's a required, always-populated column on
        // `books` (see booksController.categoryFromDeweyCode), so leaving
        // it out of the select is what was producing "Uncategorized"
        // downstream, not missing data.
        books: { select: { title: true, author: true, dewey_code: true, category: true } },
        borrow_records: { select: { member_id: true, members: { select: { full_name: true } } } },
        users: { select: { first_name: true, last_name: true } },
      },
      skip,
      take,
      orderBy: { reported_at: 'desc' },
    }),
    prisma.damage_reports.count({ where }),
  ]);

  res.json({ success: true, data: rows, meta: buildMeta(page, limit, totalItems) });
});

/** GET /api/damage-reports/:id */
const getOne = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const report = await prisma.damage_reports.findUnique({
    where: { report_id: id },
    include: { books: true, borrow_records: { include: { members: true } }, users: true },
  });
  if (!report) throw ApiError.notFound('Damage report not found');
  res.json({ success: true, data: report });
});

/**
 * POST /api/damage-reports
 * Body: { bookId, borrowId, bookCondition, damageDescription }
 * reported_by is always the authenticated staff user.
 *
 * NOTE: the `damage_reports_book_condition` enum only has 'Fair' and
 * 'Damaged' - there is no 'Good'/'Lost' value. If the BorrowReturn.jsx
 * "condition" selector needs a "Lost" option, the enum needs a migration
 * first (see README "Known mismatches" #6).
 */
const create = asyncHandler(async (req, res) => {
  const { bookId, borrowId, bookCondition, damageDescription } = req.body;
  if (!bookId || !borrowId) throw ApiError.badRequest('bookId and borrowId are required');
  if (bookCondition && !CONDITIONS.includes(bookCondition)) {
    throw ApiError.badRequest(`bookCondition must be one of: ${CONDITIONS.join(', ')}`);
  }
  if (!req.user?.userId) throw ApiError.unauthorized('Must be logged in as staff');

  const report = await prisma.damage_reports.create({
    data: {
      book_id: Number(bookId),
      borrow_id: Number(borrowId),
      reported_by: req.user.userId,
      book_condition: bookCondition || 'Damaged',
      damage_description: damageDescription || null,
    },
    include: { books: true },
  });

  await logAction({ userId: req.user.userId, action: 'CREATE', tableName: 'damage_reports', recordId: report.report_id, req });
  res.status(201).json({ success: true, data: report });
});

/** DELETE /api/damage-reports/:id */
const remove = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  await prisma.damage_reports.delete({ where: { report_id: id } });
  await logAction({ userId: req.user?.userId, action: 'DELETE', tableName: 'damage_reports', recordId: id, req });
  res.json({ success: true, message: 'Damage report deleted' });
});

module.exports = { list, getOne, create, remove, CONDITIONS };