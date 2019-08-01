const { transaction } = require('objection');
const { HttpError } = require('../../../error');
const { Role } = require('../../../model');

const validatePermissions = (permissions) => {
  if (!permissions || !permissions.length) {
    return;
  }

  const uniquePermissions = [...(new Set(permissions))];
  if (uniquePermissions.length !== permissions.length) {
    throw new HttpError({
      statusCode: 400,
      message: 'Duplicated permission',
    });
  }
};

module.exports = class RoleService {
  static async listRoles(filter = {}, paging = {}) {
    const { name } = filter;
    const {
      page, limit, sortBy, sort,
    } = paging;

    return Role.query()
      .skipUndefined()
      .where('role.name', 'like', (name || undefined) && `%${name}%`)
      .page(page, limit)
      .orderBy(sortBy, sort)
      .eager('[permissions]')
      .eagerAlgorithm(Role.JoinEagerAlgorithm);
  }

  static async addRole(data) {
    validatePermissions(data.permissions);

    return transaction(Role.knex(), async (trx) => {
      const newRole = await Role.query(trx)
        .allowInsert('[permissions]')
        .insertGraph({
          ...data,
          permissions: data.permissions.map(permissionId => ({ id: permissionId })),
        }, {
          relate: true,
        });

      return Role.query(trx)
        .findById(newRole.id)
        .eager('[permissions]')
        .eagerAlgorithm(Role.JoinEagerAlgorithm);
    });
  }

  static async getRole(roleId) {
    return Role.query()
      .findById(roleId)
      .eager('permissions')
      .eagerAlgorithm(Role.JoinEagerAlgorithm)
      .throwIfNotFound();
  }

  static async updateRole(roleId, data) {
    validatePermissions(data.permissions);

    await transaction(Role.knex(), async (trx) => {
      await Role.query(trx)
        .allowUpsert('[permissions]')
        .upsertGraph({
          ...data,
          id: roleId,
          permissions: data.permissions.map(permissionId => ({ id: permissionId })),
        }, {
          relate: true,
          unrelate: true,
          noInsert: true,
          noUpdate: ['permissions'],
          noDelete: true,
        });
    });
  }

  static async removeRole(roleId) {
    await Role.query()
      .deleteById(roleId)
      .throwIfNotFound();
  }

  static makePermissionName(resource, action) {
    return `${resource}:${action}`;
  }

  static can(user, permission) {
    return (user.permissions || []).includes(permission);
  }
};
