const express = require('express');
const swaggerUi = require('swagger-ui-express');
const yamlJs = require('yamljs');
const { join } = require('path');
const apiRouter = require('../../api/api.router');

const swaggerPath = join(__dirname, '../../../docs/swagger.yml');
const swaggerDocument = yamlJs.load(swaggerPath);

const { NODE_ENV } = process.env;

const router = express.Router();

router.use('/api', apiRouter);

if (NODE_ENV === 'develop') {
  router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

module.exports = router;
