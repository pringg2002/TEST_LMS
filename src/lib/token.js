const jwt = require('jsonwebtoken');
const config = require('./config');

// Payload kept small on purpose: user_id + role. Fresh user data is loaded in middleware/auth.js.
const signToken = (user) =>
  jwt.sign({ user_id: user.user_id, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });

// Throws JsonWebTokenError / TokenExpiredError when invalid.
const verifyToken = (token) => jwt.verify(token, config.jwt.secret);

module.exports = { signToken, verifyToken };
