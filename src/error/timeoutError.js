const NestedError = require('./nestedError');

module.exports = class TimeoutError extends NestedError {
  constructor(timeout) {
    super(`Action exceeds ${timeout}`);
  }
};
