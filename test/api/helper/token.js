const jwt = require('jsonwebtoken');
const config = require('config');
const { RefreshToken } = require('../../../src/database');

const JWT_SECRET = config.get('jwt.secret');

module.exports = class TestTokenFactory {
  static async generateRefreshToken(user) {
    return RefreshToken.query().insert({ userId: user.id });
  }

  static async generateAccessToken(user, refreshToken) {
    const permissions = user.role.permissions.map((permission) => permission.name);

    return jwt.sign(
      {
        permissions,
        refreshTokenId: refreshToken.id,
      },
      JWT_SECRET,
      { subject: user.id },
    );
  }
};
