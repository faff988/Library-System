const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logAction = require('../utils/logAction');
const notify = require('../utils/notify');
const { getPagination, buildMeta } = require('../utils/pagination');

const DDC_CATEGORIES = [
  'Computer Science, Information & General Works',
  'Philosophy & Psychology',
  'Religion',
  'Social Sciences',
  'Language',
  'Science',
  'Technology',
  'Arts & Recreation',
  'Literature',
  'History & Geography',
];
function categoryFromDeweyCode(deweyCode) {
  if (!deweyCode) return null;
  const match = String(deweyCode).trim().match(/^(\d{1,3})/);
  if (!match) return null;
  const wholePart = match[1].padEnd(3, '0').slice(0, 3);
  const mainClass = Math.floor(Number(wholePart) / 100);
  return DDC_CATEGORIES[mainClass] ?? null;
}

const LANGUAGES = ['Khmer', 'English', 'French'];

function parseAmount(value) {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  if (isNaN(num) || num < 0) throw ApiError.badRequest('amount must be a non-negative number');
  return num;
}

/** GET /api/donations?search=&page=&limit= */
const list = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const { skip, take, page, limit } = getPagination(req.query, 10);

  const where = search
  ? {
      OR: [
        { donor_name: { contains: search } },
        { items: { some: { title: { contains: search } } } },   // was: books
      ],
    }
  : {};

 const [rows, totalItems] = await Promise.all([
  prisma.donations.findMany({
    where,
    include: { users: { select: { first_name: true, last_name: true } }, items: true }, // was: books
    skip,
    take,
    orderBy: { donation_date: 'desc' },
  }),
  prisma.donations.count({ where }),
]);

  res.json({ success: true, data: rows, meta: buildMeta(page, limit, totalItems) });
});

/** GET /api/donations/:id */
const getOne = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const donation = await prisma.donations.findUnique({
  where: { donation_id: id },
  include: { users: { select: { first_name: true, last_name: true } }, items: true }, // was: books
});
  if (!donation) throw ApiError.notFound('Donation not found');
  res.json({ success: true, data: donation });
});

/**
 * POST /api/donations
 * Body: {
 *   donorName?, amount?, donationDate?,
 *   items?: [{ title, author, deweyCode, section?, quantity? }],
 *   fileToInventory?: boolean,
 *   language?
 * }
 */
const create = asyncHandler(async (req, res) => {
  const { donorName, amount, donationDate, items, fileToInventory, language } = req.body;
  if (!req.user?.userId) throw ApiError.unauthorized('Must be logged in as staff to record a donation');

  const itemList = Array.isArray(items) ? items : [];
  itemList.forEach((item) => {
    if (!item.title || !item.author || !item.deweyCode) {
      throw ApiError.badRequest('Each donated book needs a title, author, and Dewey code');
    }
  });

  if (fileToInventory && itemList.length > 0) {
    if (!language || !LANGUAGES.includes(language)) {
      throw ApiError.badRequest(`language must be one of: ${LANGUAGES.join(', ')} when filing donated books into inventory`);
    }
  }

  const parsedAmount = parseAmount(amount);

  const result = await prisma.$transaction(async (tx) => {
    const donation = await tx.donations.create({
      data: {
        donor_name: donorName || 'Anonymous',
        received_by: req.user.userId,
        amount: parsedAmount,
        ...(donationDate ? { donation_date: new Date(donationDate) } : {}),
      },
    });

    if (itemList.length > 0) {
      await tx.donation_items.createMany({
        data: itemList.map((item) => ({
          donation_id: donation.donation_id,
          title: item.title,
          author: item.author,
          dewey_code: item.deweyCode,
          section: item.section || null,
        })),
      });
    }

    let filedBooks = [];
    if (fileToInventory && itemList.length > 0) {
      filedBooks = await Promise.all(
        itemList.map((item) => {
          const copies = Math.max(1, Number(item.quantity) || 1);
          return tx.books.create({
            data: {
              title: item.title,
              author: item.author,
              dewey_code: item.deweyCode,
              language,
              category: categoryFromDeweyCode(item.deweyCode) || 'General',
              section: item.section || null,
              total_copies: copies,
              available_copies: copies,
              is_borrowable: true,
            },
          });
        })
      );
    }

    return { donation, filedBooks };
  });

  const full = await prisma.donations.findUnique({
  where: { donation_id: result.donation.donation_id },
  include: { users: { select: { first_name: true, last_name: true } }, items: true }, // was: books
});

  await logAction({
    userId: req.user.userId,
    action: 'CREATE',
    tableName: 'donations',
    recordId: result.donation.donation_id,
    req,
    details: { donorName: full.donor_name, itemCount: itemList.length, filedToInventory: !!fileToInventory },
  });

  // --- AUTOMATIC NOTIFICATION FOR NEW DONATION ---
  await notify({
    title: 'Donation Received',
    message: `A donation from ${full.donor_name} was recorded${itemList.length ? ` (${itemList.length} book${itemList.length > 1 ? 's' : ''})` : ''}.`,
  });

  res.status(201).json({ success: true, data: full, filedBookCount: result.filedBooks.length });
});

