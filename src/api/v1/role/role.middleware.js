const { AuthorizationError } = require('../../../error');
const { makePermissionName, can } = require('./role.service');

module.exports = {
  authorization(resource, action) {
    return function authorizationMiddleware(req, res, next) {
      const { accessToken } = req.locals;

      const permission = makePermissionName(resource, action);

      if (!can(accessToken, permission)) {
        throw new AuthorizationError();
      }

      next();
    };
  },
};
