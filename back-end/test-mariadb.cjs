require('dotenv').config();
const mariadb = require('mariadb');
const u = new URL(process.env.DATABASE_URL);
(async () => {
  try {
    const c = await mariadb.createConnection({
      host: u.hostname, port: Number(u.port),
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.slice(1),
      ssl: { rejectUnauthorized: false },
      connectTimeout: 20000,
    });
    console.log('OK', await c.query('SELECT COUNT(*) AS n FROM users'));
    await c.end();
  } catch (e) { console.error('FAILED:', e.code, e.message); }
})();
