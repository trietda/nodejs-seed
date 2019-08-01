const { listPermissions } = require('./permission.service');

module.exports = class PermissionController {
  static async listPermissions(req, res) {
    const allPermissions = await listPermissions();
    res.status(200).json(allPermissions);
  }
};
