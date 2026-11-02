// Shared MySQL connection pool. EVERY model must import this file:
//   const db = require('../db');
//   const [rows] = await db.query('SELECT * FROM modules WHERE id = ?', [id]);
// Always use "?" placeholders - never concatenate user input into SQL.
const mysql = require('mysql2/promise');
const config = require('./lib/config');

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: false,
});

module.exports = pool;
