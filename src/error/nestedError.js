module.exports = class NestedError extends Error {
  constructor(message, { cause, data } = {}) {
    super(message);

    this.name = this.constructor.name;
    this.cause = cause;
    Object.assign(this, data);

    Error.captureStackTrace(this, this.constructor);
  }
};
