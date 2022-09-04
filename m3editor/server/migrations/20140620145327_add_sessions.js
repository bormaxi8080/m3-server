
exports.up = function(knex, Promise) {
    return knex.schema.createTable('sessions', function(table) {
        table.increments();
        table.string('token').unique().notNullable();
        table.integer('user_id').unique().notNullable().references('id').inTable('users');
        table.timestamps();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('sessions');
};
