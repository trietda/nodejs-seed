exports.up = (knex) => knex.schema.createTable('permission', (table) => {
  table.uuid('id').primary('p_id_pk');
  table.string('name').unique('p_name_uq');
  table.timestamps(false, true);
});

exports.down = (knex) => knex.schema.dropTable('permission');
