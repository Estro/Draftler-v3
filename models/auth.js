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
    bookshelf.user = Bookshelf.Model.extend({
        tableName: 'user',
        idAttribute: 'id',
        hasTimestamps: ['created_at', 'updated_at'],
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
                qb.limit(20).orderBy('completed_at','DESC');
            });
        }
    });

    // User collection
    bookshelf.users = Bookshelf.Collection.extend({
        model: bookshelf.user
    });

    // Followers table. 
    bookshelf.follower = Bookshelf.Model.extend({
        tableName: 'follower',
        idAttribute: 'id',
        hasTimestamps: ['created_at', 'updated_at']
    });

    bookshelf.followers = Bookshelf.Collection.extend({
        model: bookshelf.follower
    });

    bookshelf.emailConfirmations = Bookshelf.Model.extend({
        tableName: 'email_confirmation',
        idAttribute: 'id',
        hasTimestamps: ['created_at', 'updated_at']
    });

    bookshelf.activity = Bookshelf.Model.extend({
        tableName: 'user_activity',
        idAttribute: 'id',
        hasTimestamps: ['created_at', 'updated_at']
    });

    bookshelf.activities = Bookshelf.Collection.extend({
        model: bookshelf.activity
    });

    bookshelf.passwords = Bookshelf.Model.extend({
        tableName: 'password_reset',
        idAttribute: 'id',
        hasTimestamps: ['created_at', 'updated_at']
    });

    return bookshelf;
}