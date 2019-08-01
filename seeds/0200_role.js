const uuid = require('uuid/v4');

exports.seed = async (knex) => {
  const seedDate = new Date();

  const usersData = [
    {
      id: uuid(),
      name: 'admin',
      created_at: seedDate,
      updated_at: seedDate,
    },
    {
      id: uuid(),
      name: 'customer',
      created_at: seedDate,
      updated_at: seedDate,
    },
  ];

  // TODO: update this seed when this feature is implemented
  // https://github.com/tgriesser/knex/issues/3186
  return knex.raw(
    knex('role').insert(usersData)
      .toString()
      .replace(/^insert/i, 'insert ignore'),
  );
};
