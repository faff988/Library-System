const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logAction = require('../utils/logAction');
const { listBackups, createBackup, restoreBackup, deleteBackup, getBackupPath } = require('../utils/backup');

const list = asyncHandler(async (req, res) => {
  res.json({ success: true, data: listBackups() });
});

const create = asyncHandler(async (req, res) => {
  try {
    const result = await createBackup();
    await logAction({ userId: req.user?.userId, action: 'BACKUP_CREATE', tableName: 'database', req, details: { filename: result.filename } });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.error('Backup creation failed:', err.message);
    throw new ApiError(500, `Failed to create backup: ${err.message}`);
  }
});

const download = asyncHandler(async (req, res) => {
  const filePath = getBackupPath(req.params.filename);
  if (!filePath) throw ApiError.notFound('Backup not found');
  res.download(filePath);
});

const restore = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  if (req.body?.confirm !== true) {
    throw ApiError.badRequest('Restoring overwrites the current database - resend with { "confirm": true } to proceed.');
  }
  try {
    await restoreBackup(filename);
    await logAction({ userId: req.user?.userId, action: 'BACKUP_RESTORE', tableName: 'database', req, details: { filename } });
    res.json({ success: true, message: `Database restored from ${filename}` });
  } catch (err) {
    console.error('Backup restore failed:', err.message);
    throw new ApiError(500, `Failed to restore backup: ${err.message}`);
  }
});

const remove = asyncHandler(async (req, res) => {
  try {
    deleteBackup(req.params.filename);
    await logAction({ userId: req.user?.userId, action: 'BACKUP_DELETE', tableName: 'database', req, details: { filename: req.params.filename } });
    res.json({ success: true, message: 'Backup deleted' });
  } catch (err) {
    throw ApiError.badRequest(err.message);
  }
});

module.exports = { list, create, download, restore, remove };