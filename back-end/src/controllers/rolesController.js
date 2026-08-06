const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

/** GET /api/roles */
const list = asyncHandler(async (req, res) => {
  const roles = await prisma.roles.findMany({ orderBy: { role_id: 'asc' } });
  res.json({ success: true, data: roles });
});

/** POST /api/roles  Body: { roleName } */
const create = asyncHandler(async (req, res) => {
  const { roleName } = req.body;
  if (!roleName) throw ApiError.badRequest('roleName is required');
  const role = await prisma.roles.create({ data: { role_name: roleName } });
  res.status(201).json({ success: true, data: role });
});

module.exports = { list, create };
