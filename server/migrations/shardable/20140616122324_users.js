exports.up = function(knex, Promise) {
    return knex.schema.createTable('users', function(table) {
        table.integer('id').index().primary();
        table.integer('progress').defaultTo(1).notNullable();
        table.integer('sharing_count').defaultTo(0).notNullable();
        table.integer('real_balance').defaultTo(0).notNullable();
        table.integer('game_balance').defaultTo(0).notNullable();
        table.string('group').defaultTo('default').notNullable();
        table.bigInteger('migration').defaultTo(0).notNullable();
        table.boolean('tester').defaultTo(false).notNullable();
        table.json('data').defaultTo('{}').notNullable();
        table.timestamp('finish_level_time');
        table.timestamps();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('users');
};
