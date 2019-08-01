const {
  listUser, getUser, addUser, updateUser, removeUser, updateUserStatus,
} = require('./user.service');

module.exports = {
  async listAllUser(req, res) {
    const result = await listUser(req.query);
    res.status(200).json(result);
  },

  async addUser(req, res) {
    const newUser = await addUser(req.body);
    res.status(201).json(newUser);
  },

  async getUser(req, res) {
    const { userId } = req.params;
    const user = await getUser(userId);
    res.status(200).json(user);
  },

  async updateUser(req, res) {
    const { userId } = req.params;
    const updatedUser = await updateUser(userId, req.body);
    res.status(204).json(updatedUser);
  },

  async removeUser(req, res) {
    const { userId } = req.params;
    await removeUser(userId);
    res.status(204).end();
  },

  async updateStatus(req, res) {
    const { userId } = req.params;
    const { accessToken } = req.locals;
    const { status } = req.body;

    await updateUserStatus(userId, status, accessToken.refreshTokenId);

    res.status(204).end();
  },
};
