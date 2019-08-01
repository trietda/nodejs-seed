exports.up = knex => knex.schema.createTable('blacklist_token', (table) => {
  table.uuid('token_id').primary('bt_id_pk').notNullable();
});

exports.down = knex => knex.schema.dropTable('blacklist_token');
