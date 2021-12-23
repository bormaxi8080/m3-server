'use strict';

exports.up = function(knex, Promise) {
    return knex.schema.createTable('messages', function(table) {
        table.increments();
        table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.json('data').defaultTo('{}');
        table.boolean('is_readed').notNullable().defaultTo(false);
        table.timestamp('created_at').notNullable();
        table.timestamp('readed_at');
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('messages');
};
