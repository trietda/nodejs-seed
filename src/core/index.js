const Promise = require('bluebird');
const createApp = require('./app');
const createServer = require('./server');
const createLogger = require('./logger');

module.exports = {
  createApp,
  createServer,
  createLogger,
  initGlobal() {
    const logger = createLogger();
    global.logger = logger;
    global.Promise = Promise;
  },
};
