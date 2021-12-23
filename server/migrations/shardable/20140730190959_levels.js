exports.up = function(knex, Promise) {
    return knex.schema.createTable('levels', function(table) {
        table.integer('user_id').notNullable();
        table.string('level').notNullable();
        table.integer('score').notNullable();
        table.primary(['user_id', 'level']);
        table.timestamp('updated_at').notNullable();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('levels');
};
