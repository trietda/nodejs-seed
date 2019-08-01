exports.seed = async (knex) => {
  const adminRole = await knex('role').select().where({ name: 'admin' }).limit(1);

  const permissions = await knex('permission').select();

  const rolePermissions = permissions.map(permission => ({
    role_id: adminRole[0].id,
    permission_id: permission.id,
  }));

  return knex.raw(
    knex('role_permission').insert(rolePermissions)
      .toString()
      .replace(/^insert/i, 'insert ignore'),
  );
};
