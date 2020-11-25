const faker = require('faker');
const { transaction: startTransaction } = require('objection');
const { Role } = require('../../../src/database');

module.exports = class TestRoleFactory {
  static async getRole(roleId) {
    return Role.query().findById(roleId);
  }

  static async addRole(inputRoleData = {}) {
    const { permissions = [] } = inputRoleData;
    const defaultData = { name: faker.lorem.word() };
    const roleData = {
      ...defaultData,
      ...inputRoleData,
      permissions: permissions.map((permissionName) => ({ name: permissionName })),
    };

    return startTransaction(
      Role.knex(),
      async (trx) => Role
        .query(trx)
        .insertGraph(roleData),
    );
  }

  static async addManyRole(amount = 3) {
    const promises = [];
    for (let i = 0; i < amount; i += 1) {
      promises.push(TestRoleFactory.addRole());
    }
    return Promise.all(promises);
  }
};
