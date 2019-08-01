const faker = require('faker');
const { expect } = require('chai');
const HttpError = require('../../../src/error/httpError');

describe('HttpError', () => {
  it('should init with correct message', () => {
    const nestedError = new HttpError({ message: 'error' });

    expect(nestedError.message).to.equal('error');
    expect(nestedError.statusCode).to.equal(500);
  });

  it('should init with correct message, status code, and additional data', () => {
    const error = new Error('another error');
    const otherData = {
      reason: faker.lorem.sentence(),
    };
    const nestedError = new HttpError({
      statusCode: 400,
      message: 'error',
    }, {
      cause: error,
      data: otherData,
    });

    expect(nestedError.message).to.equal('error');
    expect(nestedError.statusCode).to.equal(400);
    expect(nestedError.cause).to.equal(error);

    Object.entries(otherData, ([key, value]) => {
      expect(nestedError).to.have.property(key, value);
    });
  });
});
