const faker = require('faker');
const HttpError = require('./httpError');

describe('HttpError', () => {
  it('should init with correct message', () => {
    const nestedError = new HttpError({ message: 'error' });

    expect(nestedError.message).toBe('error');
    expect(nestedError.statusCode).toBe(500);
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

    expect(nestedError.message).toBe('error');
    expect(nestedError.statusCode).toBe(400);
    expect(nestedError.cause).toBe(error);

    Object.entries(otherData, ([key, value]) => {
      expect(nestedError).toHaveProperty(key, value);
    });
  });
});
