const authService = require('./auth.service');
const { getBearerToken } = require('./authControllerHelper');

module.exports = class AuthMiddleware {
  static async authenticate(req, res, next) {
    if (req.locals && req.locals.accessToken) {
      logger.warn('Duplicated usages of authenticate middleware detected');
    }

    const accessToken = getBearerToken(req);
    const decodedToken = await authService.validateToken(accessToken);

    req.locals = {
      ...req.locals,
      accessToken: decodedToken,
    };

    next();
  }
};
