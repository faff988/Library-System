// const prisma = require('../lib/prisma');
// const ApiError = require('../utils/ApiError');
// const asyncHandler = require('../utils/asyncHandler');
// const logAction = require('../utils/logAction');

// // Singleton row - the app only ever reads/writes setting_id = 1.
// const SETTINGS_ID = 1;

// /** GET /api/library-config */
// const getConfig = asyncHandler(async (req, res) => {
//   let settings = await prisma.library_settings.findUnique({ where: { setting_id: SETTINGS_ID } });

//   // Self-heals if the seed row is ever missing (e.g. fresh DB).
//   if (!settings) {
//     settings = await prisma.library_settings.create({ data: { setting_id: SETTINGS_ID } });
//   }

//   res.json({ success: true, data: settings });
// });

// /**
//  * PUT /api/library-config
//  * Body: { maxBooksPerMember, borrowDurationDays, renewalLimit, finePerDay }
//  */
// const updateConfig = asyncHandler(async (req, res) => {
//   const { maxBooksPerMember, borrowDurationDays, renewalLimit, finePerDay } = req.body;

//   if (
//     maxBooksPerMember === undefined ||
//     borrowDurationDays === undefined ||
//     renewalLimit === undefined ||
//     finePerDay === undefined
//   ) {
//     throw ApiError.badRequest(
//       'maxBooksPerMember, borrowDurationDays, renewalLimit, and finePerDay are all required'
//     );
//   }

//   const maxBooks = Number(maxBooksPerMember);
//   const borrowDays = Number(borrowDurationDays);
//   const renewals = Number(renewalLimit);
//   const fine = Number(finePerDay);

//   if ([maxBooks, borrowDays, renewals, fine].some((n) => Number.isNaN(n))) {
//     throw ApiError.badRequest('All settings must be valid numbers');
//   }
//   if (!Number.isInteger(maxBooks) || maxBooks < 1) {
//     throw ApiError.badRequest('Max books per member must be a whole number of at least 1');
//   }
//   if (!Number.isInteger(borrowDays) || borrowDays < 1) {
//     throw ApiError.badRequest('Borrow duration must be a whole number of at least 1 day');
//   }
//   if (!Number.isInteger(renewals) || renewals < 0) {
//     throw ApiError.badRequest('Renewal limit must be a whole number of 0 or more');
//   }
//   if (fine < 0) {
//     throw ApiError.badRequest('Late fine per day cannot be negative');
//   }

//   const settings = await prisma.library_settings.upsert({
//     where: { setting_id: SETTINGS_ID },
//     update: {
//       max_books_per_member: maxBooks,
//       borrow_duration_days: borrowDays,
//       renewal_limit: renewals,
//       fine_per_day: fine,
//     },
//     create: {
//       setting_id: SETTINGS_ID,
//       max_books_per_member: maxBooks,
//       borrow_duration_days: borrowDays,
//       renewal_limit: renewals,
//       fine_per_day: fine,
//     },
//   });

//   await logAction({
//     userId: req.user?.userId,
//     action: 'UPDATE_LIBRARY_SETTINGS',
//     tableName: 'library_settings',
//     recordId: settings.setting_id,
//     req,
//     details: {
//       maxBooksPerMember: maxBooks,
//       borrowDurationDays: borrowDays,
//       renewalLimit: renewals,
//       finePerDay: fine,
//     },
//   });

//   res.json({ success: true, data: settings });
// });

// module.exports = { getConfig, updateConfig };

const prisma = require('../lib/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logAction = require('../utils/logAction');

// library_settings is a fixed singleton row (setting_id always 1).
const SETTINGS_ID = 1;

async function getOrCreateSettings() {
  let settings = await prisma.library_settings.findUnique({ where: { setting_id: SETTINGS_ID } });
  if (!settings) {
    settings = await prisma.library_settings.create({ data: { setting_id: SETTINGS_ID } });
  }
  return settings;
}

const getConfig = asyncHandler(async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json({ success: true, data: settings });
});

const updateConfig = asyncHandler(async (req, res) => {
  const { maxBooksPerMember, borrowDurationDays, renewalLimit, finePerDay } = req.body;

  const data = {};
  if (maxBooksPerMember !== undefined) {
    const n = Number(maxBooksPerMember);
    if (!Number.isInteger(n) || n < 1) throw ApiError.badRequest('maxBooksPerMember must be a positive integer');
    data.max_books_per_member = n;
  }
  if (borrowDurationDays !== undefined) {
    const n = Number(borrowDurationDays);
    if (!Number.isInteger(n) || n < 1) throw ApiError.badRequest('borrowDurationDays must be a positive integer');
    data.borrow_duration_days = n;
  }
  if (renewalLimit !== undefined) {
    const n = Number(renewalLimit);
    if (!Number.isInteger(n) || n < 0) throw ApiError.badRequest('renewalLimit must be a non-negative integer');
    data.renewal_limit = n;
  }
  if (finePerDay !== undefined) {
    const n = Number(finePerDay);
    if (isNaN(n) || n < 0) throw ApiError.badRequest('finePerDay must be a non-negative number');
    data.fine_per_day = n;
  }

  await getOrCreateSettings();
  const settings = await prisma.library_settings.update({ where: { setting_id: SETTINGS_ID }, data });

  await logAction({ userId: req.user?.userId, action: 'UPDATE', tableName: 'library_settings', recordId: SETTINGS_ID, req, details: data });
  res.json({ success: true, data: settings });
});

module.exports = { getConfig, updateConfig };