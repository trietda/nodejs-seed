const NestedError = require('./nestedError');

module.exports = class RetryError extends NestedError {
  constructor(errors) {
    super('Exceed maximum retry', { cause: errors });
  }
};
