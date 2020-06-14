const { promisify } = require('util');
const config = require('config');
const jwt = require('jsonwebtoken');
const { compare } = require('bcrypt');
const { AuthenticationError } = require('../../../error');
const { User, RefreshToken, BlacklistToken } = require('../../../model');
const { getUser } = require('../user/user.service');
const AuthErrorMessage = require('./authErrorMessage');

const JWT_SECRET = config.get('jwt.secret');
const JWT_EXPIRE_TIME = parseInt(config.get('jwt.expireTime'), 10);

const generateAccessToken = async function generateAccessToken(user, refreshToken) {
  const payload = {
    permissions: user.role.permissions.map((permission) => permission.name),
  };

  if (refreshToken) {
    payload.refreshTokenId = refreshToken.id;
  }

  // https://github.com/auth0/node-jsonwebtoken
  const options = {
    expiresIn: JWT_EXPIRE_TIME,
    subject: refreshToken.user.id,
  };

  return promisify(jwt.sign)(payload, JWT_SECRET, options);
};

const generateRefreshToken = async function generateRefreshToken(user) {
  const result = await RefreshToken
    .query()
    .insertGraph([
      {
        user: {
          id: user.id,
        },
      },
    ], {
      relate: true,
    });

  return result[0];
};

module.exports = {
  async login(username, password) {
    const user = await User.query().findOne({ username });

    if (!user) {
      throw new AuthenticationError(AuthErrorMessage.INVALID_CREDENTIAL);
    }

    const isValidPassword = await compare(password, user.password);

    if (!isValidPassword) {
      throw new AuthenticationError(AuthErrorMessage.INVALID_CREDENTIAL);
    }

    await user.$query().patch({ lastLogin: new Date() });

    return user;
  },

  async validateToken(accessToken) {
    try {
      const decodedToken = await promisify(jwt.verify)(accessToken, JWT_SECRET);

      const blacklistTokenCount = await BlacklistToken.query()
        .findById(decodedToken.refreshTokenId)
        .resultSize();

      if (blacklistTokenCount > 0) {
        throw new Error('refreshToken has been blacklisted');
      }

      return decodedToken;
    } catch (err) {
      throw new AuthenticationError(AuthErrorMessage.INVALID_ACCESS_TOKEN, { cause: err });
    }
  },

  async generateToken(user) {
    let userWithDetail = user;

    if (!user.role || !user.role.permissions) {
      userWithDetail = await getUser(user.id);
    }

    const refreshToken = await generateRefreshToken(userWithDetail);
    const accessToken = await generateAccessToken(userWithDetail, refreshToken);

    return {
      accessToken,
      refreshToken: refreshToken.token,
    };
  },

  async logout(accessToken) {
    await RefreshToken
      .query()
      .findById(accessToken.refreshTokenId)
      .delete();
  },

  async refreshToken(token, userId) {
    const refreshToken = await RefreshToken
      .query()
      .findOne({
        token,
        userId,
      })
      .eager('user.[role.[permissions]]');

    if (!refreshToken) {
      throw new AuthenticationError(AuthErrorMessage.INVALID_REFRESH_TOKEN);
    }

    const accessToken = await generateAccessToken(refreshToken.user, refreshToken);

    return {
      accessToken,
      refreshToken: token,
    };
  },
};
