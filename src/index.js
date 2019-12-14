require('dotenv').config();
const config = require('config');
const core = require('./core');
const model = require('./model');

const PORT = parseInt(config.get('server.port'), 10);

const bootstrap = async () => {
  core.initGlobal();
  await model.init();
};

const listen = () => {
  const app = core.createApp();
  const server = core.createServer(app, model);
  server.listen(PORT);
};

(async () => {
  try {
    await bootstrap();
    listen();
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
})();
