const sinon = require('sinon');
const chai = require('chai');
const httpMocks = require('node-mocks-http');
const handler = require('../../../src/core/app/unexpectedError');

const { expect } = chai;

describe('UnexpectedErrorHandler', () => {
  describe('with not production environment', () => {
    before(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should return with error detail', () => {
      const errMessage = 'Test error';
      const err = new Error(errMessage);
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const next = sinon.stub();

      handler(err, req, res, next);

      expect(res.statusCode).to.equal(500);
      expect(res._getJSONData()).to.have.property('message', errMessage); // eslint-disable-line no-underscore-dangle
    });
  });

  describe('with production environment', () => {
    before(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should return with error detail', () => {
      const errMessage = 'Test error';
      const err = new Error(errMessage);
      const req = httpMocks.createRequest();
      const res = httpMocks.createResponse();
      const next = sinon.stub();

      handler(err, req, res, next);

      expect(res.statusCode).to.equal(500);
      expect(res._getJSONData()).to.have.property('message', 'Unexpected error'); // eslint-disable-line no-underscore-dangle
    });
  });
});
