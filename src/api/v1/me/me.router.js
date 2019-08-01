const express = require('express');
const asyncRoute = require('../../../util/asyncRoute');
const { authenticate } = require('../auth/auth.middleware');
const { getLoggedInUser, updateLoggedInUser } = require('./me.controller');

const router = express.Router();

router.use(asyncRoute(authenticate));
router.get('/', asyncRoute(getLoggedInUser));
router.patch('/', asyncRoute(updateLoggedInUser));

module.exports = router;
