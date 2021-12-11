
exports.up = function (knex) {
    return knex.schema.createTable('pictures', tbl => {
        tbl.increments()
        tbl.text('src', 128).notNullable()
        tbl.string('name').notNullable()
    })
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('users')
};
