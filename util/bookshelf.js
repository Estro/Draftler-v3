var config = require('../config.js');
module.exports = function(Bookshelf) {  
    Bookshelf.mysqlAuth = Bookshelf.initialize(
        config.development.db
    );
}
