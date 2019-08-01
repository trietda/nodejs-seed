const NestedError = require('./nestedError');

module.exports = class BreakError extends NestedError {
  constructor(error) {
    super('Exceed maximum retry', {
      cause: error,
    });
  }
};
