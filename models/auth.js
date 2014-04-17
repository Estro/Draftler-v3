var Bookshelf = require('bookshelf').mysqlAuth;

module.exports = function() {
    var bookshelf = {};

    bookshelf.ApiUser = Bookshelf.Model.extend({
        tableName: 'users',
        hasTimestamps: ['createdAt', 'updatedAt']
    });

    bookshelf.emailConfirmations = Bookshelf.Model.extend({
        tableName: 'email_confirmations',
        hasTimestamps: ['createdAt', 'updatedAt']
    });

    return bookshelf;
}