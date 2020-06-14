const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const config = require('config');
const { RefreshToken } = require('../../../src/database');
const { addUser } = require('./user');
const { addRole } = require('./role');

const JWT_SECRET = config.get('jwt.secret');

module.exports = class AccessTokenFactory {
  static async generateAccessToken(permissions = [], userId, refreshTokenId) {
    let newUser;
    if (!userId) {
      const role = await addRole();
      newUser = await addUser({ roleId: role.id });
    }

    const newRefreshToken = !refreshTokenId
      ? await RefreshToken.query().insert({ userId: userId || newUser.id })
      : null;

    return promisify(jwt.sign)({
      permissions,
      refreshTokenId: refreshTokenId || newRefreshToken.id,
    }, JWT_SECRET, { subject: userId || newUser.id });
  }
};
