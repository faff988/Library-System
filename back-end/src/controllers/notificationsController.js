const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, buildMeta } = require('../utils/pagination');

const RECIPIENT_TYPES = ['User', 'Member', 'All_Staff'];

/**
 * GET /api/notifications?unreadOnly=true&readOnly=true&page=&limit=
 * Scoped to the logged-in staff member: returns notifications addressed to
 * them personally (recipient_type='User', recipient_id=me) plus broadcasts
 * (recipient_type='All_Staff').
 */
const list = asyncHandler(async (req, res) => {
  const { unreadOnly, readOnly } = req.query;
  const { skip, take, page, limit } = getPagination(req.query, 20);

  const where = {
    OR: [
      { recipient_type: 'All_Staff' },
      { recipient_type: 'User', recipient_id: req.user.userId },
    ],
    ...(unreadOnly === 'true' ? { is_read: false } : {}),
    ...(readOnly === 'true' ? { is_read: true } : {}),
  };

  const [rows, totalItems] = await Promise.all([
    prisma.notifications.findMany({ where, skip, take, orderBy: { created_at: 'desc' } }),
    prisma.notifications.count({ where }),
  ]);

  res.json({ success: true, data: rows, meta: buildMeta(page, limit, totalItems) });
});

/** POST /api/notifications  Body: { recipientType, recipientId?, title, message } */
const create = asyncHandler(async (req, res) => {
  const { recipientType, recipientId, title, message } = req.body;
  if (!title || !message) throw ApiError.badRequest('title and message are required');
  if (recipientType && !RECIPIENT_TYPES.includes(recipientType)) {
    throw ApiError.badRequest(`recipientType must be one of: ${RECIPIENT_TYPES.join(', ')}`);
  }

  const notification = await prisma.notifications.create({
    data: {
      recipient_type: recipientType || 'All_Staff',
      recipient_id: recipientId ? Number(recipientId) : null,
      title,
      message,
    },
  });
  res.status(201).json({ success: true, data: notification });
});

/** PATCH /api/notifications/:id/read */
const markRead = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const existing = await prisma.notifications.findUnique({ where: { notification_id: id } });
  if (!existing) throw ApiError.notFound('Notification not found');

  const isMine =
    existing.recipient_type === 'All_Staff' ||
    (existing.recipient_type === 'User' && existing.recipient_id === req.user.userId);
  if (!isMine) throw ApiError.badRequest('Cannot modify a notification addressed to another user');

  const notification = await prisma.notifications.update({
    where: { notification_id: id },
    data: { is_read: true },
  });
  res.json({ success: true, data: notification });
});

/** PATCH /api/notifications/read-all */
const markAllRead = asyncHandler(async (req, res) => {
  await prisma.notifications.updateMany({
    where: {
      OR: [
        { recipient_type: 'All_Staff' },
        { recipient_type: 'User', recipient_id: req.user.userId },
      ],
      is_read: false,
    },
    data: { is_read: true },
  });
  res.json({ success: true, message: 'All notifications marked as read' });
});

module.exports = { list, create, markRead, markAllRead };