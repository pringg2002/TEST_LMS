// Small SQL helpers shared by every model. Table/column names passed in are code constants
// (never user input); VALUES always go through "?" placeholders.
const db = require('../db');

// pick(req.body, ['title','description']) -> only the listed keys that are not undefined.
function pick(obj, keys) {
  const out = {};
  for (const k of keys) if (obj && obj[k] !== undefined) out[k] = obj[k];
  return out;
}

// updateById('modules', 'module_id', 5, { title: 'New' }, ['title', 'description'])
// Updates only whitelisted columns that are present. Returns affected rows (0 if nothing to update).
async function updateById(table, pk, id, fields, allowed) {
  const keys = Object.keys(fields).filter((k) => allowed.includes(k) && fields[k] !== undefined);
  if (!keys.length) return 0;
  const set = keys.map((k) => `${k} = ?`).join(', ');
  const [result] = await db.query(`UPDATE ${table} SET ${set} WHERE ${pk} = ?`, [
    ...keys.map((k) => fields[k]),
    id,
  ]);
  return result.affectedRows;
}

async function deleteById(table, pk, id) {
  const [result] = await db.query(`DELETE FROM ${table} WHERE ${pk} = ?`, [id]);
  return result.affectedRows;
}

// Converts a JS Date / ISO string to MySQL DATETIME ('YYYY-MM-DD HH:MM:SS'), or null.
// Uses LOCAL time on purpose: mysql2 writes/reads Date objects in local time and MySQL's NOW() uses the
// server's time zone, so a UTC string here would shift every due date by the UTC offset (8 h in the Philippines).
const pad = (n) => String(n).padStart(2, '0');
function toMysqlDate(value) {
  if (value === undefined || value === null || value === '') return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined; // caller turns undefined into a 400
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

module.exports = { pick, updateById, deleteById, toMysqlDate };
