const authErrorMessage = {
  INVALID_CREDENTIAL: 'Invalid username or password',
  INVALID_REFRESH_TOKEN: 'Invalid token',
  INVALID_ACCESS_TOKEN: 'Invalid token',
  MISSING_AUTH_HEADER: 'Missing \'Authorization\' header',
  INVALID_AUTH_HEADER: 'Invalid \'Authorization\' header',
};

module.exports = Object.freeze(authErrorMessage);
