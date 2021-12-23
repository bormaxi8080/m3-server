exports.up = function(knex, Promise) {
    return knex.schema.raw("CREATE SEQUENCE user_id_sequence");
};

exports.down = function(knex, Promise) {
    return knex.schema.raw("DROP SEQUENCE user_id_sequence");
};
