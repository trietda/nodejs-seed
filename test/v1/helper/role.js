const faker = require('faker');
const { transaction: startTransaction } = require('objection');
const { Role } = require('../../../src/model');

module.exports = class RoleFactory {
  static async getRole(roleId, transaction = null) {
    return Role.query(transaction).findById(roleId);
  }

  static async addRole(roleData = {}) {
    const { permissionIds = [] } = roleData;

    const defaultData = { name: faker.lorem.word(1) };

    return startTransaction(Role.knex(), async (trx) => {
      const role = await Role.query(trx)
        .insertGraph({
          ...defaultData,
          ...roleData,
          permissions: permissionIds.map(id => ({ id })),
          caiditme: 'asdf',
        }, {
          relate: true,
        });

      return RoleFactory.getRole(role.id, trx);
    });
  }

  static async addManyRole(amount = 3) {
    const promises = [];
    for (let i = 0; i < amount; i += 1) {
      promises.push(RoleFactory.addRole());
    }
    return Promise.all(promises);
  }
};
