require('dotenv').config();
const sinon = require('sinon');
const core = require('../../src/core');
const model = require('../../src/database');
const truncate = require('./truncate');

before(async () => {
  core.initGlobal();
  await model.init();

  sinon.stub(logger, 'log').returns();
  sinon.stub(logger, 'warn').returns();
  sinon.stub(logger, 'info').returns();
  sinon.stub(logger, 'error').returns();

  await truncate();
});

afterEach(async () => {
  await truncate();
});

after(async () => {
  await model.shutdown();
});
