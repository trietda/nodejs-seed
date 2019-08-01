const { expect } = require('chai');
const bcrypt = require('bcrypt');
const request = require('supertest');
const faker = require('faker');
const app = require('../../setup/app');
const { addUser, getUser } = require('../helper/user');
const { addRole } = require('../helper/role');
const { generateAccessToken } = require('../helper/accessToken');

describe('Me endpoints', () => {
  let user;
  let role;

  beforeEach(async () => {
    role = await addRole();
    user = await addUser({ roleId: role.id });
  });

  describe('GET /api/v1/me', () => {
    describe('without access token', () => {
      it('should return 401', async () => {
        await request(app)
          .get('/api/v1/me')
          .expect(401);
      });
    });

    describe('with access token', () => {
      let accessToken;

      beforeEach(async () => {
        accessToken = await generateAccessToken(['user:read'], user.id);
      });

      it('should return user data', async () => {
        const res = await request(app)
          .get('/api/v1/me')
          .set('authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(res.body).to.have.property('id', user.id);
        expect(res.body).to.have.property('username', user.username);
        expect(res.body).to.have.property('email', user.email);
        expect(res.body).to.have.nested.property('role.id', role.id);
        expect(res.body).to.have.nested.property('role.name', role.name);
        expect(res.body).to.have.nested.property('role.permissions').that.is.an('array');
      });
    });
  });

  describe('PATCH /api/v1/me', () => {
    describe('without access token', () => {
      it('should return 401', async () => {
        await request(app)
          .patch('/api/v1/me')
          .expect(401);
      });
    });

    describe('with access token', () => {
      let accessToken;

      beforeEach(async () => {
        accessToken = await generateAccessToken(['user:write'], user.id);
      });

      it('should update user data', async () => {
        const newData = {
          email: faker.internet.email(),
          username: faker.internet.userName(),
          password: 'newPassword',
        };

        await request(app)
          .patch('/api/v1/me')
          .set('authorization', `Bearer ${accessToken}`)
          .send(newData)
          .expect(204);

        const updatedUser = await getUser(user.id);
        expect(updatedUser).to.have.property('email', newData.email);
        expect(updatedUser).to.have.property('username', newData.username);

        const isSamePassword = await bcrypt.compare(newData.password, updatedUser.password);
        expect(isSamePassword).to.be.true;
      });
    });
  });
});
