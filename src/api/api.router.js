const express = require('express');
const v1ApiRouter = require('./v1/v1.api.router');
const apiMiddleware = require('./api.middleware');

const router = express.Router();

router.use('/v1', v1ApiRouter);
router.use(apiMiddleware.handleValidationError);
router.use(apiMiddleware.handleModelValidationError);
router.use(apiMiddleware.handleDatabaseError);
router.use(apiMiddleware.handleHttpError);
router.use(apiMiddleware.handleAuthenticateError);
router.use(apiMiddleware.handleAuthorizationError);

module.exports = router;
