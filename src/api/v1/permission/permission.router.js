const express = require('express');
const asyncRoute = require('../../../util/asyncRoute');
const { authenticate } = require('../auth/auth.middleware');
const { authorization } = require('../role/role.middleware');
const { listPermissions } = require('./permission.controller');

const router = express.Router();

router.use(asyncRoute(authenticate));

router.get(
  '/',
  authorization('permission', 'read'),
  asyncRoute(listPermissions),
);

module.exports = router;
