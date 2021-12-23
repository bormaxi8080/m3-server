'use strict';

exports.up = function(knex, Promise) {
    return knex.schema.createTable('invites', function(table) {
        table.string('network_code', 6).notNullable();
        table.string('network_id').notNullable();
        table.integer('user_id').unsigned().notNullable();
        table.json('data');
        table.boolean('is_invited').notNullable().defaultTo(false);
        table.timestamp('created_at').notNullable();
        table.unique(['network_code', 'network_id', 'user_id']);
        table.index(['user_id', 'network_code']);
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('invites');
};
