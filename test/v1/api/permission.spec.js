const { expect } = require('chai');
const request = require('supertest');
const app = require('../../setup/app');
const { addManyPermissions } = require('../helper/permission');
const { generateAccessToken } = require('../helper/accessToken');

describe('Permission endpoint', () => {
  describe('GET /api/v1/permissions', () => {
    beforeEach(async () => {
      await addManyPermissions(3);
    });

    describe('without access token', () => {
      it('should return 401 when not provide access token', async () => {
        await request(app)
          .get('/api/v1/permissions')
          .expect(401);
      });
    });

    describe('with access token that does not has permission named "permission:read"', () => {
      let accessToken;

      before(async () => {
        accessToken = await generateAccessToken([]);
      });

      it('should return 403', async () => {
        await request(app)
          .get('/api/v1/permissions')
          .set('authorization', `Bearer ${accessToken}`)
          .expect(403);
      });
    });

    describe('with access token that has permission named "permission:read"', () => {
      let accessToken;

      before(async () => {
        accessToken = await generateAccessToken(['permission:read']);
      });

      it('should return list of all permissions', async () => {
        const res = await request(app)
          .get('/api/v1/permissions')
          .set('authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(res.body).to.be.an('array').with.lengthOf(3);
      });
    });
  });
});
