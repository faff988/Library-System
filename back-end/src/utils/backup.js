const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const { spawn } = require('child_process');
const env = require('../../config/env');

const BACKUP_DIR = path.join(__dirname, '../../backups');
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

// Overridable via env vars — many local setups (esp. XAMPP on Windows)
// don't put mysqldump/mysql on PATH by default.
const MYSQLDUMP_BIN = process.env.MYSQLDUMP_PATH || 'mysqldump';
const MYSQL_BIN = process.env.MYSQL_PATH || 'mysql';

// Only this exact shape is ever accepted as a real backup filename —
// blocks path traversal and shell metacharacters entirely, everywhere
// a filename comes in from a request.
const SAFE_FILENAME = /^backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.sql$/;

function parseDbConfig() {
  const url = new URL(env.databaseUrl);
  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
  };
}

// Credentials go into a short-lived, 0600-permission file instead of a
// CLI argument, so the password never shows up in `ps aux`.
function writeTempDefaultsFile(dbConfig) {
  const tmpPath = path.join(os.tmpdir(), `db-creds-${crypto.randomBytes(8).toString('hex')}.cnf`);
  const contents = `[client]\nhost=${dbConfig.host}\nport=${dbConfig.port}\nuser=${dbConfig.user}\npassword=${dbConfig.password}\n`;
  fs.writeFileSync(tmpPath, contents, { mode: 0o600 });
  return tmpPath;
}

function isValidBackupFilename(filename) {
  return typeof filename === 'string' && SAFE_FILENAME.test(filename);
}

function listBackups() {
  return fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => SAFE_FILENAME.test(f))
    .map((f) => {
      const stat = fs.statSync(path.join(BACKUP_DIR, f));
      return { filename: f, sizeBytes: stat.size, createdAt: stat.birthtime };
    })
    .sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * --routines and --triggers are essential: after_book_borrow,
 * after_book_return, set_member_expiration, and the feedback triggers
 * are plain MySQL routines, invisible to Prisma. A dump without these
 * flags would restore a database that's missing the logic that makes
 * borrowing/returns/expirations actually work.
 */
function createBackup() {
  return new Promise((resolve, reject) => {
    const dbConfig = parseDbConfig();
    const cnfPath = writeTempDefaultsFile(dbConfig);
    const filename = `backup-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.sql`;
    const outPath = path.join(BACKUP_DIR, filename);
    const outStream = fs.createWriteStream(outPath);

    const child = spawn(MYSQLDUMP_BIN, [
      `--defaults-extra-file=${cnfPath}`,
      '--single-transaction',
      '--routines',
      '--triggers',
      dbConfig.database,
    ]);

    child.stdout.pipe(outStream);

    let stderr = '';
    child.stderr.on('data', (d) => { stderr += d.toString(); });

    child.on('error', (err) => {
      fs.unlink(cnfPath, () => {});
      reject(new Error(`Failed to start mysqldump - is it installed and on PATH? (${err.message})`));
    });

    child.on('close', (code) => {
      fs.unlink(cnfPath, () => {});
      if (code !== 0) {
        fs.unlink(outPath, () => {});
        return reject(new Error(stderr || `mysqldump exited with code ${code}`));
      }
      resolve({ filename, sizeBytes: fs.statSync(outPath).size });
    });
  });
}

/** Overwrites the current database with the contents of a backup file.
 * Destructive - anything created or changed since that backup was taken
 * is lost. */
function restoreBackup(filename) {
  return new Promise((resolve, reject) => {
    if (!isValidBackupFilename(filename)) return reject(new Error('Invalid backup filename'));
    const filePath = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(filePath)) return reject(new Error('Backup file not found'));

    const dbConfig = parseDbConfig();
    const cnfPath = writeTempDefaultsFile(dbConfig);
    const inStream = fs.createReadStream(filePath);

    const child = spawn(MYSQL_BIN, [`--defaults-extra-file=${cnfPath}`, dbConfig.database]);

    inStream.pipe(child.stdin);

    let stderr = '';
    child.stderr.on('data', (d) => { stderr += d.toString(); });

    child.on('error', (err) => {
      fs.unlink(cnfPath, () => {});
      reject(new Error(`Failed to start mysql - is it installed and on PATH? (${err.message})`));
    });

    child.on('close', (code) => {
      fs.unlink(cnfPath, () => {});
      if (code !== 0) return reject(new Error(stderr || `mysql restore exited with code ${code}`));
      resolve();
    });
  });
}

function deleteBackup(filename) {
  if (!isValidBackupFilename(filename)) throw new Error('Invalid backup filename');
  const filePath = path.join(BACKUP_DIR, filename);
  if (!fs.existsSync(filePath)) throw new Error('Backup file not found');
  fs.unlinkSync(filePath);
}

function getBackupPath(filename) {
  if (!isValidBackupFilename(filename)) return null;
  const filePath = path.join(BACKUP_DIR, filename);
  return fs.existsSync(filePath) ? filePath : null;
}

module.exports = { BACKUP_DIR, listBackups, createBackup, restoreBackup, deleteBackup, getBackupPath, isValidBackupFilename };