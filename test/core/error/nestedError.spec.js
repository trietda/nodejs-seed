const faker = require('faker');
const { expect } = require('chai');
const NestedError = require('../../../src/error/nestedError');

describe('NestedError', () => {
  it('should init with correct message', () => {
    const nestedError = new NestedError('error');

    expect(nestedError.message).to.equal('error');
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

    expect(nestedError.message).to.equal('error');
    expect(nestedError.cause).to.equal(error);

    Object.entries(otherData, ([key, value]) => {
      expect(nestedError).to.have.property(key, value);
    });
  });
});
