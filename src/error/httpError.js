const NestedError = require('./nestedError');

module.exports = class HttpError extends NestedError {
  constructor({ statusCode = 500, message }, { cause, data } = {}) {
    super(message, {
      cause,
      data: {
        ...data,
        statusCode,
      },
    });
  }
};
