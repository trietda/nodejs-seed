const {v4: Uuid} = require('uuid');

exports.seed = async (knex) => {
  const seedDate = new Date();

  const permissions = [
    {
      id: Uuid(),
      name: 'user:read',
      created_at: seedDate,
      updated_at: seedDate,
    },
    {
      id: Uuid(),
      name: 'user:write',
      created_at: seedDate,
      updated_at: seedDate,
    },
    {
      id: Uuid(),
      name: 'role:read',
      created_at: seedDate,
      updated_at: seedDate,
    },
    {
      id: Uuid(),
      name: 'role:write',
      created_at: seedDate,
      updated_at: seedDate,
    },
    {
      id: Uuid(),
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
