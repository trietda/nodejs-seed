const request = require('supertest');
const core = require('../../../src/core');
const TestRoleFactory = require('../helper/role');
const TestUserFactory = require('../helper/user');

describe('Authentication endpoints', () => {
  let app;

  beforeAll(() => {
    app = core.createApp();
  });

  describe('POST /api/v1/auth/sessions', () => {
    let user;
    let role;

    beforeEach(async () => {
      role = await TestRoleFactory.addRole({ name: 'admin' });
      user = await TestUserFactory.addUser({ role });
    });

    it('should return access token and refresh token', async () => {
      const responseSchema = {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
        },
        additionalProperties: false,
      };

      const res = await request(app)
        .post('/api/v1/auth/sessions')
        .send({
          username: user.username,
          password: 'password',
        });

      expect(res.status).toBe(200);
      expect(res.body).toMatchSchema(responseSchema);
    });

    it('should update user last login time', async () => {
      const res = await request(app)
        .post('/api/v1/auth/sessions')
        .send({
          username: user.username,
          password: 'password',
        });

      expect(res.status).toBe(200);
      const updatedUser = await TestUserFactory.getUser(user.id);
      expect(+updatedUser.lastLogin).not.toBe(+user.lastLogin);
    });

    it('should return 400 when login without required params', async () => {
      const responseSchema = {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            const: 'One or more inputs are invalid',
          },
          detail: {
            type: 'object',
            properties: {
              password: {
                type: 'string',
                const: 'missing required property',
              },
            },
          },
        },
        additionalProperties: false,
      };

      const res = await request(app)
        .post('/api/v1/auth/sessions')
        .send({ username: user.username });

      expect(res.status).toBe(400);
      expect(res.body).toMatchSchema(responseSchema);
    });

    it('should return 401 when login with invalid password', async () => {
      const responseSchema = {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            const: 'Invalid username or password',
          },
        },
        additionalProperties: false,
      };

      const res = await request(app)
        .post('/api/v1/auth/sessions')
        .send({
          username: user.username,
          password: 'wrongPassword',
        })
        .expect(401);

      expect(res.status).toBe(401);
      expect(res.body).toMatchSchema(responseSchema);
    });

    it('should return 401 when login with invalid username', async () => {
      const responseSchema = {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            const: 'Invalid username or password',
          },
        },
        additionalProperties: false,
      };

      const res = await request(app)
        .post('/api/v1/auth/sessions')
        .send({
          username: 'notexist',
          password: 'password',
        });

      expect(res.status).toBe(401);
      expect(res.body).toMatchSchema(responseSchema);
    });
  });

  describe('DELETE /api/v1/auth/sessions', () => {
    let user;
    let role;
    let accessToken;
    let refreshToken;

    beforeEach(async () => {
      role = await TestRoleFactory.addRole({ name: 'admin' });
      user = await TestUserFactory.addUser({ role });

      const loginResponse = await request(app)
        .post('/api/v1/auth/sessions')
        .send({
          username: user.username,
          password: 'password',
        });

      ({ accessToken, refreshToken } = loginResponse.body);

      if (!accessToken || !refreshToken) {
        throw new Error('Cannot get accessToken and refreshToken');
      }
    });

    it('should invalid refresh token when using valid access token', async () => {
      const logoutResponse = await request(app)
        .delete('/api/v1/auth/sessions')
        .set('authorization', `Bearer ${accessToken}`);
      const refreshAccessTokenResponse = await request(app)
        .post('/api/v1/auth/accessTokens')
        .set('authorization', `Bearer ${refreshToken}`)
        .send({ userId: user.id });

      expect(logoutResponse.status).toBe(204);
      expect(refreshAccessTokenResponse.status).toBe(401);
    });

    it('should return 401 and not invalid refresh token if using invalid access token', async () => {
      const logoutResponse = await request(app)
        .delete('/api/v1/auth/sessions')
        .set('authorization', 'Bearer invalidAccessToken');
      const refreshAccessTokenResponse = await request(app)
        .post('/api/v1/auth/accessTokens')
        .set('authorization', `Bearer ${refreshToken}`)
        .send({ userId: user.id });

      expect(logoutResponse.status).toBe(401);
      expect(refreshAccessTokenResponse.status).toBe(201);
    });
  });

  describe('POST /api/v1/auth/accessTokens', () => {
    let user;
    let role;
    let refreshToken;

    beforeEach(async () => {
      role = await TestRoleFactory.addRole({ name: 'admin' });
      user = await TestUserFactory.addUser({ role });

      const loginResponse = await request(app)
        .post('/api/v1/auth/sessions')
        .send({
          username: user.username,
          password: 'password',
        });

      ({ refreshToken } = loginResponse.body);

      if (!refreshToken) {
        throw new Error('Cannot get accessToken and refreshToken');
      }
    });

    it('should return access token', async () => {
      const responseSchema = {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
        },
        additionalProperties: false,
      };

      const res = await request(app)
        .post('/api/v1/auth/accessTokens')
        .set('authorization', `Bearer ${refreshToken}`)
        .send({ userId: user.id });

      expect(res.status).toBe(201);
      expect(res.body).toMatchSchema(responseSchema);
    });

    it('should return 401 when using invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/accessTokens')
        .set('authorization', 'Bearer invalidRefreshToken')
        .send({ userId: user.id });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid token');
    });
  });
});
