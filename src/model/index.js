const { Model } = require('objection');
const knex = require('./knex');
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
    Model.knex(knex);
  },

  async shutdown() {
    await knex.destroy();
  },
};
