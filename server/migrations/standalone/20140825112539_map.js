exports.up = function(knex, Promise) {
    return knex.schema.createTable('map', function(table) {
        table.increments();
        table.json('data').notNullable();
        table.dateTime('created_at').notNullable();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('map');
};
