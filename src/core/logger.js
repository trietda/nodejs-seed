const stringify = require('fast-safe-stringify');
const { createLogger, transports, format } = require('winston');

const replacer = (key, value) => {
  if (value === '[Circular]') {
    return;
  }

  // eslint-disable-next-line consistent-return
  return value;
};

const customSimpleFormat = format.printf((config) => {
  const {
    level, message, timestamp, stack, ...rest
  } = config;

  if (stack) {
    return `${timestamp}: ${level} ${message} ${stack}`;
  }

  const meta = Object.keys(rest).length > 0 ? stringify(rest, replacer, 2) : '';

  return `${timestamp}: ${level} ${message} ${meta}`;
});

module.exports = () => {
  const logger = createLogger({
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-dd HH:mm:ss',
      }),
      format.errors({ stack: true }),
      format.json(),
    ),
    exitOnError: true,
  });

  if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
      level: 'debug',
      format: format.combine(
        format.colorize(),
        customSimpleFormat,
      ),
      handleExceptions: true,
    }));
  } else {
    logger.add(new transports.Console({
      level: 'error',
      handleExceptions: true,
    }));
  }

  return logger;
};
