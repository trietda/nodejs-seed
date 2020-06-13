require('dotenv').config();
const config = require('config');

module.exports = {
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
  migrations: {
    tableName: 'knexmigrations',
  },
};
