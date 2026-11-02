// Role names must match the rows in the `roles` table (see database/seed.sql).
const ROLES = Object.freeze({
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
});

const isValidRole = (name) => Object.values(ROLES).includes(name);

module.exports = { ROLES, isValidRole };
