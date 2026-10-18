const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({
    host: 'mysql-550fc69-khema9278-3c65.f.aivencloud.com',
    port: 19523,
    user: 'avnadmin',
    password: process.env.AIVEN_PW,
    database: 'defaultdb',
    ssl: { rejectUnauthorized: false },
  });
  const [rows] = await conn.query(
    `SELECT u.email, u.permissions, u.permission_overrides, r.role_name
     FROM users u JOIN roles r ON r.role_id = u.role_id
     WHERE r.role_name <> 'Admin'`
  );
  console.dir(rows, { depth: null });
  await conn.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
