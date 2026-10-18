const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, buildMeta } = require('../utils/pagination');

const VALID_PURPOSES = ['Research', 'Study', 'Reading', 'Event', 'Other'];

/** GET /api/library-entries?search=&startDate=&endDate=&page=&limit= */
const list = asyncHandler(async (req, res) => {
  const { search, startDate, endDate } = req.query;
  const { skip, take, page, limit } = getPagination(req.query, 10);

  const where = {
    ...(search ? { attendee_name: { contains: search } } : {}),
    ...(startDate || endDate
      ? {
          entry_time: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(`${endDate}T23:59:59`) } : {}),
          },
        }
      : {}),
  };

  const [rows, totalItems] = await Promise.all([
    prisma.library_entries.findMany({ where, skip, take, orderBy: { entry_time: 'desc' } }),
    prisma.library_entries.count({ where }),
  ]);

  res.json({ success: true, data: rows, meta: buildMeta(page, limit, totalItems) });
});

/** GET /api/library-entries/:id */
const getOne = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const entry = await prisma.library_entries.findUnique({ where: { entry_id: id } });
  if (!entry) throw ApiError.notFound('Entry not found');
  res.json({ success: true, data: entry });
});

/**
 * POST /api/library-entries (staff only)
 * Body: { attendeeName, age, address?, phoneNumber?, purpose? }
 */
const create = asyncHandler(async (req, res) => {
  const { attendeeName, age, address, phoneNumber, purpose } = req.body;

  if (!attendeeName || !attendeeName.trim()) {
    throw ApiError.badRequest('attendeeName is required');
  }
  const ageNum = Number(age);
  if (!Number.isInteger(ageNum) || ageNum < 0 || ageNum > 130) {
    throw ApiError.badRequest('age must be a valid integer');
  }

  // Remove spaces and dashes; the column holds at most 15 characters.
  const phone = phoneNumber ? String(phoneNumber).replace(/[\s-]/g, '') : null;
  if (phone && phone.length > 15) {
    throw ApiError.badRequest('Phone number must be 15 characters or fewer');
  }

  if (purpose && !VALID_PURPOSES.includes(purpose)) {
    throw ApiError.badRequest(`purpose must be one of: ${VALID_PURPOSES.join(', ')}`);
  }

  const entry = await prisma.library_entries.create({
    data: {
      attendee_name: attendeeName.trim(),
      age: ageNum,
      address: address || null,
      phone_number: phone,
      ...(purpose ? { purpose } : {}),
    },
  });

  res.status(201).json({ success: true, data: entry });
});

/** PUT /api/library-entries/:id (staff only) */
const update = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const { attendeeName, age, address, phoneNumber, purpose } = req.body;

  const existing = await prisma.library_entries.findUnique({ where: { entry_id: id } });
  if (!existing) throw ApiError.notFound('Entry not found');

  if (age !== undefined) {
    const ageNum = Number(age);
    if (!Number.isInteger(ageNum) || ageNum < 0 || ageNum > 130) {
      throw ApiError.badRequest('age must be a valid integer');
    }
  }

  const entry = await prisma.library_entries.update({
    where: { entry_id: id },
    data: {
      ...(attendeeName !== undefined ? { attendee_name: attendeeName.trim() } : {}),
      ...(age !== undefined ? { age: Number(age) } : {}),
      ...(address !== undefined ? { address: address || null } : {}),
      ...(phoneNumber !== undefined ? { phone_number: phoneNumber || null } : {}),
      ...(purpose !== undefined ? { purpose: purpose || null } : {}),
    },
  });

  res.json({ success: true, data: entry });
});

/** DELETE /api/library-entries/:id (staff only) */
const remove = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const existing = await prisma.library_entries.findUnique({ where: { entry_id: id } });
  if (!existing) throw ApiError.notFound('Entry not found');

  await prisma.library_entries.delete({ where: { entry_id: id } });
  res.json({ success: true, message: 'Entry deleted' });
});

module.exports = { list, getOne, create, update, remove };