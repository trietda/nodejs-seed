const request = require('supertest');
const faker = require('faker');
const core = require('../../../src/core');
const TestRoleFactory = require('../helper/role');
const TestUserFactory = require('../helper/user');
const TestTokenFactory = require('../helper/token');
const createArrayResponseSchema = require('../schema/arrayResponse');
const roleSchema = require('../schema/role');

describe('Role endpoints', () => {
  let app;

  beforeAll(() => {
    app = core.createApp();
  });

  describe('GET /api/v1/roles', () => {
    let roles;

    beforeEach(async () => {
      roles = await TestRoleFactory.addManyRole(3);
    });

    describe('without access token', () => {
      it('should return 401', async () => {
        const res = await request(app).get('/api/v1/roles');

        expect(res.status).toBe(401);
      });
    });

    describe('with access token that does not has permission named "role:read"', () => {
      let accessToken;

      beforeEach(async () => {
        const adminRole = await TestRoleFactory.addRole({
          name: 'admin',
          permissions: ['mockPermission'],
        });
        const user = await TestUserFactory.addUser({ role: adminRole });
        const refreshToken = await TestTokenFactory.generateRefreshToken(user);
        accessToken = await TestTokenFactory.generateAccessToken(user, refreshToken);
      });

      it('should return 403', async () => {
        const res = await request(app)
          .get('/api/v1/roles')
          .set('authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(403);
      });
    });

    describe('with access token that has permission named "role:read"', () => {
      let accessToken;

      beforeEach(async () => {
        const adminRole = await TestRoleFactory.addRole({
          name: 'admin',
          permissions: ['role:read'],
        });
        const user = await TestUserFactory.addUser({ role: adminRole });
        const refreshToken = await TestTokenFactory.generateRefreshToken(user);
        accessToken = await TestTokenFactory.generateAccessToken(user, refreshToken);
      });

      it('should return list of role', async () => {
        const responseSchema = createArrayResponseSchema(roleSchema, true);

        const res = await request(app)
          .get('/api/v1/roles')
          .set('authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchSchema(responseSchema);
        expect(res.body.results).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: 'admin' }),
            expect.objectContaining({ name: roles[0].name }),
            expect.objectContaining({ name: roles[1].name }),
            expect.objectContaining({ name: roles[2].name }),
          ]),
        );
      });
    });
  });

  describe('GET /api/v1/roles/:roleId', () => {
    let role;

    beforeEach(async () => {
      role = await TestRoleFactory.addRole({
        permissions: ['permissions1', 'permissions2'],
      });
    });

    describe('without access token', () => {
      it('should return 401', async () => {
        const res = await request(app)
          .get(`/api/v1/roles/${role.id}`);

        expect(res.status).toBe(401);
      });
    });

    describe('with access token that does not has permission named "role:read"', () => {
      let accessToken;

      beforeEach(async () => {
        const adminRole = await TestRoleFactory.addRole({
          name: 'admin',
          permissions: ['mockPermission'],
        });
        const user = await TestUserFactory.addUser({ role: adminRole });
        const refreshToken = await TestTokenFactory.generateRefreshToken(user);
        accessToken = await TestTokenFactory.generateAccessToken(user, refreshToken);
      });

      it('should return 403', async () => {
        const res = await request(app)
          .get(`/api/v1/roles/${role.id}`)
          .set('authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(403);
      });
    });

    describe('with access token that has permission named "role:read"', () => {
      let accessToken;

      beforeEach(async () => {
        const adminRole = await TestRoleFactory.addRole({
          name: 'admin',
          permissions: ['role:read'],
        });
        const user = await TestUserFactory.addUser({ role: adminRole });
        const refreshToken = await TestTokenFactory.generateRefreshToken(user);
        accessToken = await TestTokenFactory.generateAccessToken(user, refreshToken);
      });

      it('should return role data', async () => {
        const res = await request(app)
          .get(`/api/v1/roles/${role.id}`)
          .set('authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchSchema(roleSchema);
        expect(res.body).toMatchObject({
          id: role.id,
          name: role.name,
          permissions: expect.arrayContaining(
            role.permissions.map((permission) => expect.objectContaining({
              id: permission.id,
              name: permission.name,
            })),
          ),
        });
      });

      it('should return 404 with invalid role id', async () => {
        const res = await request(app)
          .get('/api/v1/roles/invalid')
          .set('authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ message: 'Resource not found' });
      });
    });
  });

  describe('POST /api/v1/roles', () => {
    describe('without access token', () => {
      it('should return 401', async () => {
        const res = await request(app).post('/api/v1/roles');

        expect(res.status).toBe(401);
      });
    });

    describe('with access token that does not has permission named "role:write"', () => {
      let accessToken;

      beforeEach(async () => {
        const adminRole = await TestRoleFactory.addRole({
          name: 'admin',
          permissions: ['mockPermission'],
        });
        const user = await TestUserFactory.addUser({ role: adminRole });
        const refreshToken = await TestTokenFactory.generateRefreshToken(user);
        accessToken = await TestTokenFactory.generateAccessToken(user, refreshToken);
      });

      it('should return 403', async () => {
        const res = await request(app)
          .post('/api/v1/roles')
          .set('authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(403);
      });
    });

    describe('with access token that has permission named "role:write"', () => {
      let accessToken;

      beforeEach(async () => {
        const adminRole = await TestRoleFactory.addRole({
          name: 'admin',
          permissions: ['role:write'],
        });
        const user = await TestUserFactory.addUser({ role: adminRole });
        const refreshToken = await TestTokenFactory.generateRefreshToken(user);
        accessToken = await TestTokenFactory.generateAccessToken(user, refreshToken);
      });

      it('should add new role', async () => {
        const fakeRoleData = {
          name: faker.lorem.word(),
          permissions: [],
        };
        const res = await request(app)
          .post('/api/v1/roles')
          .set('authorization', `Bearer ${accessToken}`)
          .send(fakeRoleData);

        expect(res.status).toBe(201);
        expect(res.body).toMatchSchema(roleSchema);
        expect(res.body).toMatchObject(fakeRoleData);
      });

      it('should return 400 with invalid permissions', async () => {
        const fakeRoleData = {
          name: faker.lorem.word(),
          permissions: ['invalid'],
        };
        const res = await request(app)
          .post('/api/v1/roles')
          .set('authorization', `Bearer ${accessToken}`)
          .send(fakeRoleData);

        expect(res.status).toBe(400);
        expect(res.body).toMatchObject({ message: 'Invalid permission' });
      });

      it('should return 400 with duplicated permissions', async () => {
        const fakeRoleData = {
          name: faker.lorem.word(),
          permissions: ['duplicated', 'duplicated'],
        };
        const res = await request(app)
          .post('/api/v1/roles')
          .set('authorization', `Bearer ${accessToken}`)
          .send(fakeRoleData);

        expect(res.status).toBe(400);
        expect(res.body).toMatchObject({ message: 'Duplicated permission' });
      });

      describe('with existed role named "duplicated"', () => {
        beforeEach(async () => {
          await TestRoleFactory.addRole({ name: 'duplicated' });
        });

        it('should return 400 when add duplicated role', async () => {
          const fakeRoleData = {
            name: 'duplicated',
            permissions: [],
          };
          const res = await request(app)
            .post('/api/v1/roles')
            .set('authorization', `Bearer ${accessToken}`)
            .send(fakeRoleData);

          expect(res.status).toBe(400);
        });
      });
    });
  });

  describe('PATCH /api/v1/roles', () => {
    let role;

    beforeEach(async () => {
      role = await TestRoleFactory.addRole();
    });

    describe('without access token', () => {
      it('should return 401', async () => {
        const res = await request(app).patch(`/api/v1/roles/${role.id}`);

        expect(res.status).toBe(401);
      });
    });

    describe('with access token that does not has permission named "role:write"', () => {
      let accessToken;

      beforeEach(async () => {
        const adminRole = await TestRoleFactory.addRole({
          name: 'admin',
          permissions: ['mockPermission'],
        });
        const user = await TestUserFactory.addUser({ role: adminRole });
        const refreshToken = await TestTokenFactory.generateRefreshToken(user);
        accessToken = await TestTokenFactory.generateAccessToken(user, refreshToken);
      });

      it('should return 403', async () => {
        const res = await request(app)
          .patch(`/api/v1/roles/${role.id}`)
          .set('authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(403);
      });
    });

    describe('with access token that has permission named "role:write"', () => {
      let accessToken;

      beforeEach(async () => {
        const adminRole = await TestRoleFactory.addRole({
          name: 'admin',
          permissions: ['role:write'],
        });
        const user = await TestUserFactory.addUser({ role: adminRole });
        const refreshToken = await TestTokenFactory.generateRefreshToken(user);
        accessToken = await TestTokenFactory.generateAccessToken(user, refreshToken);
      });

      it('should update role', async () => {
        const updatedRoleData = {
          name: faker.lorem.word(),
          permissions: [],
        };
        const res = await request(app)
          .patch(`/api/v1/roles/${role.id}`)
          .set('authorization', `Bearer ${accessToken}`)
          .send(updatedRoleData);

        expect(res.status).toBe(204);
        const updatedRole = await TestRoleFactory.getRole(role.id);
        expect(updatedRole).toMatchObject({ name: updatedRoleData.name });
      });
    });
  });

  describe('DELETE /api/v1/roles', () => {
    let role;

    beforeEach(async () => {
      role = await TestRoleFactory.addRole();
    });

    describe('without access token', () => {
      it('should return 401', async () => {
        const res = await request(app).patch(`/api/v1/roles/${role.id}`);

        expect(res.status).toBe(401);
      });
    });

    describe('with access token that does not has permission named "role:write"', () => {
      let accessToken;

      beforeEach(async () => {
        const adminRole = await TestRoleFactory.addRole({
          name: 'admin',
          permissions: ['mockPermission'],
        });
        const user = await TestUserFactory.addUser({ role: adminRole });
        const refreshToken = await TestTokenFactory.generateRefreshToken(user);
        accessToken = await TestTokenFactory.generateAccessToken(user, refreshToken);
      });

      it('should return 403', async () => {
        const res = await request(app)
          .delete(`/api/v1/roles/${role.id}`)
          .set('authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(403);
      });
    });

    describe('with access token that has permission named "role:write"', () => {
      let accessToken;

      beforeEach(async () => {
        const adminRole = await TestRoleFactory.addRole({
          name: 'admin',
          permissions: ['role:write'],
        });
        const user = await TestUserFactory.addUser({ role: adminRole });
        const refreshToken = await TestTokenFactory.generateRefreshToken(user);
        accessToken = await TestTokenFactory.generateAccessToken(user, refreshToken);
      });

      it('should delete role', async () => {
        const res = await request(app)
          .delete(`/api/v1/roles/${role.id}`)
          .set('authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(204);
        const deletedRole = await TestRoleFactory.getRole(role.id);
        expect(deletedRole).toBeUndefined();
      });
    });
  });
});
