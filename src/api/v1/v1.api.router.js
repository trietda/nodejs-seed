const express = require('express');
const authRouter = require('./auth/auth.router');
const userRouter = require('./user/user.router');
const roleRouter = require('./role/role.router');
const permissionRouter = require('./permission/permission.router');
const meRouter = require('./me/me.router');

const router = express.Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/roles', roleRouter);
router.use('/permissions', permissionRouter);
router.use('/me', meRouter);

module.exports = router;
