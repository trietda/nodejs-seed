const express = require('express');
const swaggerUi = require('swagger-ui-express');
const yamlJs = require('yamljs');
const { join } = require('path');
const apiRouter = require('../../api/api.router');

const addRoutes = (router) => {
  router.use('/api', apiRouter);
};

const addSwaggerDoc = (router) => {
  if (process.env.NODE_ENV === 'develop') {
    const swaggerPath = join(__dirname, '../../../docs/swagger.yml');
    const swaggerDocument = yamlJs.load(swaggerPath);
    router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }
};

const router = express.Router();
addRoutes(router);
addSwaggerDoc(router);

module.exports = router;
