const faker = require('faker');
const { User } = require('../../../src/database');

module.exports = class TestUserFactory {
  static async getUser(userId) {
    return User.query().findById(userId);
  }

  static async addUser(inputUserData) {
    const defaultData = {
      email: faker.internet.email(),
      username: faker.internet.userName(),
      password: 'password',
      status: 'active',
    };
    const userData = {
      ...defaultData,
      ...inputUserData,
    };
    return User.transaction((transaction) => User
      .query(transaction)
      .insertGraph(userData, { relate: true }));
  }
};
