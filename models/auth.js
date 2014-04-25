//var Bookshelf = require('bookshelf').mysqlAuth;

var config = require('../config.js'),
    Bookshelf = require('bookshelf');

Bookshelf.mysqlAuth = Bookshelf.initialize(
    config.development.db
);

module.exports = function() {
    var bookshelf = {};

    Bookshelf = Bookshelf.mysqlAuth;
    // Users table
    bookshelf.ApiUser = Bookshelf.Model.extend({
        tableName: 'users',
        idAttribute: 'id',
        hasTimestamps: ['createdAt', 'updatedAt'],
        allFollowing: function() {
            return this.hasMany(bookshelf.follower);
        },
        following: function() {
            return this.hasMany(bookshelf.follower).query(function(qb) {
                qb.limit(10)
            });
        },
        allFollowers: function() {
            return this.hasMany(bookshelf.follower, 'follows_id');
        },
        followers: function() {
            return this.hasMany(bookshelf.follower, 'follows_id').query(function(qb) {
                qb.limit(10);
            });
        }
    });

    // User collection
    bookshelf.users = Bookshelf.Collection.extend({
        model: bookshelf.ApiUser
    });

    // Followers table. 
    bookshelf.follower = Bookshelf.Model.extend({
        tableName: 'followers',
        idAttribute: 'id',
        hasTimestamps: ['createdAt', 'updatedAt']
    });

    bookshelf.followers = Bookshelf.Collection.extend({
        model: bookshelf.follower
    });

    bookshelf.emailConfirmations = Bookshelf.Model.extend({
        tableName: 'email_confirmations',
        hasTimestamps: ['createdAt', 'updatedAt']
    });

    bookshelf.activity = Bookshelf.Model.extend({
        tableName: 'user_activity',
        hasTimestamps: ['createdAt', 'updatedAt']
    });

    bookshelf.activities = Bookshelf.Collection.extend({
        model: bookshelf.activity
    });

    return bookshelf;
}