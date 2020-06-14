exports.up = (knex) => knex.schema.createTable('user', (table) => {
  table.uuid('id').primary('u_id_pk').notNullable();
  table.string('first_name');
  table.string('last_name');
  table.string('email').unique('u_email_uq').notNullable();
  table.string('username').unique('u_username_uq').notNullable();
  table.string('password');
  table.dateTime('last_login').defaultTo(knex.fn.now());
  table.timestamps(false, true);
});

exports.down = (knex) => knex.schema.dropTable('user');
