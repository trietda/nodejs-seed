const stringify = require('fast-safe-stringify');
const { createLogger, transports, format } = require('winston');

const customSimpleFormat = format.printf(
  ({
    level, message, timestamp, stack, ...rest
  }) => {
    if (stack) {
      return `${timestamp}: ${level} ${message} ${stack}`;
    }

    const meta = Object.keys(rest).length > 0 ? stringify(rest) : '';

    return `${timestamp}: ${level} ${message} ${meta}`;
  },
);

module.exports = () => {
  const logger = createLogger({
    format: format.combine(
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      format.errors({ stack: true }),
      format.json(),
    ),
    exitOnError: true,
  });

  if (process.env.NODE_ENV === 'development') {
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
