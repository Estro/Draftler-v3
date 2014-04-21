var Bookshelf = require('bookshelf').mysqlAuth;

module.exports = function() {
    var bookshelf = {};

    bookshelf.ApiUser = Bookshelf.Model.extend({
        tableName: 'users',
        idAttribute: 'id',
        hasTimestamps: ['createdAt', 'updatedAt'],
        allFollowing: function (){
            return this.hasMany(bookshelf.follower);
        },
        following: function (){
            return this.hasMany(bookshelf.follower).query(function (qb){
                qb.limit(10)
            });
        },
        allFollowers: function (){
            return this.hasMany(bookshelf.follower, 'follows_id');
        },
        followers: function (){
            return this.hasMany(bookshelf.follower, 'follows_id').query(function (qb){
                qb.limit(10);
            });
        }
    });

    bookshelf.users = Bookshelf.Collection.extend({
        model: bookshelf.ApiUser
    });

    bookshelf.follower = Bookshelf.Model.extend({
        tableName: 'followers',
        idAttribute: 'idfollowers',
        hasTimestamps: ['createdAt', 'updatedAt']
    });

    bookshelf.followers = Bookshelf.Collection.extend({
        model: bookshelf.follower
    });

    bookshelf.emailConfirmations = Bookshelf.Model.extend({
        tableName: 'email_confirmations',
        hasTimestamps: ['createdAt', 'updatedAt']
    });

    return bookshelf;
}