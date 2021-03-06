module.exports = function asyncRoute(handler) {
  return async function asyncHandler(req, res, next) {
    try {
      await handler(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};
