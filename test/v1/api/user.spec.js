const { expect } = require('chai');
const bcrypt = require('bcrypt');
const request = require('supertest');
const faker = require('faker');
const app = require('../../setup/app');
const { addUser, getUser } = require('../helper/user');
const { addRole } = require('../helper/role');
const { generateAccessToken } = require('../helper/accessToken');

describe('User endpoints', () => {
  describe('GET /api/v1/users', () => {
    describe('without access token', () => {
      it('should return 401', async () => {
        await request(app)
          .get('/api/v1/users')
          .expect(401);
      });
    });

    describe('without access token with permission named "user:read"', () => {
      let accessToken;

      before(async () => {
        accessToken = await generateAccessToken([]);
      });

      it('should return 403', async () => {
        await request(app)
          .get('/api/v1/users')
          .set('authorization', `Bearer ${accessToken}`)
          .expect(403);
      });
    });

    describe('with access token with permission named "user:read"', () => {
      let accessToken;
      let users;

      beforeEach(async () => {
        accessToken = await generateAccessToken(['user:read']);

        const role = await addRole();

        users = await Promise.all([
          await addUser({ roleId: role.id }),
          await addUser({
            roleId: role.id,
            status: 'disabled',
          }),
        ]);
      });

      it('should returns list of users', async () => {
        const res = await request(app)
          .get('/api/v1/users')
          .set('authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(res.body).to.have.property('results').that.is.an('array').with.lengthOf(3);
        expect(res.body).to.have.property('total', 3);
      });

      it('should return list of filtered user when provide search param', async () => {
        const searchTerm = users[1].email.slice(0, -2);

        const res = await request(app)
          .get(`/api/v1/users?search=${searchTerm}`)
          .set('authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(res.body).to.have.property('total', 1);
        expect(res.body).to.have.property('results').that.is.an('array').with.lengthOf(1);
        expect(res.body).to.have.nested.property('results[0].id', users[1].id);
      });

      it('should return list of filtered user when provide status param', async () => {
        const status = 'active';

        const res = await request(app)
          .get('/api/v1/users')
          .query({ status })
          .set('authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(res.body).to.have.property('total', 2);
        expect(res.body).to.have.property('results').that.is.an('array').with.lengthOf(2);

        res.body.results.forEach((result) => {
          expect(result).to.have.property('status', status);
        });
      });
    });
  });

  describe('POST /api/v1/users', () => {
    describe('without access token', () => {
      it('should return 401', async () => {
        await request(app)
          .post('/api/v1/users')
          .expect(401);
      });
    });

    describe('with access token that does not have permission named "user:write"', () => {
      let accessToken;

      before(async () => {
        accessToken = await generateAccessToken([]);
      });

      it('should return 403', async () => {
        await request(app)
          .post('/api/v1/users')
          .set('authorization', `Bearer ${accessToken}`)
          .expect(403);
      });
    });

    describe('with access token that has permission named "user:write"', () => {
      let accessToken;
      let role;

      before(async () => {
        accessToken = await generateAccessToken(['user:write']);
        role = await addRole();
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
          .send(userData)
          .expect(201);

        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('firstName', userData.firstName);
        expect(res.body).to.have.property('lastName', userData.lastName);
        expect(res.body).to.have.property('email', userData.email);
        expect(res.body).to.have.property('username', userData.username);
      });
    });
  });

  describe('GET /api/v1/users/:userId', () => {
    let role;
    let user;

    beforeEach(async () => {
      role = await addRole();
      user = await addUser({ roleId: role.id });
    });

    describe('without access token', () => {
      it('should return 401', async () => {
        await request(app)
          .get(`/api/v1/users/${user.id}`)
          .expect(401);
      });
    });

    describe('with access token that does not have permission named "user:read"', () => {
      let accessToken;

      before(async () => {
        accessToken = await generateAccessToken([]);
      });

      it('should return 403', async () => {
        await request(app)
          .get(`/api/v1/users/${user.id}`)
          .set('authorization', `Bearer ${accessToken}`)
          .expect(403);
      });
    });

    describe('with access token that has permission named "user:read"', () => {
      let accessToken;

      before(async () => {
        accessToken = await generateAccessToken(['user:read']);
      });

      it('should return user data', async () => {
        const res = await request(app)
          .get(`/api/v1/users/${user.id}`)
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

  describe('PATCH /api/v1/users/:userId', () => {
    let user;

    beforeEach(async () => {
      const role = await addRole();
      user = await addUser({ roleId: role.id });
    });

    describe('without access token', () => {
      it('should return 401', async () => {
        await request(app)
          .patch(`/api/v1/users/${user.id}`)
          .expect(401);
      });
    });

    describe('with access token that does not have permission named "user:write"', () => {
      let accessToken;

      before(async () => {
        accessToken = await generateAccessToken([]);
      });

      it('should return 403', async () => {
        await request(app)
          .patch(`/api/v1/users/${user.id}`)
          .set('authorization', `Bearer ${accessToken}`)
          .expect(403);
      });
    });

    describe('with access token that has permission named "user:write"', () => {
      let accessToken;

      before(async () => {
        accessToken = await generateAccessToken(['user:write']);
      });

      it('should update user data', async () => {
        const newData = {
          email: faker.internet.email(),
          username: faker.internet.userName(),
          password: 'newPassword',
        };

        await request(app)
          .patch(`/api/v1/users/${user.id}`)
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

  describe('DELETE /api/v1/users/:userId', () => {
    let user;

    beforeEach(async () => {
      const role = await addRole();
      user = await addUser({ roleId: role.id });
    });

    describe('without access token', () => {
      it('should return 401', async () => {
        await request(app)
          .delete(`/api/v1/users/${user.id}`)
          .expect(401);
      });
    });

    describe('with access token that does not have permission named "user:write"', () => {
      let accessToken;

      before(async () => {
        accessToken = await generateAccessToken([]);
      });

      it('should return 403', async () => {
        await request(app)
          .delete(`/api/v1/users/${user.id}`)
          .set('authorization', `Bearer ${accessToken}`)
          .expect(403);
      });
    });

    describe('with access token that has permission named "user:write"', () => {
      let accessToken;

      before(async () => {
        accessToken = await generateAccessToken(['user:write']);
      });

      it('should update user data', async () => {
        await request(app)
          .delete(`/api/v1/users/${user.id}`)
          .set('authorization', `Bearer ${accessToken}`)
          .expect(204);

        const updatedUser = await getUser(user.id);
        expect(updatedUser).to.be.undefined;
      });
    });
  });

  describe('PUT /api/v1/users/:userId/status', () => {
    let user;

    beforeEach(async () => {
      const role = await addRole();
      user = await addUser({ roleId: role.id });
    });

    describe('without access token', () => {
      it('should return 401', async () => {
        await request(app)
          .put(`/api/v1/users/${user.id}/status`)
          .expect(401);
      });
    });

    describe('with access token that does not have permission named "user:write"', () => {
      let accessToken;

      before(async () => {
        accessToken = await generateAccessToken([]);
      });

      it('should return 403', async () => {
        await request(app)
          .put(`/api/v1/users/${user.id}/status`)
          .set('authorization', `Bearer ${accessToken}`)
          .expect(403);
      });
    });

    describe('with access token that has permission named "user:write"', () => {
      let accessToken;
      let otherUserAccessToken;

      beforeEach(async () => {
        accessToken = await generateAccessToken(['user:write']);
        otherUserAccessToken = await generateAccessToken([], user.id);
      });

      it('should disable user and prevent user to make api call', async () => {
        await request(app)
          .put(`/api/v1/users/${user.id}/status`)
          .set('authorization', `Bearer ${accessToken}`)
          .send({ status: 'disabled' })
          .expect(204);

        await request(app)
          .get('/api/v1/me')
          .set('authorization', `Bearer ${otherUserAccessToken}`)
          .expect(401);

        const updatedUser = await getUser(user.id);
        expect(updatedUser).to.have.property('status', 'disabled');
      });

      it('should not archive non-delete user', async () => {
        const res = await request(app)
          .put(`/api/v1/users/${user.id}/status`)
          .set('authorization', `Bearer ${accessToken}`)
          .send({ status: 'archived' })
          .expect(400);

        expect(res.body)
          .to
          .have
          .nested
          .property('detail.status', 'can only archive disabled users');
      });
    });
  });
});
