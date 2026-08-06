const prisma = require('../lib/prisma');
const { getPagination, buildMeta } = require('../utils/pagination');
const asyncHandler = require('../utils/asyncHandler');

/** GET /api/system-logs?userId=&tableName=&action=&from=&to=&page=&limit= */
const list = asyncHandler(async (req, res) => {
  const { userId, tableName, action, from, to } = req.query;
  const { skip, take, page, limit } = getPagination(req.query, 25);

  const where = {
    ...(userId ? { user_id: Number(userId) } : {}),
    ...(tableName ? { table_name: tableName } : {}),
    ...(action ? { action } : {}),
    ...(from || to
      ? {
          created_at: {
            ...(from ? { gte: new Date(from) } : {}),
            ...(to ? { lte: new Date(to) } : {}),
          },
        }
      : {}),
  };

  const [rows, totalItems] = await Promise.all([
    prisma.system_logs.findMany({
      where,
      include: { users: { select: { first_name: true, last_name: true, email: true } } },
      skip,
      take,
      orderBy: { created_at: 'desc' },
    }),
    prisma.system_logs.count({ where }),
  ]);

  res.json({ success: true, data: rows, meta: buildMeta(page, limit, totalItems) });
});

module.exports = { list };
