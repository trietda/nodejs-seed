const config = require('config');
const http = require('http');
const { createTerminus } = require('@godaddy/terminus');

const PORT = parseInt(config.get('server.port'), 10);

const onHealthCheck = async () => ({
  foo: 'bar',
});

const onBeforeShutdown = async () => {
  logger.info('Server is shutting down');
};

const onSignal = async (model) => {
  logger.info('Server is cleaning up');

  logger.info('Database is disconnecting');
  await model.shutdown();
  logger.info('Database disconnected');
};

const onShutdown = async () => {
  logger.info('Server shut down');
};

module.exports = (app, model) => {
  const server = http.createServer(app);
  server.on('listening', () => { logger.info(`Server is listening at ${PORT}`); });

  createTerminus(server, {
    healthChecks: {
      '/healthCheck': onHealthCheck,
    },
    beforeShutdown: onBeforeShutdown,
    onSignal: onSignal.bind(null, model),
    onShutdown,
    signals: ['SIGINT', 'SIGTERM'],
  });

  return server;
};
