//var Bookshelf = require('bookshelf').mysqlAuth;

var config = require('../config.js'),
    Bookshelf = require('bookshelf'),
    knex = require('knex');

Bookshelf.mysqlAuth = Bookshelf.initialize(
    config.development.db
);

knex.mysqlAuth = knex.initialize(
 config.development.db
);

Bookshelf = Bookshelf.mysqlAuth;

module.exports = function() {
    var bookshelf = {};

    bookshelf.knex = knex.mysqlAuth;
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
        },
        activity: function (){
            return this.hasMany(bookshelf.activity).query(function (qb){
                qb.limit(20).orderBy('completedAt','DESC');
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

    bookshelf.passwords = Bookshelf.Model.extend({
        tableName: 'password_resets',
        hasTimestamps: ['createdAt', 'updatedAt']
    });

    return bookshelf;
}