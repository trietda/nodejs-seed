module.exports = {
  server: {
    port: 'SERVER_PORT',
  },
  jwt: {
    secret: 'JWT_SECRET',
    expireTime: 'JWT_EXPIRE_TIME',
  },
  database: {
    database: 'DATABASE_DATABASE',
    host: 'DATABASE_HOST',
    port: 'DATABASE_PORT',
    user: 'DATABASE_USER',
    password: 'DATABASE_PASSWORD',
    pool: {
      min: 'DATABASE_POOL_MIN',
      max: 'DATABASE_POOL_MAX',
    },
  },
};
