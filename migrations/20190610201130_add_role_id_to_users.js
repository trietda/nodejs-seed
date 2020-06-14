exports.up = (knex) => knex.schema.alterTable('user', (table) => {
  table.uuid('role_id')
    .notNullable()
    .references('id')
    .inTable('role')
    .withKeyName('u_role_id_fk');
});

exports.down = (knex) => knex.schema.alterTable('user', (table) => {
  table.dropForeign('role_id', 'u_role_id_fk');
  table.dropColumn('role_id');
});
