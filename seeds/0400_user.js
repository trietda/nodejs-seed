const uuid = require('uuid/v4');
const bcrypt = require('bcrypt');

exports.seed = async (knex) => {
  const seedDate = new Date();

  const adminRole = await knex('role').select().where({ name: 'admin' }).limit(1);

  const password = await bcrypt.hash('password', 10);

  const userData = (new Array(15)).fill(0).map((value, index) => ({
    password,
    id: uuid(),
    email: `admin${index + 1}@gmail.com`,
    username: `admin${index + 1}`,
    role_id: adminRole[0].id,
    first_name: `test ${index + 1}`,
    last_name: 'admin',
    status: 'active',
    created_at: seedDate,
    updated_at: seedDate,
  }));

  return knex.raw(
    knex('user').insert(userData)
      .toString()
      .replace(/^insert/i, 'insert ignore'),
  );
};
