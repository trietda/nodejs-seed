const faker = require('faker');
const { User } = require('../../../src/model');

module.exports = {
  async getUser(userId) {
    return User.query().findById(userId);
  },

  async addUser(userData) {
    const defaultData = {
      email: faker.internet.email(),
      username: faker.internet.userName(),
      password: 'password',
      status: 'active',
    };

    return User.query().insert({
      ...defaultData,
      ...userData,
    });
  },
};
