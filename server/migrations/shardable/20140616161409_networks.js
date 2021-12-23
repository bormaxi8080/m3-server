exports.up = function(knex, Promise) {
    return knex.schema.createTable('networks', function(table) {
        table.integer('user_id').index().notNullable();
        table.string('network_code', 6).notNullable();
        table.string('network_id').notNullable();
        table.unique(['network_code', 'network_id']);
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('networks');
};
