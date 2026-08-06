const prisma = require('../lib/prisma');

/**
 * Writes a row to `system_logs`. Never throws - logging must not break the
 * actual request. Call this "fire and forget" (no await required, but you
 * can await it if you want to guarantee ordering in tests).
 *
 * @param {object} params
 * @param {number|null} params.userId   - staff user id performing the action (from req.user)
 * @param {string} params.action        - short verb, e.g. "CREATE", "UPDATE", "DELETE", "LOGIN"
 * @param {string} params.tableName     - table affected, e.g. "books"
 * @param {number|null} [params.recordId]
 * @param {string|object|null} [params.details]
 * @param {import('express').Request} [params.req] - used to pull the IP address
 */
async function logAction({ userId = null, action, tableName, recordId = null, details = null, req = null }) {
  try {
    const ip = req ? req.ip || req.connection?.remoteAddress || null : null;
    await prisma.system_logs.create({
      data: {
        user_id: userId,
        action,
        table_name: tableName,
        record_id: recordId,
        details: typeof details === 'string' ? details : details ? JSON.stringify(details) : null,
        ip_address: ip,
      },
    });
  } catch (err) {
    // Don't let audit-logging failures break the actual API call.
    console.error('[logAction] failed to write system_logs entry:', err.message);
  }
}

module.exports = logAction;
