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

const onSignal = async (database) => {
  logger.info('Server is cleaning up');

  logger.info('Database is disconnecting');
  await database.shutdown();
  logger.info('Database disconnected');
};

const onShutdown = async () => {
  logger.info('Server shut down');
};

module.exports = (app, database) => {
  const server = http.createServer(app);

  createTerminus(server, {
    healthChecks: {
      '/healthCheck': onHealthCheck,
    },
    beforeShutdown: onBeforeShutdown,
    onSignal: onSignal.bind(null, database),
    onShutdown,
    signals: ['SIGINT', 'SIGTERM'],
  });

  server.on('listening', () => { logger.info(`Server is listening at ${PORT}`); });
  server.on('error', (err) => { logger.error(err); });

  return server;
};
