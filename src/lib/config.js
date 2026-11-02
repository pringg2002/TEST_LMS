const path = require('path');
// Load .env from the project root no matter which folder "node" was started from.
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const config = {
  port: Number(process.env.PORT) || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306, // XAMPP/WAMP: 3306, MAMP: 8889
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lms_final_database',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  // Comma-separated list of frontend origins allowed to call the API, e.g.
  //   CORS_ORIGIN=http://127.0.0.1:5500,http://localhost:5173
  // Leave empty to allow any origin (fine for local development only).
  corsOrigins: (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean),
  // HTTPS is switched on when BOTH files are set (see README "Run over HTTPS").
  https: {
    keyPath: process.env.SSL_KEY_PATH || '',
    certPath: process.env.SSL_CERT_PATH || '',
  },
};

const weakSecret = !config.jwt.secret || config.jwt.secret === 'your_secret_here';
if (weakSecret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set to a long random value when NODE_ENV=production');
  }
  console.warn('[config] WARNING: set a real JWT_SECRET in your .env file.');
  config.jwt.secret = config.jwt.secret || 'dev_only_insecure_secret';
}

module.exports = config;
