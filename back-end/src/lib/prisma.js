const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const env = require('../../config/env');

const globalForPrisma = globalThis;

const dbUrl = new URL(env.databaseUrl);

const adapter = new PrismaMariaDb({
  host: dbUrl.hostname,
  port: dbUrl.port ? Number(dbUrl.port) : 3306,
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password),
  database: dbUrl.pathname.slice(1), // strip leading "/"
  connectionLimit: 5,
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