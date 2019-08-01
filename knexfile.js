module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      database: 'cms',
      user: 'root',
      password: '',
    },
    pool: {
      min: 5,
      max: 10,
    },
    migrations: {
      tableName: 'knexmigrations',
    },
  },
};
