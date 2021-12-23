exports.up = function(knex, Promise) {
    return knex.schema.createTable('storage', function(table) {
        table.uuid('storage_session').notNullable().unique();
        table.uuid('client_session').notNullable();
        table.string('network_code', 6).notNullable();
        table.string('network_id').notNullable();
        table.json('data').notNullable().defaultTo('{}');
        table.timestamp('updated_at').notNullable();
        table.unique(['network_code', 'network_id']);
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('storage');
};
