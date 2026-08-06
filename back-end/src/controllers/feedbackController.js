// controllers/feedbackController.js
const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logAction = require('../utils/logAction');
const { getPagination, buildMeta } = require('../utils/pagination');

const SOURCES = ['book', 'event', 'general'];

/** GET /api/feedback?search=&source=&status=&page=&limit= (staff only) */
const list = asyncHandler(async (req, res) => {
  const { search, source, status } = req.query;
  const { skip, take, page, limit } = getPagination(req.query, 10);

  const where = {
    ...(source && source !== 'All Categories' ? { source } : {}),
    ...(status && status !== 'All Status' ? { status } : {}),
    ...(search ? { OR: [{ comment: { contains: search } }, { user_name: { contains: search } }] } : {}),
  };

  const [rows, totalItems] = await Promise.all([
    prisma.feedback.findMany({ where, skip, take, orderBy: { feedback_date: 'desc' } }),
    prisma.feedback.count({ where }),
  ]);

  res.json({ success: true, data: rows, meta: buildMeta(page, limit, totalItems) });
});

/** GET /api/feedback/:id */
const getOne = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const feedback = await prisma.feedback.findUnique({ where: { feedback_id: id } });
  if (!feedback) throw ApiError.notFound('Feedback not found');
  res.json({ success: true, data: feedback });
});

/**
 * POST /api/feedback (public - no auth required, a visitor/member submits this)
 * Body: { userName?, email?, source, comment, rating }
 */
const create = asyncHandler(async (req, res) => {
  const { userName, email, source, comment, rating } = req.body;
  if (!source || !comment || rating === undefined) {
    throw ApiError.badRequest('source, comment and rating are required');
  }
  if (!SOURCES.includes(source)) throw ApiError.badRequest(`source must be one of: ${SOURCES.join(', ')}`);

  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    throw ApiError.badRequest('rating must be an integer between 1 and 5');
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw ApiError.badRequest('Invalid email address');
  }

  const feedback = await prisma.feedback.create({
    data: {
      user_name: userName || null,
      email: email || null,
      source,
      comment: comment.trim(),
      rating: ratingNum,
    },
  });

  res.status(201).json({ success: true, data: feedback });
});

/**
 * PUT /api/feedback/:id/reply (staff only)
 * Body: { adminReply }
 * Saves/updates the staff reply text and marks the feedback as replied.
 */
const setReply = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const { adminReply } = req.body;
  if (!adminReply || !adminReply.trim()) {
    throw ApiError.badRequest('adminReply is required');
  }

  const existing = await prisma.feedback.findUnique({ where: { feedback_id: id } });
  if (!existing) throw ApiError.notFound('Feedback not found');

  const feedback = await prisma.feedback.update({
    where: { feedback_id: id },
    data: { admin_reply: adminReply.trim(), status: 'replied' },
  });

  await logAction({
    userId: req.user?.userId,
    action: 'REPLY',
    tableName: 'feedback',
    recordId: id,
    req,
  });

  res.json({ success: true, data: feedback });
});

/**
 * DELETE /api/feedback/:id/reply (staff only)
 * Clears the reply text and reverts status to pending.
 * This matches the "Delete Reply" action in FeedBacks.jsx - it does NOT
 * delete the underlying feedback submission itself.
 */
const removeReply = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const existing = await prisma.feedback.findUnique({ where: { feedback_id: id } });
  if (!existing) throw ApiError.notFound('Feedback not found');

  const feedback = await prisma.feedback.update({
    where: { feedback_id: id },
    data: { admin_reply: null, status: 'pending' },
  });

  await logAction({
    userId: req.user?.userId,
    action: 'REMOVE_REPLY',
    tableName: 'feedback',
    recordId: id,
    req,
  });

  res.json({ success: true, data: feedback });
});

/**
 * DELETE /api/feedback/:id (Admin only)
 * Permanently deletes the entire feedback record, including the visitor's
 * original comment/rating - not just the staff reply. Distinct from
 * removeReply above; use with caution.
 */
const remove = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const existing = await prisma.feedback.findUnique({ where: { feedback_id: id } });
  if (!existing) throw ApiError.notFound('Feedback not found');

  await prisma.feedback.delete({ where: { feedback_id: id } });

  await logAction({
    userId: req.user?.userId,
    action: 'DELETE',
    tableName: 'feedback',
    recordId: id,
    req,
  });

  res.json({ success: true, message: 'Feedback deleted' });
});

module.exports = { list, getOne, create, setReply, removeReply, remove };