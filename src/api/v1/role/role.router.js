const express = require('express');
const asyncRoute = require('../../../util/asyncRoute');
const { sanitizeSort, sanitizePagination } = require('../../api.middleware');
const { authenticate } = require('../auth/auth.middleware');
const { authorization } = require('./role.middleware');
const {
  listRoles, addRole, getRole, updateRole, removeRole,
} = require('./role.controller');

const router = express.Router();

router.use(asyncRoute(authenticate));

router.get(
  '/',
  asyncRoute(authorization('role', 'read')),
  sanitizeSort(['name'], 'name'),
  sanitizePagination,
  asyncRoute(listRoles),
);
router.post(
  '/',
  asyncRoute(authorization('role', 'write')),
  asyncRoute(addRole),
);

router.get(
  '/:roleId',
  asyncRoute(authorization('role', 'read')),
  asyncRoute(getRole),
);
router.patch(
  '/:roleId',
  asyncRoute(authorization('role', 'write')),
  asyncRoute(updateRole),
);
router.delete(
  '/:roleId',
  asyncRoute(authorization('role', 'write')),
  asyncRoute(removeRole),
);

module.exports = router;
