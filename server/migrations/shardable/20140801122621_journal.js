exports.up = function(knex, Promise) {
    return knex.schema.createTable('journal', function(table) {
        table.integer('user_id').notNullable();
        table.uuid('session_id').notNullable();
        table.timestamp('created_at').notNullable();
        table.string('type').notNullable();
        table.json('event');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('journal');
};
