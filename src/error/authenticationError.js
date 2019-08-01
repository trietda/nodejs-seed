const NestedError = require('./nestedError');

module.exports = class AuthenticationError extends NestedError {
  constructor(message, { cause, data } = {}) {
    super(message, {
      cause,
      data,
    });
  }
};
