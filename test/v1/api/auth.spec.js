const chai = require('chai');
const chaiDatetime = require('chai-datetime');
const request = require('supertest');
const faker = require('faker');
const app = require('../../setup/app');
const { addUser, getUser } = require('../helper/user');
const { addRole } = require('../helper/role');

chai.use(chaiDatetime);

const { expect } = chai;

describe('Authentication endpoints', () => {
  describe('POST /api/v1/auth/sessions', () => {
    let user;
    let role;

    beforeEach(async () => {
      role = await addRole({
        name: 'admin',
        permissions: [],
      });
      user = await addUser({
        email: faker.internet.email(),
        username: faker.internet.userName(),
        password: 'password',
        roleId: role.id,
      });
    });

    it('should return access token and refresh token when login with valid credential', async () => {
      expect(user.lastLogin).to.be.undefined;

      const res = await request(app)
        .post('/api/v1/auth/sessions')
        .send({
          username: user.username,
          password: 'password',
        })
        .expect(200);

      expect(res.body).to.have.property('accessToken');
      expect(res.body).to.have.property('refreshToken');

      const updatedUser = await getUser(user.id);

      const now = new Date();
      const fiveSecAgo = new Date(now);
      fiveSecAgo.setSeconds(now.getSeconds() - 5);

      expect(updatedUser.lastLogin).to.withinDate(fiveSecAgo, now);
    });

    it('should return 400 when login without required params', async () => {
      const res = await request(app)
        .post('/api/v1/auth/sessions')
        .send({
          username: user.username,
        })
        .expect(400);

      expect(res.body).to.have.property('message', 'One or more inputs are invalid');
      expect(res.body).to.have.nested.property('detail.password', 'missing required property');
    });

    it('should return 401 when login with invalid password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/sessions')
        .send({
          username: user.username,
          password: 'wrongPassword',
        })
        .expect(401);

      expect(res.body).to.have.property('message', 'Invalid username or password');
    });

    it('should return 401 when login with invalid username', async () => {
      const res = await request(app)
        .post('/api/v1/auth/sessions')
        .send({
          username: 'notexist',
          password: 'password',
        })
        .expect(401);

      expect(res.body).to.have.property('message', 'Invalid username or password');
    });
  });

  describe('DELETE /api/v1/auth/sessions', () => {
    let user;
    let role;
    let accessToken;
    let refreshToken;

    beforeEach(async () => {
      role = await addRole({ name: 'admin' });
      user = await addUser({ roleId: role.id });

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
      await request(app)
        .delete('/api/v1/auth/sessions')
        .set('authorization', `Bearer ${accessToken}`)
        .expect(204);

      await request(app)
        .post('/api/v1/auth/accessTokens')
        .set('authorization', `Bearer ${refreshToken}`)
        .send({ userId: user.id })
        .expect(401);
    });

    it('should not invalid refresh token if using invalid access token', async () => {
      await request(app)
        .delete('/api/v1/auth/sessions')
        .set('authorization', 'Bearer invalidAccessToken')
        .expect(401);

      await request(app)
        .post('/api/v1/auth/accessTokens')
        .set('authorization', `Bearer ${refreshToken}`)
        .send({ userId: user.id })
        .expect(201);
    });
  });

  describe('POST /api/v1/auth/accessTokens', () => {
    let user;
    let role;
    let refreshToken;

    beforeEach(async () => {
      role = await addRole({ name: 'admin' });
      user = await addUser({ roleId: role.id });

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

    it('should generate new access token when using valid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/accessTokens')
        .set('authorization', `Bearer ${refreshToken}`)
        .send({ userId: user.id })
        .expect(201);

      expect(res.body).to.have.property('accessToken');
    });

    it('should return 401 when using invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/accessTokens')
        .set('authorization', 'Bearer invalidRefreshToken')
        .send({ userId: user.id })
        .expect(401);

      expect(res.body).to.have.property('message', 'Invalid token');
    });
  });
});
