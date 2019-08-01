const { Permission } = require('../../../model');

module.exports = class PermissionService {
  static async listPermissions() {
    return Permission.query();
  }
};
