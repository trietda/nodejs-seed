module.exports = {
  server: {
    port: 3000,
  },
  cors: {
    origin: '*',
    allowedHeaders: '',
  },
  jwt: {
    secret: 'guessWhat',
    expireTime: 60 * 60, // 1 hour
  },
  database: {
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: 'seed',
    pool: {
      min: 5,
      max: 10,
    },
    debug: false,
  },
};
