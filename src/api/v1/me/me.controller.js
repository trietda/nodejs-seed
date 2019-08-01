const { getUser, updateUser } = require('../user/user.service');

module.exports = class MeController {
  static async getLoggedInUser(req, res) {
    const { accessToken } = req.locals;
    const user = await getUser(accessToken.sub);
    res.json(user);
  }

  static async updateLoggedInUser(req, res) {
    const { accessToken } = req.locals;
    await updateUser(accessToken.sub, req.body);
    res.status(204).end();
  }
};
