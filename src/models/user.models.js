// Model = SQL only. No business rules, no req/res here.
const db = require('../db');

// Public columns (never includes password_hash). The JOIN supplies the role name as `role`.
const PUBLIC_SELECT = `
  SELECT u.user_id, u.role_id, r.role_name AS role, u.first_name, u.last_name,
         u.email, u.status, u.created_at, u.updated_at
  FROM users u
  INNER JOIN roles r ON r.role_id = u.role_id`;

async function findAll() {
  const [rows] = await db.query(`${PUBLIC_SELECT} ORDER BY u.user_id`);
  return rows;
}

// Students only - lets instructors find a student's id (to enroll or unlock them) without seeing admins.
async function findStudents() {
  const [rows] = await db.query(`${PUBLIC_SELECT} WHERE r.role_name = 'student' AND u.status = 'active' ORDER BY u.last_name, u.first_name`);
  return rows;
}

async function findById(userId) {
  const [rows] = await db.query(`${PUBLIC_SELECT} WHERE u.user_id = ?`, [userId]);
  return rows[0] || null;
}

// Includes password_hash - ONLY for login checks. Never send this row to a client.
async function findByEmailWithPassword(email) {
  const [rows] = await db.query(
    `SELECT u.user_id, u.role_id, r.role_name AS role, u.first_name, u.last_name,
            u.email, u.password_hash, u.status
     FROM users u INNER JOIN roles r ON r.role_id = u.role_id
     WHERE u.email = ?`,
    [email]
  );
  return rows[0] || null;
}

// Includes password_hash - ONLY for password-change checks.
async function findByIdWithPassword(userId) {
  const [rows] = await db.query('SELECT user_id, password_hash FROM users WHERE user_id = ?', [userId]);
  return rows[0] || null;
}

async function create({ role_id, first_name, last_name, email, password_hash, status = 'active' }) {
  const [result] = await db.query(
    `INSERT INTO users (role_id, first_name, last_name, email, password_hash, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [role_id, first_name, last_name, email, password_hash, status]
  );
  return result.insertId;
}

// Updates only whitelisted columns that are present in `fields`.
const UPDATABLE = ['role_id', 'first_name', 'last_name', 'email', 'password_hash', 'status'];

async function update(userId, fields) {
  const keys = Object.keys(fields).filter((k) => UPDATABLE.includes(k));
  if (!keys.length) return 0;
  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const [result] = await db.query(`UPDATE users SET ${setClause} WHERE user_id = ?`, [
    ...keys.map((k) => fields[k]),
    userId,
  ]);
  return result.affectedRows;
}

async function remove(userId) {
  const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [userId]);
  return result.affectedRows;
}

// REPORT 1 - Student Roles: users INNER JOIN roles.
// INNER JOIN because every user must have a role (role_id is NOT NULL + FK),
// and we only want rows where both sides match.
async function getUsersWithRolesReport() {
  const [rows] = await db.query(
    `SELECT u.user_id,
            CONCAT(u.first_name, ' ', u.last_name) AS full_name,
            u.email,
            r.role_name AS role,
            u.status,
            u.created_at
     FROM users u
     INNER JOIN roles r ON u.role_id = r.role_id
     ORDER BY r.role_name, u.last_name, u.first_name`
  );
  return rows;
}

module.exports = {
  findAll,
  findStudents,
  findById,
  findByEmailWithPassword,
  findByIdWithPassword,
  create,
  update,
  remove,
  getUsersWithRolesReport,
};
