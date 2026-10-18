const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logAction = require('../utils/logAction');
const { getPagination, buildMeta } = require('../utils/pagination');

const SALT_ROUNDS = 10;
const isAdminName = (name) => String(name || '').toLowerCase() === 'admin';

function toPublicUser(user) {
  const { hash_password, ...rest } = user;
  return rest;
}

// permissions / permission_overrides are LongText columns: store JSON strings.
function normalizeJsonField(value, fieldName) {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') {
    try { JSON.parse(value); return value; }
    catch { throw ApiError.badRequest(`${fieldName} must be valid JSON`); }
  }
  return JSON.stringify(value);
}

async function assertRoleNotAdmin(roleId) {
  const role = await prisma.roles.findUnique({ where: { role_id: Number(roleId) } });
  if (!role) throw ApiError.badRequest('Role not found');
  if (isAdminName(role.role_name)) {
    throw ApiError.forbidden('The Admin role cannot be assigned. Only Librarian privileges can be set.');
  }
}

async function loadEditableTarget(id) {
  const target = await prisma.users.findUnique({ where: { user_id: id }, include: { roles: true } });
  if (!target) throw ApiError.notFound('User not found');
  if (isAdminName(target.roles?.role_name)) {
    throw ApiError.forbidden('Admin accounts cannot be modified by other users.');
  }
  return target;
}

const list = asyncHandler(async (req, res) => {
  const { search, roleId, isActive } = req.query;
  const { skip, take, page, limit } = getPagination(req.query, 20);

  const where = {
    ...(roleId ? { role_id: Number(roleId) } : {}),
    ...(isActive !== undefined ? { is_active: isActive === 'true' } : {}),
    ...(search
      ? { OR: [
          { first_name: { contains: search } },
          { last_name: { contains: search } },
          { email: { contains: search } },
        ] }
      : {}),
  };

  const [rows, totalItems] = await Promise.all([
    prisma.users.findMany({ where, include: { roles: true }, skip, take, orderBy: { created_at: 'desc' } }),
    prisma.users.count({ where }),
  ]);

  res.json({ success: true, data: rows.map(toPublicUser), meta: buildMeta(page, limit, totalItems) });
});

const getOne = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const user = await prisma.users.findUnique({ where: { user_id: id }, include: { roles: true } });
  if (!user) throw ApiError.notFound('User not found');
  res.json({ success: true, data: toPublicUser(user) });
});

const create = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, password, roleId, isActive, permissions, permissionOverrides } = req.body;
  if (!firstName || !lastName || !email || !password || !roleId) {
    throw ApiError.badRequest('firstName, lastName, email, password and roleId are required');
  }

  await assertRoleNotAdmin(roleId);

  const existing = await prisma.users.findUnique({ where: { email } });
  if (existing) throw ApiError.badRequest('A user with this email already exists');

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
      ...(permissions !== undefined ? { permissions: normalizeJsonField(permissions, 'permissions') } : {}),
      ...(permissionOverrides !== undefined
        ? { permission_overrides: normalizeJsonField(permissionOverrides, 'permissionOverrides') }
        : {}),
    },
    include: { roles: true },
  });

  await logAction({ userId: req.user?.userId, action: 'CREATE', tableName: 'users', recordId: user.user_id, req });
  res.status(201).json({ success: true, data: toPublicUser(user) });
});

const update = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const { firstName, lastName, email, phone, roleId, isActive, password, permissions, permissionOverrides } = req.body;

  await loadEditableTarget(id);
  if (roleId !== undefined) await assertRoleNotAdmin(roleId);

  if (email !== undefined) {
    const clash = await prisma.users.findFirst({ where: { email, NOT: { user_id: id } } });
    if (clash) throw ApiError.badRequest('A user with this email already exists');
  }

  const data = {
    ...(firstName !== undefined ? { first_name: firstName } : {}),
    ...(lastName !== undefined ? { last_name: lastName } : {}),
    ...(email !== undefined ? { email } : {}),
    ...(phone !== undefined ? { phone_number: phone } : {}),
    ...(roleId !== undefined ? { role_id: Number(roleId) } : {}),
    ...(isActive !== undefined ? { is_active: Boolean(isActive) } : {}),
    ...(permissions !== undefined ? { permissions: normalizeJsonField(permissions, 'permissions') } : {}),
    ...(permissionOverrides !== undefined
      ? { permission_overrides: normalizeJsonField(permissionOverrides, 'permissionOverrides') }
      : {}),
  };
  if (password) data.hash_password = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.users.update({ where: { user_id: id }, data, include: { roles: true } });
  await logAction({ userId: req.user?.userId, action: 'UPDATE', tableName: 'users', recordId: id, req });
  res.json({ success: true, data: toPublicUser(user) });
});

const setActive = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const { isActive } = req.body;
  if (isActive === undefined) throw ApiError.badRequest('isActive is required');

  await loadEditableTarget(id);

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

const remove = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  await loadEditableTarget(id);

  try {
    await prisma.users.delete({ where: { user_id: id } });
  } catch (error) {
    if (error.code === 'P2003') {
      throw ApiError.badRequest('Cannot delete this user; they have related records. Deactivate them instead.');
    }
    throw error;
  }

  await logAction({ userId: req.user?.userId, action: 'DELETE', tableName: 'users', recordId: id, req });
  res.json({ success: true, message: 'User deleted' });
});

module.exports = { list, getOne, create, update, setActive, remove };