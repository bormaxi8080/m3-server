
exports.up = function(knex, Promise) {
    return knex.schema.createTable('levels', function(table) {
        table.increments();
        table.string('name').unique().notNullable();
        table.json('data').notNullable();
        table.integer('chapter_id').references('id').inTable('chapters');
        table.integer('chapter_order');
        table.string('group');
        table.unique(['chapter_id', 'chapter_order', 'group']);
        table.timestamps();
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('levels');
};
