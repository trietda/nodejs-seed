const authService = require('./auth.service');
const { getBearerToken } = require('./authControllerHelper');

module.exports = {
  async login(req, res) {
    const { username, password } = req.body;

    const user = await authService.login(username, password);

    const { accessToken, refreshToken } = await authService.generateToken(user);

    res.status(200).json({
      accessToken,
      refreshToken,
    });
  },

  async logout(req, res) {
    const { accessToken } = req.locals;

    await authService.logout(accessToken);

    res.status(204).end();
  },

  async refreshToken(req, res) {
    const { userId } = req.body;

    const refreshToken = getBearerToken(req);

    const { accessToken } = await authService.refreshToken(refreshToken, userId);

    res.status(201).json({ accessToken });
  },
};
