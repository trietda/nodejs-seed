exports.up = knex => knex.schema.createTable('role', (table) => {
  table.uuid('id').primary('r_id_pk');
  table.string('name').unique('r_name_uq');
  table.timestamps(false, true);
});

exports.down = knex => knex.schema.dropTable('role');
