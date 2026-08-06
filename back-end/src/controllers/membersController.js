const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logAction = require('../utils/logAction');
const notify = require('../utils/notify');
const { getPagination, buildMeta } = require('../utils/pagination');


const list = asyncHandler(async (req, res) => {
  const { search, status, membershipTypeId } = req.query;
  const { skip, take, page, limit } = getPagination(req.query, 10);

  const where = {
    ...(status && status !== 'All Status' ? { status } : {}),
    ...(membershipTypeId ? { membership_type_id: Number(membershipTypeId) } : {}),
    ...(search
      ? { OR: [{ full_name: { contains: search } }, { email: { contains: search } }] }
      : {}),
  };

  const [rows, totalItems] = await Promise.all([
    prisma.members.findMany({
      where,
      include: { membership_types: true },
      skip,
      take,
      orderBy: { created_at: 'desc' },
    }),
    prisma.members.count({ where }),
  ]);

  res.json({ success: true, data: rows, meta: buildMeta(page, limit, totalItems) });
});

const getOne = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const member = await prisma.members.findUnique({
    where: { member_id: id },
    include: {
      membership_types: true,
      borrow_records: {
        include: { books: { select: { title: true, author: true } } },
        orderBy: { borrow_date: 'desc' },
        take: 20,
      },
    },
  });
  if (!member) throw ApiError.notFound('Member not found');

  const active = member.borrow_records.filter((r) => r.status !== 'Returned');
  const history = member.borrow_records.filter((r) => r.status === 'Returned');

  res.json({
    success: true,
    data: {
      ...member,
      borrow_records: undefined,
      activeBorrows: active,
      borrowHistory: history,
    },
  });
});

const create = asyncHandler(async (req, res) => {
  const { fullName, dateOfBirth, phoneNumber, email, membershipTypeId } = req.body;

  if (!fullName || !dateOfBirth || !phoneNumber) {
    throw ApiError.badRequest('fullName, dateOfBirth and phoneNumber are required');
  }

  const member = await prisma.members.create({
    data: {
      full_name: fullName,
      date_of_birth: new Date(dateOfBirth),
      phone_number: phoneNumber,
      email: email || null,
      membership_type_id: membershipTypeId ? Number(membershipTypeId) : null,
    },
    include: { membership_types: true },
  });

  await logAction({ userId: req.user?.userId, action: 'CREATE', tableName: 'members', recordId: member.member_id, req });

  // --- AUTOMATIC NOTIFICATION FOR NEW MEMBER ---
  await notify({
    title: 'Member Added',
    message: `${member.full_name} was registered as a new member.`,
  });

  res.status(201).json({ success: true, data: member });
});

const update = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');
  const { fullName, dateOfBirth, phoneNumber, email, membershipTypeId, status, expirationDate } = req.body;

  const data = {
    ...(fullName !== undefined ? { full_name: fullName } : {}),
    ...(dateOfBirth !== undefined ? { date_of_birth: new Date(dateOfBirth) } : {}),
    ...(phoneNumber !== undefined ? { phone_number: phoneNumber } : {}),
    ...(email !== undefined ? { email } : {}),
    ...(membershipTypeId !== undefined ? { membership_type_id: membershipTypeId ? Number(membershipTypeId) : null } : {}),
    ...(status !== undefined ? { status } : {}),
    ...(expirationDate !== undefined ? { expiration_date: new Date(expirationDate) } : {}),
  };

  const member = await prisma.members.update({ where: { member_id: id }, data, include: { membership_types: true } });
  await logAction({ userId: req.user?.userId, action: 'UPDATE', tableName: 'members', recordId: id, req });

  // --- AUTOMATIC NOTIFICATION FOR MEMBER UPDATE ---
  await notify({
    title: 'Member Updated',
    message: `${member.full_name}'s profile was updated.`,
  });

  res.json({ success: true, data: member });
});

const setStatus = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const { status } = req.body;
  if (!['Active', 'Suspended', 'Expired'].includes(status)) {
    throw ApiError.badRequest("status must be one of: Active, Suspended, Expired");
  }
  const member = await prisma.members.update({ where: { member_id: id }, data: { status } });
  await logAction({ userId: req.user?.userId, action: 'UPDATE_STATUS', tableName: 'members', recordId: id, req, details: { status } });

  // --- AUTOMATIC NOTIFICATION FOR MEMBER STATUS CHANGE ---
  await notify({
    title: 'Member Status Changed',
    message: `${member.full_name}'s status was changed to ${status}.`,
  });

  res.json({ success: true, data: member });
});

/**
 * DELETE /api/members/:id
 * Blocked (P2003) if the member has any borrow_records - `members` has no
 * cascading delete for that relation on purpose, to preserve borrowing
 * history/audit trail. Suspend the member instead of deleting them.
 */
const remove = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const existing = await prisma.members.findUnique({ where: { member_id: id } });
  if (!existing) throw ApiError.notFound('Member not found');

  try {
    await prisma.members.delete({ where: { member_id: id } });
  } catch (error) {
    if (error.code === 'P2003') {
      throw ApiError.badRequest('Cannot delete this member; they have existing borrow records. Suspend them instead.');
    }
    throw error;
  }

  await logAction({ userId: req.user?.userId, action: 'DELETE', tableName: 'members', recordId: id, req });

  // --- AUTOMATIC NOTIFICATION FOR MEMBER DELETION ---
  await notify({
    title: 'Member Removed',
    message: `${existing.full_name} was removed from members.`,
  });

  res.json({ success: true, message: 'Member deleted' });
});

module.exports = { list, getOne, create, update, setStatus, remove };