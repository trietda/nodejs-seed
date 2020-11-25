const faker = require('faker');
const NestedError = require('./nestedError');

describe('NestedError', () => {
  it('should init with correct message', () => {
    const nestedError = new NestedError('error');

    expect(nestedError.message).toBe('error');
  });

  it('should init with correct message and additional data', () => {
    const error = new Error('another error');
    const otherData = {
      reason: faker.lorem.sentence(),
    };
    const nestedError = new NestedError('error', {
      cause: error,
      data: otherData,
    });

    expect(nestedError.message).toBe('error');
    expect(nestedError.cause).toBe(error);

    Object.entries(otherData, ([key, value]) => {
      expect(nestedError).toHaveProperty(key, value);
    });
  });
});
