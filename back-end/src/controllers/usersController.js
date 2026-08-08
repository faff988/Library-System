const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logAction = require('../utils/logAction');
const { getPagination, buildMeta } = require('../utils/pagination');

const SALT_ROUNDS = 10;

function toPublicUser(user) {
  const { hash_password, ...rest } = user;
  return rest;
}

// `permissions` is a Prisma Json column now (see schema.prisma), so it should
// be stored as a plain object, not a stringified blob. Accept either shape
// from the client (Staff.jsx sends an object) and normalize.
function normalizePermissions(permissions) {
  if (permissions === null) return null;
  if (typeof permissions === 'string') {
    try {
      return JSON.parse(permissions);
    } catch {
      throw ApiError.badRequest('permissions must be valid JSON');
    }
  }
  return permissions;
}

/** GET /api/users?search=&roleId=&isActive=&page=&limit= */
const list = asyncHandler(async (req, res) => {
  const { search, roleId, isActive } = req.query;
  const { skip, take, page, limit } = getPagination(req.query, 20);

  const where = {
    ...(roleId ? { role_id: Number(roleId) } : {}),
    ...(isActive !== undefined ? { is_active: isActive === 'true' } : {}),
    ...(search
      ? {
          OR: [
            { first_name: { contains: search } },
            { last_name: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {}),
  };

  const [rows, totalItems] = await Promise.all([
    prisma.users.findMany({ where, include: { roles: true }, skip, take, orderBy: { created_at: 'desc' } }),
    prisma.users.count({ where }),
  ]);

  res.json({ success: true, data: rows.map(toPublicUser), meta: buildMeta(page, limit, totalItems) });
});

/** GET /api/users/:id */
const getOne = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');
  
  const user = await prisma.users.findUnique({
    where: { user_id: id },
    include: { roles: true },
  });
  if (!user) throw ApiError.notFound('User not found');
  res.json({ success: true, data: toPublicUser(user) });
});

/** POST /api/users - Admin creates a staff (Admin/Librarian) account */
const create = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, password, roleId, isActive, permissions } = req.body;
  if (!firstName || !lastName || !email || !password || !roleId) {
    throw ApiError.badRequest('firstName, lastName, email, password and roleId are required');
  }

  const hash_password = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.users.create({
    data: {
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: phone || null,
      hash_password,
      role_id: Number(roleId),
      is_active: isActive !== undefined ? Boolean(isActive) : true,
      ...(permissions !== undefined ? { permissions: normalizePermissions(permissions) } : {}),
    },
    include: { roles: true },
  });

  await logAction({ userId: req.user?.userId, action: 'CREATE', tableName: 'users', recordId: user.user_id, req });
  res.status(201).json({ success: true, data: toPublicUser(user) });
});

/** PUT /api/users/:id */
const update = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const { firstName, lastName, email, phone, roleId, isActive, password, permissions } = req.body;

  const data = {
    ...(firstName !== undefined ? { first_name: firstName } : {}),
    ...(lastName !== undefined ? { last_name: lastName } : {}),
    ...(email !== undefined ? { email } : {}),
    ...(phone !== undefined ? { phone_number: phone } : {}),
    ...(roleId !== undefined ? { role_id: Number(roleId) } : {}),
    ...(isActive !== undefined ? { is_active: Boolean(isActive) } : {}),
    ...(permissions !== undefined ? { permissions: normalizePermissions(permissions) } : {}),
  };

  if (password) {
    data.hash_password = await bcrypt.hash(password, SALT_ROUNDS);
  }

  const user = await prisma.users.update({ where: { user_id: id }, data, include: { roles: true } });

  await logAction({ userId: req.user?.userId, action: 'UPDATE', tableName: 'users', recordId: id, req });
  res.json({ success: true, data: toPublicUser(user) });
});

/** PATCH /api/users/:id/status  Body: { isActive } - deactivate instead of hard delete */
const setActive = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const { isActive } = req.body;
  if (isActive === undefined) throw ApiError.badRequest('isActive is required');

  const user = await prisma.users.update({ where: { user_id: id }, data: { is_active: Boolean(isActive) } });
  await logAction({
    userId: req.user?.userId,
    action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
    tableName: 'users',
    recordId: id,
    req,
  });
  res.json({ success: true, data: toPublicUser(user) });
});

/**
 * DELETE /api/users/:id
 * Hard delete is blocked by design: users are referenced by borrow_records
 * (issued_by), damage_reports (reported_by), donations (received_by) and
 * system_logs, all with onUpdate: Restrict / no cascade. Deleting a user
 * that ever issued a borrow would violate the FK and throw P2003.
 * Prefer PATCH /:id/status to deactivate a staff account instead.
 */
const remove = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  await prisma.users.delete({ where: { user_id: id } });
  await logAction({ userId: req.user?.userId, action: 'DELETE', tableName: 'users', recordId: id, req });
  res.json({ success: true, message: 'User deleted' });
});

module.exports = { list, getOne, create, update, setActive, remove };