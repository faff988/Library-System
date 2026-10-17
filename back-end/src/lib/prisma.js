const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const env = require('../../config/env');

const globalForPrisma = globalThis;

const dbUrl = new URL(env.databaseUrl);

const isLocal = ['localhost', '127.0.0.1'].includes(dbUrl.hostname);

const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: dbUrl.port ? Number(dbUrl.port) : 3306,
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.slice(1),
  connectionLimit: 5,
  ssl: isLocal ? undefined : { rejectUnauthorized: false },
  connectTimeout: 20000,
  acquireTimeout: 30000,
  allowPublicKeyRetrieval: true,
});

const prisma =
  globalForPrisma.__prisma ||
  new PrismaClient({
    adapter,
    log: ['error', 'warn'],
  });

// Simple connection check
prisma.$connect()
  .then(() => {
    console.log('✅ Prisma Client connected successfully.');
  })
  .catch((err) => {
    console.error('❌ PRISMA CONNECTION FAILURE:', err.message);
  });

if (!env.isProduction) {
  globalForPrisma.__prisma = prisma;
}

module.exports = prisma;