// Wraps async controllers so rejected promises reach errorHandler (no try/catch needed).
//   router.get('/', asyncHandler(controller.list));
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
