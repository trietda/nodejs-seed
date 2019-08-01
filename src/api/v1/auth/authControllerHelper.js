const { AuthenticationError } = require('../../../error');
const Regex = require('../../../util/regex');
const AuthErrorMessage = require('./authErrorMessage');

module.exports = {
  getBearerToken(req) {
    const authHeader = req.header('authorization');
    if (!authHeader) {
      throw new AuthenticationError(AuthErrorMessage.MISSING_AUTH_HEADER);
    }

    const bearerRegexResult = Regex.Bearer.exec(authHeader);
    if (!bearerRegexResult || !bearerRegexResult[1]) {
      throw new AuthenticationError(AuthErrorMessage.INVALID_AUTH_HEADER);
    }

    return bearerRegexResult[1];
  },
};
