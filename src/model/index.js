const { Model } = require('objection');
const initKnex = require('./knex');
const User = require('./user');
const Role = require('./role');
const RefreshToken = require('./refreshToken');
const Permission = require('./permission');
const BlacklistToken = require('./blacklistToken');

module.exports = {
  User,
  Role,
  RefreshToken,
  Permission,
  BlacklistToken,

  async init() {
    const knex = initKnex();
    Model.knex(knex);
  },

  async shutdown() {
    await Model.knex().destroy();
  },
};
