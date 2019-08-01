const uuid = require('uuid/v4');

exports.seed = async (knex) => {
  const seedDate = new Date();

  const permissions = [
    {
      id: uuid(),
      name: 'user:read',
      created_at: seedDate,
      updated_at: seedDate,
    },
    {
      id: uuid(),
      name: 'user:write',
      created_at: seedDate,
      updated_at: seedDate,
    },
    {
      id: uuid(),
      name: 'role:read',
      created_at: seedDate,
      updated_at: seedDate,
    },
    {
      id: uuid(),
      name: 'role:write',
      created_at: seedDate,
      updated_at: seedDate,
    },
    {
      id: uuid(),
      name: 'permission:read',
      created_at: seedDate,
      updated_at: seedDate,
    },
  ];

  return knex.raw(
    knex('permission').insert(permissions)
      .toString()
      .replace(/^insert/i, 'insert ignore'),
  );
};
