const { transaction } = require('objection');
const {
  User, Role, Permission, RefreshToken, BlacklistToken,
} = require('../../src/database');

module.exports = async () => {
  const knex = User.knex();

  await transaction(knex, async (trx) => {
    await trx.raw('SET FOREIGN_KEY_CHECKS = 0;');
    await RefreshToken.query(trx).truncate();
    await User.query(trx).truncate();
    await Role.query(trx).truncate(trx);
    await Permission.query(trx).truncate();
    await BlacklistToken.query(trx).truncate();
    await trx.raw('SET FOREIGN_KEY_CHECKS = 1;');
  });
};
