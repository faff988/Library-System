const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const routes = require('./src/routes');
const notFound = require('./src/middleware/notFound');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => res.json({ success: true, message: 'API is up', time: new Date().toISOString() }));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Siem Reap Bannalay Library API listening on http://localhost:${env.port}`);
  console.log(`Health check:            http://localhost:${env.port}/health`);
  console.log(`API base:                http://localhost:${env.port}/api`);
});

module.exports = app;
