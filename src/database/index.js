const { Model } = require('objection');
const initKnex = require('./knex');
const User = require('./model/user');
const Role = require('./model/role');
const RefreshToken = require('./model/refreshToken');
const Permission = require('./model/permission');
const BlacklistToken = require('./model/blacklistToken');

const models = {
  User,
  Role,
  RefreshToken,
  Permission,
  BlacklistToken,
};

module.exports = {
  ...models,

  async init() {
    const knex = initKnex();
    Model.knex(knex);
  },

  async shutdown() {
    await Model.knex().destroy();
  },
};
