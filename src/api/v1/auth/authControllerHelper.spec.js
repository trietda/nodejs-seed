const httpMock = require('node-mocks-http');
const AuthControllerHelper = require('./authControllerHelper');
const AuthenticationError = require('../../../error/authenticationError');

describe('AuthControllerHelper', () => {
  describe('#getBearerToken()', () => {
    it('should get bearer token from header', () => {
      const token = 'fakeToken';
      const req = httpMock.createRequest({
        headers: { authorization: `Bearer ${token}` },
      });
      const resultToken = AuthControllerHelper.getBearerToken(req);

      expect(resultToken).toBe(token);
    });

    it('should throw error with missing authorization header', () => {
      const req = httpMock.createRequest();
      const badCall = AuthControllerHelper.getBearerToken.bind(null, req);

      expect(badCall).toThrow(AuthenticationError);
    });

    it('should throw error with invalid authorization header format', () => {
      const token = 'fakeToken';
      const req = httpMock.createRequest({
        headers: { authorization: `Invalid ${token}` },
      });
      const badCall = AuthControllerHelper.getBearerToken.bind(null, req);

      expect(badCall).toThrow(AuthenticationError);
    });

    it('should throw error with empty token', () => {
      const token = '';
      const req = httpMock.createRequest({
        headers: { authorization: `Invalid ${token}` },
      });
      const badCall = AuthControllerHelper.getBearerToken.bind(null, req);

      expect(badCall).toThrow(AuthenticationError);
    });
  });
});
