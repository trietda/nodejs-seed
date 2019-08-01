const NestedError = require('./nestedError');

const DEFAULT_MESSAGE = 'One or more input are invalid';

module.exports = class ValidationError extends NestedError {
  constructor(message = DEFAULT_MESSAGE, detail, { cause } = {}) {
    super(message, {
      cause,
      data: { detail },
    });
  }

  static fromAjvError(ajvErrors) {
    const errorDetail = ajvErrors.reduce((prev, error) => {
      const dataPath = error.keyword === 'required'
        ? error.params.missingProperty
        : error.dataPath;

      const message = error.keyword === 'required'
        ? 'missing required property'
        : error.message;

      return ({
        ...prev,
        [dataPath]: message,
      });
    }, {});

    return new ValidationError(null, errorDetail, { cause: ajvErrors });
  }
};
