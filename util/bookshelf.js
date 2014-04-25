var config = require('../config.js'),
    Bookshelf = require('bookshelf');

module.exports = function(Knex) {
    Bookshelf.mysqlAuth = Bookshelf.initialize(
        config.development.db
    );

    // Bookshelf.Knex = Knex.initialize(
    //     config.development.db
    // );


}