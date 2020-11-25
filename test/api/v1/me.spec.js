const bcrypt = require('bcrypt');
const request = require('supertest');
const faker = require('faker');
const core = require('../../../src/core');
const TestUserFactory = require('../helper/user');
const TestRoleFactory = require('../helper/role');
const TestTokenFactory = require('../helper/token');
const userDataSchema = require('../schema/user');

describe('Me endpoints', () => {
  let app;
  let user;
  let role;

  beforeAll(() => {
    app = core.createApp();
  });

  beforeEach(async () => {
    role = await TestRoleFactory.addRole({ name: 'admin' });
    user = await TestUserFactory.addUser({ role });
  });

  describe('GET /api/v1/me', () => {
    describe('without access token', () => {
      it('should return 401', async () => {
        const res = await await request(app).get('/api/v1/me');

        expect(res.status).toBe(401);
      });
    });

    describe('with access token', () => {
      let accessToken;

      beforeEach(async () => {
        const refreshToken = await TestTokenFactory.generateRefreshToken(user);
        accessToken = await TestTokenFactory.generateAccessToken(user, refreshToken);
      });

      it('should return user data', async () => {
        const res = await request(app)
          .get('/api/v1/me')
          .set('authorization', `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchSchema(userDataSchema);
        expect(res.body).toMatchObject({
          id: user.id,
          username: user.username,
          email: user.email,
          role: {
            id: role.id,
            name: role.name,
            permissions: expect.any(Array),
          },
        });
      });
    });
  });

  describe('PATCH /api/v1/me', () => {
    describe('without access token', () => {
      it('should return 401', async () => {
        const res = await request(app).patch('/api/v1/me');

        expect(res.status).toBe(401);
      });
    });

    describe('with access token', () => {
      let accessToken;

      beforeEach(async () => {
        const refreshToken = await TestTokenFactory.generateRefreshToken(user);
        accessToken = await TestTokenFactory.generateAccessToken(user, refreshToken);
      });

      it('should update user data', async () => {
        const newData = {
          email: faker.internet.email(),
          username: faker.internet.userName(),
          password: 'newPassword',
        };

        const res = await request(app)
          .patch('/api/v1/me')
          .set('authorization', `Bearer ${accessToken}`)
          .send(newData);

        expect(res.status).toBe(204);
        const updatedUser = await TestUserFactory.getUser(user.id);
        expect(updatedUser.email).toBe(newData.email);
        expect(updatedUser.username).toBe(newData.username);
        const isSamePassword = await bcrypt.compare(newData.password, updatedUser.password);
        expect(isSamePassword).toBeTruthy();
      });
    });
  });
});
