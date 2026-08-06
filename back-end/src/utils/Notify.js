const prisma = require('../lib/prisma');

/**
 * Creates a staff notification (row in the `notifications` table).
 *
 * This mirrors the pattern already used in borrowRecordsController for
 * borrow/return/overdue notifications, but is shared here so
 * books/members/donations controllers don't each re-implement it.
 *
 * Non-fatal by design: notification creation must never break the
 * underlying create/update/delete request, so any error is swallowed
 * and just logged (same approach as utils/logAction.js).
 *
 * @param {Object} params
 * @param {'User'|'Member'|'All_Staff'} [params.recipientType='All_Staff']
 * @param {number|null} [params.recipientId=null]
 * @param {string} params.title
 * @param {string} params.message
 */
async function notify({ recipientType = 'All_Staff', recipientId = null, title, message }) {
  try {
    await prisma.notifications.create({
      data: {
        recipient_type: recipientType,
        recipient_id: recipientId,
        title,
        message,
      },
    });
  } catch (err) {
    console.warn('⚠️ Non-fatal notification error:', err.message);
  }
}

module.exports = notify;