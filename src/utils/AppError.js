// Throw this anywhere (service/controller); errorHandler turns it into the standard JSON response.
//   throw new AppError('Module not found', 404);
class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors; // optional: field-level validation messages
  }
}

module.exports = AppError;
