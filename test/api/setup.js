require('dotenv').config();
const jestJsonSchema = require('jest-json-schema');
const core = require('../../src/core');
const model = require('../../src/database');
const truncate = require('./truncate');

expect.extend(jestJsonSchema.matchers);

beforeAll(async () => {
  core.initGlobal();
  await model.init();

  await truncate();
});

afterEach(async () => {
  await truncate();
});

afterAll(async () => {
  await model.shutdown();
});
