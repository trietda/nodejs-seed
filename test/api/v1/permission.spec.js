const request = require('supertest');
const core = require('../../../src/core');
const TestPermissionFactory = require('../helper/permission');
const TestTokenFactory = require('../helper/token');
const TestUserFactory = require('../helper/user');
const TestRoleFactory = require('../helper/role');
const createArrayResponseSchema = require('../schema/arrayResponse');
const permissionSchema = require('../schema/permission');

describe('Permission endpoint', () => {
  let app;

  beforeAll(() => {
    app = core.createApp();
  });

  describe('GET /api/v1/permissions', () => {
    let permissions;

    beforeEach(async () => {
      permissions = await TestPermissionFactory.addManyPermissions(3);
    });

    describe('without access token', () => {
      it('should return 401 when not provide access token', async () => {
        const res = await request(app).get('/api/v1/permissions');

        expect(res.status).toBe(401);
      });
    });

    describe('with access token that does not has permission named "permission:read"', () => {
      let accessToken;

      beforeEach(async () => {
        const role = await TestRoleFactory.addRole({
          permissions: ['mockPermissions'],
        });
        const user = await TestUserFactory.addUser({ role });
        const refreshToken = await TestTokenFactory.generateRefreshToken(user);
        accessToken = await TestTokenFactory.generateAccessToken(user, refreshToken);
      });

      it('should return 403', async () => {
        const res = await request(app)
          .get('/api/v1/permissions')
          .set('authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(403);
      });
    });

    describe('with access token that has permission named "permission:read"', () => {
      let accessToken;

      beforeEach(async () => {
        const role = await TestRoleFactory.addRole({
          permissions: ['permission:read'],
        });
        const user = await TestUserFactory.addUser({ role });
        const refreshToken = await TestTokenFactory.generateRefreshToken(user);
        accessToken = await TestTokenFactory.generateAccessToken(user, refreshToken);
      });

      it('should return list of all permissions', async () => {
        const responseSchema = createArrayResponseSchema(permissionSchema, true);

        const res = await request(app)
          .get('/api/v1/permissions')
          .set('authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchSchema(responseSchema);
        expect(res.body.results).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: 'permission:read' }),
            expect.objectContaining({ name: permissions[0].name }),
            expect.objectContaining({ name: permissions[1].name }),
            expect.objectContaining({ name: permissions[2].name }),
          ]),
        );
      });
    });
  });
});