/** PUT /api/donations/:id - edits donor/amount info only, not line items */
const update = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const { donorName, amount } = req.body;

  const donation = await prisma.donations.update({
    where: { donation_id: id },
    data: {
      ...(donorName !== undefined ? { donor_name: donorName } : {}),
      ...(amount !== undefined ? { amount: parseAmount(amount) } : {}),
    },
    include: { items: true },
  });

  await logAction({ userId: req.user?.userId, action: 'UPDATE', tableName: 'donations', recordId: id, req });

  // --- AUTOMATIC NOTIFICATION FOR DONATION UPDATE ---
  await notify({
    title: 'Donation Updated',
    message: `The donation record for ${donation.donor_name} was updated.`,
  });

  res.json({ success: true, data: donation });
});

/**
 * DELETE /api/donations/:id
 * donation_items cascade-delete with their parent (onDelete: Cascade in
 * schema.prisma). Books already filed into inventory are NOT linked back
 * and are unaffected.
 */
const remove = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw ApiError.badRequest('Invalid ID format');

  const existing = await prisma.donations.findUnique({ where: { donation_id: id } });
  if (!existing) throw ApiError.notFound('Donation not found');

  await prisma.donations.delete({ where: { donation_id: id } });
  await logAction({ userId: req.user?.userId, action: 'DELETE', tableName: 'donations', recordId: id, req });

  // --- AUTOMATIC NOTIFICATION FOR DONATION DELETION ---
  await notify({
    title: 'Donation Removed',
    message: `The donation record from ${existing.donor_name} was deleted.`,
  });

  res.json({ success: true, message: 'Donation deleted' });
});

/** POST /api/donations/:id/items */
const addItem = asyncHandler(async (req, res) => {
  const donationId = Number(req.params.id);
  if (isNaN(donationId)) throw ApiError.badRequest('Invalid ID format');

  const { title, author, deweyCode, section } = req.body;
  if (!title || !author || !deweyCode) {
    throw ApiError.badRequest('title, author, and deweyCode are required');
  }

  const existing = await prisma.donations.findUnique({ where: { donation_id: donationId } });
  if (!existing) throw ApiError.notFound('Donation not found');

  const item = await prisma.donation_items.create({
    data: { donation_id: donationId, title, author, dewey_code: deweyCode, section: section || null },
  });

  res.status(201).json({ success: true, data: item });
});

/** PUT /api/donations/items/:itemId */
const updateItem = asyncHandler(async (req, res) => {
  const itemId = Number(req.params.itemId);
  if (isNaN(itemId)) throw ApiError.badRequest('Invalid ID format');

  const { title, author, deweyCode, section } = req.body;

  const item = await prisma.donation_items.update({
    where: { item_id: itemId },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(author !== undefined ? { author } : {}),
      ...(deweyCode !== undefined ? { dewey_code: deweyCode } : {}),
      ...(section !== undefined ? { section: section || null } : {}),
    },
  });

  res.json({ success: true, data: item });
});

/** DELETE /api/donations/items/:itemId */
const removeItem = asyncHandler(async (req, res) => {
  const itemId = Number(req.params.itemId);
  if (isNaN(itemId)) throw ApiError.badRequest('Invalid ID format');

  await prisma.donation_items.delete({ where: { item_id: itemId } });
  res.json({ success: true, message: 'Donation item removed' });
});

module.exports = { list, getOne, create, update, remove, addItem, updateItem, removeItem };