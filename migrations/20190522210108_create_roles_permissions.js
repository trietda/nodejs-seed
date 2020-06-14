exports.up = (knex) => knex.schema.createTable('role_permission', (table) => {
  table.uuid('role_id')
    .notNullable()
    .references('id')
    .inTable('role')
    .onDelete('CASCADE')
    .withKeyName('rp_role_id_fk');
  table.uuid('permission_id')
    .notNullable()
    .references('id')
    .inTable('permission')
    .withKeyName('rp_permission_id_fk');

  table.unique(['role_id', 'permission_id'], 'rp_role_id_permission_id_uqc');
});

exports.down = (knex) => knex.schema.dropTable('role_permission');
