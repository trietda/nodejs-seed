const createApp = require('./app');
const createServer = require('./server');
const createLogger = require('./logger');
const initGlobal = require('./global');

module.exports = {
  createApp,
  createServer,
  createLogger,
  initGlobal,
};
