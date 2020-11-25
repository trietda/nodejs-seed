const bcrypt = require('bcrypt');
const request = require('supertest');
const faker = require('faker');
const core = require('../../../src/core');
const TestRoleFactory = require('../helper/role');
const TestUserFactory = require('../helper/user');
const TestTokenFactory = require('../helper/token');
const createArrayResponseSchema = require('../schema/arrayResponse');
const userSchema = require('../schema/user');

describe('User endpoints', () => {
  let app;

  beforeAll(() => {
    app = core.createApp();
  });

  describe('GET /api/v1/users', () => {
    describe('without access token', () => {
      it('should return 401', async () => {
        const res = await request(app).get('/api/v1/users');

        expect(res.status).toBe(401);
      });
    });

    describe('without access token with permission named "user:read"', () => {
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
          .get('/api/v1/users')
          .set('authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(403);
      });
    });

    describe('with access token with permission named "user:read"', () => {
      let accessToken;
      let users;

      beforeEach(async () => {
        const [adminRole, userRole] = await Promise.all([
          TestRoleFactory.addRole({
            name: 'admin',
            permissions: ['user:read'],
          }),
          TestRoleFactory.addRole(),
        ]);
        users = await Promise.all([
          await TestUserFactory.addUser({ role: adminRole }),
          await TestUserFactory.addUser({ role: userRole }),
          await TestUserFactory.addUser({
            role: userRole,
            status: 'disabled',
          }),
        ]);
        const refreshToken = await TestTokenFactory.generateRefreshToken(users[0]);
        accessToken = await TestTokenFactory.generateAccessToken(users[0], refreshToken);
      });

      it('should returns list of users', async () => {
        const responseSchema = createArrayResponseSchema(userSchema, true);

        const res = await request(app)
          .get('/api/v1/users')
          .set('authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchSchema(responseSchema);
        expect(res.body).toMatchObject({
          total: 3,
          results: expect.arrayContaining([
            expect.objectContaining({ id: users[0].id }),
            expect.objectContaining({ id: users[1].id }),
            expect.objectContaining({ id: users[2].id }),
          ]),
        });
      });

      it('should return list of filtered user when provide search param', async () => {
        const searchTerm = users[1].email.slice(0, -2);

        const res = await request(app)
          .get(`/api/v1/users?search=${searchTerm}`)
          .set('authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
          total: 1,
          results: expect.arrayContaining([
            expect.objectContaining({ id: users[1].id }),
          ]),
        });
      });

      it('should return list of filtered user when provide status param', async () => {
        const status = 'active';

        const res = await request(app)
          .get('/api/v1/users')
          .query({ status })
          .set('authorization', `Bearer ${accessToken}`)
          .expect(200);

        const isCorrect = (user) => user.status === status;
        expect(res.body).toMatchObject({
          total: 2,
          results: expect.toSatisfyAll(isCorrect),
        });
      });
    });
  });

  describe('POST /api/v1/users', () => {
    describe('without access token', () => {
      it('should return 401', async () => {
        const res = await request(app).post('/api/v1/users');

        expect(res.status).toBe(401);
      });
    });

    describe('with access token that does not have permission named "user:write"', () => {
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
          .post('/api/v1/users')
          .set('authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(403);
      });
    });

    describe('with access token that has permission named "user:write"', () => {
      let accessToken;
      let role;

      beforeEach(async () => {
        role = await TestRoleFactory.addRole({
          name: 'admin',
          permissions: ['user:write'],
        });
        const user = await TestUserFactory.addUser({ role });
        const refreshToken = await TestTokenFactory.generateRefreshToken(user);
        accessToken = await TestTokenFactory.generateAccessToken(user, refreshToken);
      });

      it('should add new user', async () => {
        const userData = {
          firstName: faker.name.findName(),
          lastName: faker.name.lastName(),
          email: faker.internet.email(),
          username: faker.internet.userName(),
          password: 'password',
          role: role.id,
        };
        const res = await request(app)
          .post('/api/v1/users')
          .set('authorization', `Bearer ${accessToken}`)
          .send(userData);

        expect(res.status).toBe(201);
        expect(res.body).toMatchSchema(userSchema);
        expect(res.body).toMatchObject({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          username: userData.username,
          role: { id: role.id },
        });
      });
    });
  });

  describe('GET /api/v1/users/:userId', () => {
    let role;
    let user;

    beforeEach(async () => {
      role = await TestRoleFactory.addRole();
      user = await TestUserFactory.addUser({ role });
    });

    describe('without access token', () => {
      it('should return 401', async () => {
        const res = await request(app).get(`/api/v1/users/${user.id}`);

        expect(res.status).toBe(401);
      });
    });

    describe('with access token that does not have permission named "user:read"', () => {
      let accessToken;

      beforeEach(async () => {
        const adminRole = await TestRoleFactory.addRole({
          name: 'admin',
          permissions: ['mockPermission'],
        });
        const admin = await TestUserFactory.addUser({ role: adminRole });
        const refreshToken = await TestTokenFactory.generateRefreshToken(admin);
        accessToken = await TestTokenFactory.generateAccessToken(admin, refreshToken);
      });

      it('should return 403', async () => {
        const res = await request(app)
          .get(`/api/v1/users/${user.id}`)
          .set('authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(403);
      });
    });

    describe('with access token that has permission named "user:read"', () => {
      let accessToken;

      beforeEach(async () => {
        const adminRole = await TestRoleFactory.addRole({
          name: 'admin',
          permissions: ['user:read'],
        });
        const admin = await TestUserFactory.addUser({ role: adminRole });
        const refreshToken = await TestTokenFactory.generateRefreshToken(admin);
        accessToken = await TestTokenFactory.generateAccessToken(admin, refreshToken);
      });

      it('should return user data', async () => {
        const res = await request(app)
          .get(`/api/v1/users/${user.id}`)
          .set('authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchSchema(userSchema);
        expect(res.body).toMatchObject({
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: expect.toBeOneOf([user.firstName, null]),
          lastName: expect.toBeOneOf([user.lastName, null]),
          status: user.status,
          role: {
            id: user.role.id,
            name: user.role.name,
            permissions: user.role.permissions,
          },
        });
      });
    });
  });

  describe('PATCH /api/v1/users/:userId', () => {
    let user;

    beforeEach(async () => {
      const role = await TestRoleFactory.addRole();
      user = await TestUserFactory.addUser({ role });
    });

    describe('without access token', () => {
      it('should return 401', async () => {
        const res = await request(app).patch(`/api/v1/users/${user.id}`);

        expect(res.status).toBe(401);
      });
    });

    describe('with access token that does not have permission named "user:write"', () => {
      let accessToken;

      beforeEach(async () => {
        const adminRole = await TestRoleFactory.addRole({
          name: 'admin',
          permissions: ['mockPermission'],
        });
        const admin = await TestUserFactory.addUser({ role: adminRole });
        const refreshToken = await TestTokenFactory.generateRefreshToken(admin);
        accessToken = await TestTokenFactory.generateAccessToken(admin, refreshToken);
      });

      it('should return 403', async () => {
        const res = await request(app)
          .patch(`/api/v1/users/${user.id}`)
          .set('authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(403);
      });
    });

    describe('with access token that has permission named "user:write"', () => {
      let accessToken;

      beforeEach(async () => {
        const adminRole = await TestRoleFactory.addRole({
          name: 'admin',
          permissions: ['user:write'],
        });
        const admin = await TestUserFactory.addUser({ role: adminRole });
        const refreshToken = await TestTokenFactory.generateRefreshToken(admin);
        accessToken = await TestTokenFactory.generateAccessToken(admin, refreshToken);
      });

      it('should update user data', async () => {
        const newData = {
          email: faker.internet.email(),
          username: faker.internet.userName(),
          password: 'newPassword',
        };
        const res = await request(app)
          .patch(`/api/v1/users/${user.id}`)
          .set('authorization', `Bearer ${accessToken}`)
          .send(newData);

        expect(res.status).toBe(204);
        const updatedUser = await TestUserFactory.getUser(user.id);
        expect(updatedUser).toMatchObject({
          email: newData.email,
          username: newData.username,
        });
        const isSamePassword = await bcrypt.compare(newData.password, updatedUser.password);
        expect(isSamePassword).toBeTruthy();
      });
    });
  });

  describe('DELETE /api/v1/users/:userId', () => {
    let user;

    beforeEach(async () => {
      const role = await TestRoleFactory.addRole();
      user = await TestUserFactory.addUser({ role });
    });

    describe('without access token', () => {
      it('should return 401', async () => {
        const res = await request(app).delete(`/api/v1/users/${user.id}`);

        expect(res.status).toBe(401);
      });
    });

    describe('with access token that does not have permission named "user:write"', () => {
      let accessToken;

      beforeEach(async () => {
        const adminRole = await TestRoleFactory.addRole({
          name: 'admin',
          permissions: ['mockPermission'],
        });
        const admin = await TestUserFactory.addUser({ role: adminRole });
        const refreshToken = await TestTokenFactory.generateRefreshToken(admin);
        accessToken = await TestTokenFactory.generateAccessToken(admin, refreshToken);
      });

      it('should return 403', async () => {
        const res = await request(app)
          .delete(`/api/v1/users/${user.id}`)
          .set('authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(403);
      });
    });

    describe('with access token that has permission named "user:write"', () => {
      let accessToken;

      beforeEach(async () => {
        const adminRole = await TestRoleFactory.addRole({
          name: 'admin',
          permissions: ['user:write'],
        });
        const admin = await TestUserFactory.addUser({ role: adminRole });
        const refreshToken = await TestTokenFactory.generateRefreshToken(admin);
        accessToken = await TestTokenFactory.generateAccessToken(admin, refreshToken);
      });

      it('should update user data', async () => {
        const res = await request(app)
          .delete(`/api/v1/users/${user.id}`)
          .set('authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(204);
        const updatedUser = await TestUserFactory.getUser(user.id);
        expect(updatedUser).toBeUndefined();
      });
    });
  });

  describe('PUT /api/v1/users/:userId/status', () => {
    let user;

    beforeEach(async () => {
      const role = await TestRoleFactory.addRole();
      user = await TestUserFactory.addUser({ roleId: role.id });
    });

    describe('without access token', () => {
      it('should return 401', async () => {
        const res = await request(app).put(`/api/v1/users/${user.id}/status`);

        expect(res.status).toBe(401);
      });
    });

    describe('with access token that does not have permission named "user:write"', () => {
      let accessToken;

      beforeEach(async () => {
        const adminRole = await TestRoleFactory.addRole({
          name: 'admin',
          permissions: ['mockPermission'],
        });
        const admin = await TestUserFactory.addUser({ role: adminRole });
        const refreshToken = await TestTokenFactory.generateRefreshToken(admin);
        accessToken = await TestTokenFactory.generateAccessToken(admin, refreshToken);
      });

      it('should return 403', async () => {
        const res = await request(app)
          .put(`/api/v1/users/${user.id}/status`)
          .set('authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(403);
      });
    });

    describe('with access token that has permission named "user:write"', () => {
      let accessToken;
      let otherUserAccessToken;

      beforeEach(async () => {
        const adminRole = await TestRoleFactory.addRole({
          name: 'admin',
          permissions: ['user:write'],
        });
        const admin = await TestUserFactory.addUser({ role: adminRole });
        const refreshToken = await TestTokenFactory.generateRefreshToken(admin);
        accessToken = await TestTokenFactory.generateAccessToken(admin, refreshToken);
      });

      it('should update user status', async () => {
        const updateStatusRes = await request(app)
          .put(`/api/v1/users/${user.id}/status`)
          .set('authorization', `Bearer ${accessToken}`)
          .send({ status: 'disabled' });

        expect(updateStatusRes.status).toBe(204);
        const updatedUser = await TestUserFactory.getUser(user.id);
        expect(updatedUser.status).toBe('disabled');
      });

      it('should prevent user from making api call', async () => {
        const updateStatusRes = await request(app)
          .put(`/api/v1/users/${user.id}/status`)
          .set('authorization', `Bearer ${accessToken}`)
          .send({ status: 'disabled' });

        expect(updateStatusRes.status).toBe(204);
        const apiCallRes = await request(app)
          .get('/api/v1/me')
          .set('authorization', `Bearer ${otherUserAccessToken}`);
        expect(apiCallRes.status).toBe(401);
      });

      it('should not archive non-delete user', async () => {
        const res = await request(app)
          .put(`/api/v1/users/${user.id}/status`)
          .set('authorization', `Bearer ${accessToken}`)
          .send({ status: 'archived' });

        expect(res.status).toBe(400);
        expect(res.body).toMatchObject({
          detail: { status: 'can only archive disabled users' },
        });
      });
    });
  });
});
