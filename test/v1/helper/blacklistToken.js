const { BlacklistToken } = require('../../../src/database');

module.exports = {
  getById(id) {
    return BlacklistToken.query().findById(id);
  },
};
