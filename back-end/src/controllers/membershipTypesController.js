const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logAction = require('../utils/logAction');

const list = asyncHandler(async (req, res) => {
  const types = await prisma.membership_types.findMany({ orderBy: { membership_type_id: 'asc' } });
  res.json({ success: true, data: types });
});

const getOne = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const type = await prisma.membership_types.findUnique({ where: { membership_type_id: id } });
  if (!type) throw ApiError.notFound('Membership type not found');
  res.json({ success: true, data: type });
});

const create = asyncHandler(async (req, res) => {
  const { typeName, maxBooksAllowed, loanDurationWeeks } = req.body;
  if (!typeName || maxBooksAllowed === undefined) {
    throw ApiError.badRequest('typeName and maxBooksAllowed are required');
  }
  const type = await prisma.membership_types.create({
    data: {
      type_name: typeName,
      max_books_allowed: Number(maxBooksAllowed),
      loan_duration_weeks: loanDurationWeeks !== undefined ? Number(loanDurationWeeks) : 2,
    },
  });
  await logAction({ userId: req.user?.userId, action: 'CREATE', tableName: 'membership_types', recordId: type.membership_type_id, req });
  res.status(201).json({ success: true, data: type });
});

const update = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const { typeName, maxBooksAllowed, loanDurationWeeks } = req.body;
  const type = await prisma.membership_types.update({
    where: { membership_type_id: id },
    data: {
      ...(typeName !== undefined ? { type_name: typeName } : {}),
      ...(maxBooksAllowed !== undefined ? { max_books_allowed: Number(maxBooksAllowed) } : {}),
      ...(loanDurationWeeks !== undefined ? { loan_duration_weeks: Number(loanDurationWeeks) } : {}),
    },
  });
  await logAction({ userId: req.user?.userId, action: 'UPDATE', tableName: 'membership_types', recordId: id, req });
  res.json({ success: true, data: type });
});

/** DELETE /api/membership-types/:id - blocked while members reference it (onDelete: Restrict) */
const remove = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const existing = await prisma.membership_types.findUnique({ where: { membership_type_id: id } });
  if (!existing) throw ApiError.notFound('Membership type not found');

  try {
    await prisma.membership_types.delete({ where: { membership_type_id: id } });
  } catch (error) {
    if (error.code === 'P2003') {
      throw ApiError.badRequest('Cannot delete this membership type; it is still assigned to existing members.');
    }
    throw error;
  }

  await logAction({ userId: req.user?.userId, action: 'DELETE', tableName: 'membership_types', recordId: id, req });
  res.json({ success: true, message: 'Membership type deleted' });
});

module.exports = { list, getOne, create, update, remove };