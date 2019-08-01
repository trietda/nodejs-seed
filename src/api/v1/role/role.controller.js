const {
  listRoles, addRole, getRole, updateRole, removeRole,
} = require('./role.service');

module.exports = class RoleController {
  static async listRoles(req, res) {
    const { results, total } = await listRoles(req.query, req.query);
    res.status(200).json({
      results,
      total,
    });
  }

  static async addRole(req, res) {
    const role = await addRole(req.body);
    res.status(201).json(role);
  }

  static async getRole(req, res) {
    const role = await getRole(req.params.roleId);
    res.status(200).json(role);
  }

  static async updateRole(req, res) {
    const { roleId } = req.params;
    await updateRole(roleId, req.body);
    res.status(204).end();
  }

  static async removeRole(req, res) {
    await removeRole(req.params.roleId);
    res.status(204).end();
  }
};
