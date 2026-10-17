require('dotenv').config();
const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const routes = require('./src/routes');
const notFound = require('./src/middleware/notFound');
const errorHandler = require('./src/middleware/errorHandler');
const { baseUploadsDir } = require('./src/middleware/upload');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  env.corsOrigin,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (curl, mobile apps, direct tools)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// Serves the shared uploads folder (same one upload.js writes to)
app.use(
  '/uploads',
  express.static(baseUploadsDir, {
    setHeaders: (res) => res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'),
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = env.port || 5000;

app.get('/health', (req, res) =>
  res.json({ success: true, message: 'API is up', time: new Date().toISOString() })
);

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Siem Reap Bannalay Library API listening on http://localhost:${PORT}`);
  console.log(`Health check:            http://localhost:${PORT}/health`);
  console.log(`API base:                http://localhost:${PORT}/api`);
  console.log(`Serving uploads from:    ${baseUploadsDir}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ CRITICAL UNHANDLED REJECTION AT:', promise, 'REASON:', reason);
});

process.on('uncaughtException', (error) => {
  console.error(`❌ CRITICAL UNCAUGHT EXCEPTION: ${error.message}`);
  console.error(error.stack);
});

module.exports = app;