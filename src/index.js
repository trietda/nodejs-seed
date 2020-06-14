require('dotenv').config();
const config = require('config');
const core = require('./core');
const database = require('./database');

const PORT = parseInt(config.get('server.port'), 10);

const bootstrap = async () => {
  await database.init();
};

const listen = () => {
  const app = core.createApp();
  const server = core.createServer(app, database);
  server.listen(PORT);
};

(async () => {
  try {
    core.initGlobal();
    await bootstrap();
    listen();
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
})();
