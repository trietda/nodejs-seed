const faker = require('faker');
const { Permission } = require('../../../src/database');

module.exports = class TestPermissionFactory {
  static async addPermission(data) {
    const defaultData = {
      name: faker.fake('{{lorem.word}}:{{lorem.word}}'),
    };

    return Permission.query()
      .insert({
        ...defaultData,
        ...data,
      });
  }

  static async addManyPermissions(amount = 3) {
    const promises = [];

    for (let i = 0; i < amount; i += 1) {
      promises.push(TestPermissionFactory.addPermission());
    }

    return Promise.all(promises);
  }
};
