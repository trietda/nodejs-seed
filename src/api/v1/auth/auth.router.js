const express = require('express');
const asyncRoute = require('../../../util/asyncRoute');
const { validate } = require('../../api.middleware');
const { authenticate } = require('./auth.middleware');
const { login, logout, refreshToken } = require('./auth.controller');
const { loginSchema } = require('./authSchema');

const router = express.Router();

router.post('/sessions', validate(loginSchema), asyncRoute(login));
router.delete(
  '/sessions',
  asyncRoute(authenticate),
  asyncRoute(logout),
);
router.post('/accessTokens', asyncRoute(refreshToken));

module.exports = router;
