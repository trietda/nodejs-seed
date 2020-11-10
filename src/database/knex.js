const config = require('config');
const { knexSnakeCaseMappers } = require('objection');
const Knex = require('knex');

module.exports = () => Knex({
  client: 'mysql2',

  connection: {
    host: config.get('database.host'),
    port: config.get('database.port'),
    database: config.get('database.database'),
    user: config.get('database.user'),
    password: config.get('database.password'),
  },

  pool: {
    min: parseInt(config.get('database.pool.min'), 10),
    max: parseInt(config.get('database.pool.max'), 10),
  },

  log: {
    warn(message) {
      logger.warn(message);
    },
    error(message) {
      logger.error(message);
    },
    deprecate(message) {
      logger.warn(message);
    },
    debug(message) {
      logger.info(message);
    },
  },

  debug: config.get('database.debug'),

  ...knexSnakeCaseMappers(),
});