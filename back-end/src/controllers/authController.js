const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const env = require('../../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logAction = require('../utils/logAction');

const SALT_ROUNDS = 10;

function signToken(user) {
  return jwt.sign(
    {
      userId: user.user_id,
      email: user.email,
      roleId: user.role_id,
      roleName: user.roles ? user.roles.role_name : null,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

function toPublicUser(user) {
  const { hash_password, ...rest } = user;
  return rest;
}

const register = asyncHandler(async (req, res) => {
    const {firstName, lastName, email, phone, password, roleId} = req.body;

    if(!firstName || !lastName || !email || !password){
        throw ApiError.badRequest('firstName, lastName, email and password are required');
    }

     if (password.length < 6) {
    throw ApiError.badRequest('Password must be at least 6 characters long');
  }

  const existing = await prisma.users.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  let resolvedRoleId = roleId;
  if (!resolvedRoleId) {
    const librarianRole = await prisma.roles.findUnique({ where: { role_name: 'Librarian' } });
    resolvedRoleId = librarianRole ? librarianRole.role_id : null;
  }

  const hash_password = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.users.create({
    data: {
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: phone || null,
      hash_password,
      role_id: resolvedRoleId,
    },
    include: { roles: true },
  });

   await logAction({ userId: user.user_id, action: 'REGISTER', tableName: 'users', recordId: user.user_id, req });

   const token = signToken(user);
  res.status(201).json({ success: true, data: { user: toPublicUser(user), token } });
});


//POST
const login = asyncHandler(async (req, res) => {
  const { email, identifier, password } = req.body;
  const loginEmail = email || identifier;

  if (!loginEmail || !password) {
    throw ApiError.badRequest('email and password are required');
  }

  const user = await prisma.users.findUnique({ where: { email: loginEmail }, include: { roles: true } });
  if (!user || !user.is_active) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  const valid = await bcrypt.compare(password, user.hash_password);
  if (!valid) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  await logAction({ userId: user.user_id, action: 'LOGIN', tableName: 'users', recordId: user.user_id, req });

  const token = signToken(user);
  res.json({ success: true, data: { user: toPublicUser(user), token } });
});

//GET
const me = asyncHandler(async (req, res) => {
  const user = await prisma.users.findUnique({
    where: { user_id: req.user.userId },
    include: { roles: true },
  });
  if (!user) throw ApiError.notFound('User not found');
  res.json({ success: true, data: toPublicUser(user) });
});

//PUT
/**
 * PUT /api/auth/me
 * Body: { firstName?, lastName?, phone? }
 * Self-service profile edit - unlike PUT /users/:id (Admin-only, used to
 * manage OTHER staff accounts), this lets any logged-in user update their
 * own name/phone. Email and role can't be changed here.
 */
const updateMe = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone } = req.body;

  const user = await prisma.users.update({
    where: { user_id: req.user.userId },
    data: {
      ...(firstName !== undefined ? { first_name: firstName } : {}),
      ...(lastName !== undefined ? { last_name: lastName } : {}),
      ...(phone !== undefined ? { phone_number: phone } : {}),
    },
    include: { roles: true },
  });

  await logAction({ userId: user.user_id, action: 'UPDATE_PROFILE', tableName: 'users', recordId: user.user_id, req });

  res.json({ success: true, data: toPublicUser(user) });
});

//PUT
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw ApiError.badRequest('currentPassword and newPassword are required');
  }
  if (newPassword.length < 6) {
    throw ApiError.badRequest('New password must be at least 6 characters long');
  }

  const user = await prisma.users.findUnique({ where: { user_id: req.user.userId } });
  if (!user) throw ApiError.notFound('User not found');

  const valid = await bcrypt.compare(currentPassword, user.hash_password);
  if (!valid) throw ApiError.unauthorized('Current password is incorrect');

  const hash_password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await prisma.users.update({ where: { user_id: user.user_id }, data: { hash_password } });

  await logAction({ userId: user.user_id, action: 'CHANGE_PASSWORD', tableName: 'users', recordId: user.user_id, req });

  res.json({ success: true, message: 'Password updated successfully' });
});

module.exports = { register, login, me, updateMe, changePassword };