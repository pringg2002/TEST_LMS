-- Roles only. Run AFTER schema.sql:  mysql -u root -p lms_final_database < database/seed.sql
-- The full sample data (users, courses, quizzes, ...) is inserted by:  npm run seed
-- (users need bcrypt-hashed passwords, which Node creates).
USE lms_database;

INSERT INTO roles (role_id, role_name, description) VALUES
  (1, 'admin',      'Full system access'),
  (2, 'instructor', 'Creates and manages courses'),
  (3, 'student',    'Enrolls in courses and learns')
ON DUPLICATE KEY UPDATE description = VALUES(description);
