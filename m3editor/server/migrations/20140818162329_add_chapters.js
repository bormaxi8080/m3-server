exports.up = function(knex, Promise) {
    return knex.schema.createTable('chapters', function(table) {
        table.increments();
        table.integer('order').unique().notNullable();
        table.json('data').notNullable();
        table.timestamps();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('chapters');
};
