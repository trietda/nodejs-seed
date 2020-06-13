const express = require('express');
const compression = require('compression');
const cors = require('cors');
const config = require('config');
const morgan = require('morgan');
const router = require('./core.router');
const notFoundHandler = require('./notFound');
const unexpectedErrorHandler = require('./unexpectedError');

module.exports = () => {
  const app = express();

  const corsOptions = {
    origin: config.get('cors.origin'),
    allowedHeaders: config.get('cors.allowedHeaders'),
  };

  app.disable('x-powered-by');

  app.use(express.json());
  app.use(compression());
  app.use(cors(corsOptions));

  /* istanbul ignore next */
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('common'));
  }

  app.use(router);
  app.all('*', notFoundHandler);
  app.use(unexpectedErrorHandler);

  return app;
};
