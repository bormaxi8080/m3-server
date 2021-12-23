exports.up = function(knex, Promise) {
    return knex.schema.createTable('sessions', function(table) {
        table.integer('user_id').notNullable();
        table.uuid('session_id').primary();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('sessions');
};
