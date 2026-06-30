// env.js
require('dotenv').config(); // Loads the variables from the .env file

const env = {
  databaseUrl: process.env.DATABASE_URL,
  port: process.env.PORT || 3306,
  jwtSecret: process.env.JWT_SECRET,
  isProduction: process.env.NODE_ENV === 'production'
};

module.exports = env;