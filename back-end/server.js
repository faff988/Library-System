const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const routes = require('./src/routes');
const notFound = require('./src/middleware/notFound');
const errorHandler = require('./src/middleware/errorHandler');
const path = require('path');

const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  env.corsOrigin
].filter(Boolean);

app.use(
  cors({
    origin: function(origin, callback){
      if(!origin) return callback(null,true);
      if(allowedOrigins.includes(origin) || allowedOrigins.includes('*')){
        return callback(null, true);
      }
      return
    }
  })
)

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or direct tools)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => res.json({ success: true, message: 'API is up', time: new Date().toISOString() }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(env.port || 3306, () => {
  console.log(`Siem Reap Bannalay Library API listening on http://localhost:${env.port || 3306}`);
  console.log(`Health check:            http://localhost:${env.port || 3306}/health`);
  console.log(`API base:                http://localhost:${env.port || 3306}/api`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ CRITICAL UNHANDLED REJECTION AT:', promise, 'REASON:', reason);
});

process.on('uncaughtException', (error) => {
  console.error(`❌ CRITICAL UNCAUGHT EXCEPTION: ${error.message}`);
  console.error(error.stack);
});



module.exports = app;
