// Controller = HTTP only: read req, call service, send response. No SQL, no business rules.
const authService = require('../services/auth.service');
const { success, created } = require('../utils/response');

exports.register = async (req, res) => {
  const data = await authService.register(req.body);
  created(res, data, 'Registered successfully');
};

exports.login = async (req, res) => {
  const data = await authService.login(req.body);
  success(res, data, 'Login successful');
};

exports.me = async (req, res) => {
  const user = await authService.me(req.user.user_id);
  success(res, user, 'Current user retrieved successfully');
};
