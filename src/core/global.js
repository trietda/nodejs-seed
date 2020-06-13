const createLogger = require('./logger');

module.exports = () => {
  global.logger = createLogger();
  global.Promise = Promise;
};