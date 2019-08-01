const Ajv = require('ajv');
const ajvError = require('ajv-errors');
const { ValidationError } = require('../error');

const ajv = new Ajv({
  allErrors: true,
});

ajvError(ajv);

module.exports = class ApiService {
  static validate(schema, data) {
    const validate = ajv.compile(schema);
    const isValid = validate(data);

    if (!isValid) {
      throw ValidationError.fromAjvError(validate.errors);
    }
  }
};
