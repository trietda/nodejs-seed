const express = require('express');
const compression = require('compression');
const cors = require('cors');
const config = require('config');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const yamlJs = require('yamljs');
const { join } = require('path');
const apiRouter = require('../../api/api.router');
const notFoundHandler = require('./notFound');
const unexpectedErrorHandler = require('./unexpectedError');

const setupSecurityHandlers = (app) => {
  app.disable('x-powered-by');
};

const setupMiddlewares = (app) => {
  app.use(express.json());
  app.use(compression());
  app.use(cors({
    origin: config.get('cors.origin'),
    allowedHeaders: config.get('cors.allowedHeaders'),
  }));

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('common'));
  }
};

const setupRoutes = (app) => {
  app.use('/api', apiRouter);

  if (process.env.NODE_ENV !== 'production') {
    const swaggerPath = join(__dirname, '../../../docs/swagger.yml');
    const swaggerDocument = yamlJs.load(swaggerPath);
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }

  app.use(notFoundHandler);
  app.use(unexpectedErrorHandler);
};

module.exports = () => {
  const app = express();
  setupSecurityHandlers(app);
  setupMiddlewares(app);
  setupRoutes(app);
  return app;
};
