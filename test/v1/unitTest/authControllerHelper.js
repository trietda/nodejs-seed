const httpMock = require('node-mocks-http');
const { expect } = require('chai');
const AuthControllerHelper = require('../../../src/api/v1/auth/authControllerHelper');
const AuthenticationError = require('../../../src/error/authenticationError');

describe('AuthControllerHelper', () => {
  describe('#getBearerToken()', () => {
    it('should get bearer token from header', () => {
      const token = 'fakeToken';

      const req = httpMock.createRequest({
        headers: { authorization: `Bearer ${token}` },
      });

      const resultToken = AuthControllerHelper.getBearerToken(req);

      expect(resultToken).to.equal(token);
    });

    it('should throw error with missing authorization header', () => {
      const req = httpMock.createRequest();

      const badCall = AuthControllerHelper.getBearerToken.bind(null, req);

      expect(badCall).to.throw(AuthenticationError, 'Missing \'Authorization\' header');
    });

    it('should throw error with invalid authorization header format', () => {
      const token = 'fakeToken';

      const req = httpMock.createRequest({
        headers: { authorization: `Invalid ${token}` },
      });

      const badCall = AuthControllerHelper.getBearerToken.bind(null, req);

      expect(badCall).to.throw(AuthenticationError, 'Invalid \'Authorization\' header');
    });

    it('should throw error with empty token', () => {
      const token = '';

      const req = httpMock.createRequest({
        headers: { authorization: `Invalid ${token}` },
      });

      const badCall = AuthControllerHelper.getBearerToken.bind(null, req);

      expect(badCall).to.throw(AuthenticationError, 'Invalid \'Authorization\' header');
    });
  });
});
