const bcrypt = require('bcrypt');
const faker = require('faker');
const sinon = require('sinon');
const chai = require('chai');
const chaiAsPromise = require('chai-as-promised');
const { User } = require('../../../src/model');
const { addRole } = require('../helper/role');

const { expect } = chai;

chai.use(chaiAsPromise);

describe('User', () => {
  describe('#hashPassword()', () => {
    before(() => {
      sinon.stub(bcrypt, 'hash').resolves('hashed');
    });

    it('should hash password', async () => {
      const user = User.fromJson({
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: 'password',
      });

      await expect(user.hashPassword()).to.be.fulfilled;
      expect(user.password).to.equal('hashed');
    });
  });

  describe('integration test', () => {
    let role;

    beforeEach(async () => {
      role = await addRole();
    });

    it('should hash password when insert', async () => {
      const password = 'password';

      const user = await User.query().insertAndFetch({
        password,
        email: faker.internet.email(),
        username: faker.internet.userName(),
        roleId: role.id,
      });

      expect(bcrypt.compare(password, user.password)).to.be.fulfilled;
    });

    describe('with existed user', () => {
      let user;

      beforeEach(async () => {
        user = await User.query().insert({
          email: faker.internet.email(),
          username: faker.internet.userName(),
          password: 'oldPassword',
          roleId: role.id,
        });
      });

      it('should hash password when update', async () => {
        const newPassword = 'newPassword';

        const updatedUser = await User.query()
          .patchAndFetchById(user.id, {
            password: newPassword,
          });

        expect(bcrypt.compare(newPassword, updatedUser.password)).to.be.fulfilled;
      });
    });
  });
});
