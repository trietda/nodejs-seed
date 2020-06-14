const { Permission } = require('../../../database');

module.exports = class PermissionService {
  static async listPermissions() {
    return Permission.query();
  }
};
