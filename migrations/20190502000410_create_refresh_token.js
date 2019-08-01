exports.up = knex => knex.schema.createTable('refresh_token', (table) => {
  table.uuid('id').primary('rt_id_pk');
  table.uuid('token');
  table.uuid('user_id')
    .references('id')
    .inTable('user')
    .onDelete('CASCADE')
    .withKeyName('rt_user_id_fk');
  table.json('metadata');
  table.timestamps(false, true);

  table.unique(['token', 'user_id'], 'rt_token_user_id_uqc');
});

exports.down = knex => knex.schema.dropTable('refresh_token');
