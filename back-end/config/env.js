require('dotenv').config();

const env = {
  databaseUrl: process.env.DATABASE_URL,
  port: process.env.PORT || 3306,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  isProduction: process.env.NODE_ENV === 'production'
};

module.exports = env;