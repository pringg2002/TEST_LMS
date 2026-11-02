const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const express = require('express');
const cors = require('cors');
const config = require('./lib/config');
const db = require('./db');
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// CORS: needed only when the frontend is served from a DIFFERENT origin than this API
// (e.g. VS Code Live Server on :5500). Files placed in /public are same-origin and need no CORS.
app.use(cors(config.corsOrigins.length ? { origin: config.corsOrigins } : undefined));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api', routes);

// Order matters: 404 first, error handler LAST.
app.use('/api', notFound);
app.use(errorHandler);

// Only listen when run directly (lets tests import `app`).
if (require.main === module) {
  const useHttps = Boolean(config.https.keyPath && config.https.certPath);
  let server;
  if (useHttps) {
    server = https.createServer(
      { key: fs.readFileSync(config.https.keyPath), cert: fs.readFileSync(config.https.certPath) },
      app
    );
  } else {
    server = http.createServer(app);
  }

  db.query('SELECT 1')
    .then(() => console.log(`[db] Connected to ${config.db.database} on ${config.db.host}:${config.db.port}`))
    .catch((err) => console.error('[db] Connection FAILED:', err.message))
    .finally(() => {
      server.listen(config.port, () =>
        console.log(`Server running at ${useHttps ? 'https' : 'http'}://localhost:${config.port}`)
      );
    });
}

module.exports = app;
