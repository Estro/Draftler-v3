var config = require('../config.js');

module.exports = function(Bookshelf, Knex) {
    Bookshelf.mysqlAuth = Bookshelf.initialize(
        config.development.db
    );

    // Bookshelf.Knex = Knex.initialize(
    //     config.development.db
    // );


}