var Bookshelf = require('bookshelf').mysqlAuth;

module.exports = function() {
    var bookshelf = {};

    bookshelf.ApiUser = Bookshelf.Model.extend({
        tableName: 'users',
        hasTimestamps: ['createdAt', 'updatedAt']
    });

    bookshelf.users = Bookshelf.Collection.extend({
        model: bookshelf.ApiUser
    });

    bookshelf.emailConfirmations = Bookshelf.Model.extend({
        tableName: 'email_confirmations',
        hasTimestamps: ['createdAt', 'updatedAt']
    });

    return bookshelf;
}