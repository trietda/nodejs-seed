const NestedError = require('./nestedError');

module.exports = class AuthorizeError extends NestedError {
  constructor(message, { cause, data } = {}) {
    super(message, {
      cause,
      data,
    });
  }
};
