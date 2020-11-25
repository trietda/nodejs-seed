const bcrypt = require('bcrypt');
const faker = require('faker');
const User = require('./user');

describe('User', () => {
  describe('#hashPassword()', () => {
    it('should hash password', async () => {
      jest.spyOn(bcrypt, 'hash');

      const user = User.fromJson({
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: 'password',
      });

      await expect(user.hashPassword()).toResolve();
      expect(bcrypt.hash).toHaveBeenCalled();
    });
  });
});
