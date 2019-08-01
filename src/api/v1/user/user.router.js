const express = require('express');
const asyncRoute = require('../../../util/asyncRoute');
const { authenticate } = require('../auth/auth.middleware');
const { authorization } = require('../role/role.middleware');
const { upload, sanitizePagination, sanitizeSort } = require('../../api.middleware');
const {
  listAllUser, addUser, updateUser, getUser, removeUser, updateStatus,
} = require('./user.controller');

const router = express.Router();

router.use(asyncRoute(authenticate));

router.get(
  '/',
  asyncRoute(authorization('user', 'read')),
  asyncRoute(sanitizeSort([
    'email',
    'username',
    'firstName',
    'lastName',
    'lastLogin',
    'updatedAt',
  ], 'updatedAt')),
  asyncRoute(sanitizePagination),
  asyncRoute(listAllUser),
);

router.post(
  '/',
  asyncRoute(authorization('user', 'write')),
  upload.single('avatar'),
  asyncRoute(addUser),
);

router.get(
  '/:userId',
  asyncRoute(authorization('user', 'read')),
  asyncRoute(getUser),
);

router.patch(
  '/:userId',
  asyncRoute(authorization('user', 'write')),
  upload.single('avatar'),
  asyncRoute(updateUser),
);

router.put(
  '/:userId/status',
  asyncRoute(authorization('user', 'write')),
  asyncRoute(updateStatus),
);

router.delete(
  '/:userId',
  asyncRoute(authorization('user', 'write')),
  asyncRoute(removeUser),
);

module.exports = router;
