const { expect } = require('chai');
const request = require('supertest');
const faker = require('faker');
const app = require('../../setup/app');
const { addRole, addManyRole, getRole } = require('../helper/role');
const { generateAccessToken } = require('../helper/accessToken');

describe('Role endpoints', () => {
  describe('GET /api/v1/roles', () => {
    beforeEach(async () => {
      await addManyRole(3);
    });

    describe('without access token', () => {
      it('should return 401', async () => {
        await request(app)
          .get('/api/v1/roles')
          .expect(401);
      });
    });

    describe('with access token that does not has permission named "role:read"', () => {
      let accessToken;

      before(async () => {
        accessToken = await generateAccessToken([]);
      });

      it('should return 403', async () => {
        await request(app)
          .get('/api/v1/roles')
          .set('authorization', `Bearer ${accessToken}`)
          .expect(403);
      });
    });

    describe('with access token that has permission named "role:read"', () => {
      let accessToken;

      before(async () => {
        accessToken = await generateAccessToken(['role:read']);
      });

      it('should return list of role', async () => {
        const res = await request(app)
          .get('/api/v1/roles')
          .set('authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(res.body).to.have.property('results').that.is.an('array').with.lengthOf(4);
      });
    });
  });

  describe('GET /api/v1/roles/:roleId', () => {
    let role;

    beforeEach(async () => {
      role = await addRole();
    });

    describe('without access token', () => {
      it('should return 401', async () => {
        await request(app)
          .get(`/api/v1/roles/${role.id}`)
          .expect(401);
      });
    });

    describe('with access token that does not has permission named "role:read"', () => {
      let accessToken;

      before(async () => {
        accessToken = await generateAccessToken([]);
      });

      it('should return 403', async () => {
        await request(app)
          .get(`/api/v1/roles/${role.id}`)
          .set('authorization', `Bearer ${accessToken}`)
          .expect(403);
      });
    });

    describe('with access token that has permission named "role:read"', () => {
      let accessToken;

      before(async () => {
        accessToken = await generateAccessToken(['role:read']);
      });

      it('should return role data', async () => {
        const res = await request(app)
          .get(`/api/v1/roles/${role.id}`)
          .set('authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(res.body).to.have.property('id', role.id);
        expect(res.body).to.have.property('name', role.name);
        expect(res.body).to.have.property('permissions').that.is.an('array');
      });

      it('should return 404 with invalid role id', async () => {
        await request(app)
          .get('/api/v1/roles/invalid')
          .set('authorization', `Bearer ${accessToken}`)
          .expect(404, { message: 'Resource not found' });
      });
    });
  });

  describe('POST /api/v1/roles', () => {
    describe('without access token', () => {
      it('should return 401', async () => {
        await request(app)
          .post('/api/v1/roles')
          .expect(401);
      });
    });

    describe('with access token that does not has permission named "role:write"', () => {
      let accessToken;

      before(async () => {
        accessToken = await generateAccessToken([]);
      });

      it('should return 403', async () => {
        await request(app)
          .post('/api/v1/roles')
          .set('authorization', `Bearer ${accessToken}`)
          .expect(403);
      });
    });

    describe('with access token that has permission named "role:write"', () => {
      let accessToken;

      before(async () => {
        accessToken = await generateAccessToken(['role:write']);
      });

      it('should add new role', async () => {
        const fakeRoleData = {
          name: faker.lorem.word(),
          permissions: [],
        };

        const res = await request(app)
          .post('/api/v1/roles')
          .set('authorization', `Bearer ${accessToken}`)
          .send(fakeRoleData)
          .expect(201);

        expect(res.body).to.have.property('name', fakeRoleData.name);
      });

      it('should return error with invalid permissions', async () => {
        const fakeRoleData = {
          name: faker.lorem.word(),
          permissions: ['invalid'],
        };

        const res = await request(app)
          .post('/api/v1/roles')
          .set('authorization', `Bearer ${accessToken}`)
          .send(fakeRoleData)
          .expect(400);

        expect(res.body).to.have.property('message', 'Invalid permission');
      });

      it('should return error with duplicated permissions', async () => {
        const fakeRoleData = {
          name: faker.lorem.word(),
          permissions: ['duplicated', 'duplicated'],
        };

        const res = await request(app)
          .post('/api/v1/roles')
          .set('authorization', `Bearer ${accessToken}`)
          .send(fakeRoleData)
          .expect(400);

        expect(res.body).to.have.property('message', 'Duplicated permission');
      });

      describe('with existed role named "duplicated"', () => {
        before(async () => {
          await addRole({ name: 'duplicated' });
        });

        it('should not add role', async () => {
          const fakeRoleData = {
            name: 'duplicated',
            permissions: [],
          };

          const res = await request(app)
            .post('/api/v1/roles')
            .set('authorization', `Bearer ${accessToken}`)
            .send(fakeRoleData)
            .expect(400);

          expect(res.body).to.have.property('message');
        });
      });
    });
  });

  describe('PATCH /api/v1/roles', () => {
    let role;

    beforeEach(async () => {
      role = await addRole();
    });

    describe('without access token', () => {
      it('should return 401', async () => {
        await request(app)
          .patch(`/api/v1/roles/${role.id}`)
          .expect(401);
      });
    });

    describe('with access token that does not has permission named "role:write"', () => {
      let accessToken;

      before(async () => {
        accessToken = await generateAccessToken([]);
      });

      it('should return 403', async () => {
        await request(app)
          .patch(`/api/v1/roles/${role.id}`)
          .set('authorization', `Bearer ${accessToken}`)
          .expect(403);
      });
    });

    describe('with access token that has permission named "role:write"', () => {
      let accessToken;

      before(async () => {
        accessToken = await generateAccessToken(['role:write']);
      });

      it('should update role', async () => {
        const updatedRoleData = {
          name: faker.lorem.word(),
          permissions: [],
        };

        await request(app)
          .patch(`/api/v1/roles/${role.id}`)
          .set('authorization', `Bearer ${accessToken}`)
          .send(updatedRoleData)
          .expect(204);

        const updatedRole = await getRole(role.id);

        expect(updatedRole).have.property('name', updatedRoleData.name);
      });
    });
  });

  describe('DELETE /api/v1/roles', () => {
    let role;

    beforeEach(async () => {
      role = await addRole();
    });

    describe('without access token', () => {
      it('should return 401', async () => {
        await request(app)
          .patch(`/api/v1/roles/${role.id}`)
          .expect(401);
      });
    });

    describe('with access token that does not has permission named "role:write"', () => {
      let accessToken;

      before(async () => {
        accessToken = await generateAccessToken([]);
      });

      it('should return 403', async () => {
        await request(app)
          .delete(`/api/v1/roles/${role.id}`)
          .set('authorization', `Bearer ${accessToken}`)
          .expect(403);
      });
    });

    describe('with access token that has permission named "role:write"', () => {
      let accessToken;

      before(async () => {
        accessToken = await generateAccessToken(['role:write']);
      });

      it('should delete role', async () => {
        await request(app)
          .delete(`/api/v1/roles/${role.id}`)
          .set('authorization', `Bearer ${accessToken}`)
          .expect(204);

        const deletedRole = await getRole(role.id);

        expect(deletedRole).to.be.undefined;
      });
    });
  });
});
