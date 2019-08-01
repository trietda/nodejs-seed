const { BlacklistToken } = require('../../../src/model');

module.exports = {
  getById(id) {
    return BlacklistToken.query().findById();
  },
};
