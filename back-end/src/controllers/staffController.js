const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logAction = require('../utils/logAction');
const notify = require('../utils/notify');
const { getPagination, buildMeta } = require('../utils/pagination');

const ACCESS_LEVELS = ['Admin', 'Staff'];
const STATUSES = ['Active', 'Inactive', 'On Leave'];

const list = asyncHandler(async (req, res) => {
  const { search, status, positionId, accessLevel } = req.query;
  const { skip, take, page, limit } = getPagination(req.query, 10);

  const where = {
    ...(status && status !== 'All Status' ? { status } : {}),
    ...(positionId ? { position_id: Number(positionId) } : {}),
    ...(accessLevel ? { access_level: accessLevel } : {}),
    ...(search
      ? { OR: [{ full_name: { contains: search } }, { email: { contains: search } }] }
      : {}),
  };

  const [rows, totalItems] = await Promise.all([
    prisma.staff.findMany({
      where,
      include: { positions: true },
      skip,
      take,
      orderBy: { created_at: 'desc' },
    }),
    prisma.staff.count({ where }),
  ]);

  res.json({ success: true, data: rows, meta: buildMeta(page, limit, totalItems) });
});

const getOne = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const staff = await prisma.staff.findUnique({
    where: { staff_id: id },
    include: { positions: true },
  });
  if (!staff) throw ApiError.notFound('Staff member not found');

  res.json({ success: true, data: staff });
});

const create = asyncHandler(async (req, res) => {
  const { fullName, dateOfBirth, phoneNumber, email, positionId, accessLevel } = req.body;

  if (!fullName || !dateOfBirth || !phoneNumber || !email) {
    throw ApiError.badRequest('fullName, dateOfBirth, phoneNumber and email are required');
  }
  if (accessLevel && !ACCESS_LEVELS.includes(accessLevel)) {
    throw ApiError.badRequest(`accessLevel must be one of: ${ACCESS_LEVELS.join(', ')}`);
  }

  const existing = await prisma.staff.findFirst({ where: { email } });
  if (existing) throw ApiError.badRequest('A staff member with this email already exists');

  const staff = await prisma.staff.create({
    data: {
      full_name: fullName,
      date_of_birth: new Date(dateOfBirth),
      phone_number: phoneNumber,
      email,
      position_id: positionId ? Number(positionId) : null,
      access_level: accessLevel || 'Staff',
    },
    include: { positions: true },
  });

  await logAction({ userId: req.user?.userId, action: 'CREATE', tableName: 'staff', recordId: staff.staff_id, req });

  // --- AUTOMATIC NOTIFICATION FOR NEW STAFF ---
  await notify({
    title: 'Staff Added',
    message: `${staff.full_name} was added as a new staff member.`,
  });

  res.status(201).json({ success: true, data: staff });
});

const update = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const { fullName, dateOfBirth, phoneNumber, email, positionId, accessLevel, status } = req.body;

  if (accessLevel !== undefined && !ACCESS_LEVELS.includes(accessLevel)) {
    throw ApiError.badRequest(`accessLevel must be one of: ${ACCESS_LEVELS.join(', ')}`);
  }
  if (status !== undefined && !STATUSES.includes(status)) {
    throw ApiError.badRequest(`status must be one of: ${STATUSES.join(', ')}`);
  }

  const data = {
    ...(fullName !== undefined ? { full_name: fullName } : {}),
    ...(dateOfBirth !== undefined ? { date_of_birth: new Date(dateOfBirth) } : {}),
    ...(phoneNumber !== undefined ? { phone_number: phoneNumber } : {}),
    ...(email !== undefined ? { email } : {}),
    ...(positionId !== undefined ? { position_id: positionId ? Number(positionId) : null } : {}),
    ...(accessLevel !== undefined ? { access_level: accessLevel } : {}),
    ...(status !== undefined ? { status } : {}),
  };

  const staff = await prisma.staff.update({ where: { staff_id: id }, data, include: { positions: true } });
  await logAction({ userId: req.user?.userId, action: 'UPDATE', tableName: 'staff', recordId: id, req });

  // --- AUTOMATIC NOTIFICATION FOR STAFF UPDATE ---
  await notify({
    title: 'Staff Updated',
    message: `${staff.full_name}'s profile was updated.`,
  });

  res.json({ success: true, data: staff });
});

const setStatus = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const { status } = req.body;
  if (!STATUSES.includes(status)) {
    throw ApiError.badRequest(`status must be one of: ${STATUSES.join(', ')}`);
  }
  const staff = await prisma.staff.update({ where: { staff_id: id }, data: { status } });
  await logAction({ userId: req.user?.userId, action: 'UPDATE_STATUS', tableName: 'staff', recordId: id, req, details: { status } });

  // --- AUTOMATIC NOTIFICATION FOR STAFF STATUS CHANGE ---
  await notify({
    title: 'Staff Status Changed',
    message: `${staff.full_name}'s status was changed to ${status}.`,
  });

  res.json({ success: true, data: staff });
});

/**
 * DELETE /api/staff/:id
 * Blocked (P2003) if the staff member has related records (e.g. actions they
 * processed, audit logs, borrow records they handled) - `staff` has no
 * cascading delete on purpose, to preserve the audit trail. Set status to
 * Inactive instead of deleting them.
 */
const remove = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const existing = await prisma.staff.findUnique({ where: { staff_id: id } });
  if (!existing) throw ApiError.notFound('Staff member not found');

  try {
    await prisma.staff.delete({ where: { staff_id: id } });
  } catch (error) {
    if (error.code === 'P2003') {
      throw ApiError.badRequest('Cannot delete this staff member; they have related records. Set them to Inactive instead.');
    }
    throw error;
  }

  await logAction({ userId: req.user?.userId, action: 'DELETE', tableName: 'staff', recordId: id, req });

  // --- AUTOMATIC NOTIFICATION FOR STAFF REMOVAL ---
  await notify({
    title: 'Staff Removed',
    message: `${existing.full_name} was removed from staff.`,
  });

  res.json({ success: true, message: 'Staff member deleted' });
});

module.exports = { list, getOne, create, update, setStatus, remove };