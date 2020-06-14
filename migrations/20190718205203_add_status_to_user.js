exports.up = (knex) => knex.schema.alterTable('user', (table) => {
  table.string('status').notNullable().defaultTo('active');
});

exports.down = (knex) => knex.schema.alterTable('user', (table) => {
  table.dropColumn('status');
});
