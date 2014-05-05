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

    // --------------------------------------------USERS-------------------------------------------------

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
        activity: function() {
            return this.hasMany(bookshelf.activity).query(function(qb) {
                qb.limit(20).orderBy('completed_at', 'DESC');
            });
        },
        chapters: function() {
            return this.hasMany(bookshelf.chapter);
        },
        books: function() {
            return this.hasMany(bookshelf.book).through(bookshelf.chapter);
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


    // --------------------------------------------BOOKS-------------------------------------------------

    //Books
    bookshelf.book = Bookshelf.Model.extend({
        tableName: 'book',
        idAttribute: 'id',
        hasTimestamps: ['created_at', 'updated_at'],
        chapters: function() {
            return this.hasMany(bookshelf.chapter);
        },
        tags: function() {
            return this.belongsToMany(bookshelf.tag);
        },
        genres: function() {
            return this.belongsToMany(bookshelf.genre);
        },
        comments: function() {
            return this.hasMany(bookshelf.comment).through(bookshelf.chapter);
        }
    });

    // Book collection
    bookshelf.books = Bookshelf.Collection.extend({
        model: bookshelf.book
    });

    //Chapter
    bookshelf.chapter = Bookshelf.Model.extend({
        tableName: 'chapter',
        idAttribute: 'id',
        hasTimestamps: ['created_at', 'updated_at'],
        book: function() {
            return this.belongsTo(bookshelf.chapter);
        },
        author: function() {
            return this.belongsTo(bookshelf.user);
        }
    });

    // Chapter Collection
    bookshelf.chapters = Bookshelf.Collection.extend({
        model: bookshelf.chapter
    });

    // Book Tags
    bookshelf.tag = Bookshelf.Model.extend({
        tableName: 'tag',
        idAttribute: 'id',
        hasTimestamps: ['created_at', 'updated_at'],
        books: function() {
            return this.belongsToMany(bookshelf.book);
        }
    });

    // Tag Collection
    bookshelf.tags = Bookshelf.Collection.extend({
        model: bookshelf.tag
    });


    // Book Genres
    bookshelf.genre = Bookshelf.Model.extend({
        tableName: 'genre',
        idAttribute: 'id',
        hasTimestamps: ['created_at', 'updated_at'],
        books: function() {
            return this.belongsToMany(bookshelf.book);
        }
    });

    // Genre Collection
    bookshelf.genres = Bookshelf.Collection.extend({
        model: bookshelf.genre
    });

    // Comments
    bookshelf.comment = Bookshelf.Model.extend({
        tableName: 'comment',
        idAttribute: 'id',
        hasTimestamps: ['created_at', 'updated_at'],
        chapter: function() {
            return this.belongsTo(bookshelf.chapter);
        },
        book: function() {
            return this.belongsTo(bookshelf.book).through(bookshelf.chapter);
        }
    });

    // Comment Collection
    bookshelf.comments = Bookshelf.Collection.extend({
        model: bookshelf.comment
    });

    // Book read
    bookshelf.read = Bookshelf.Model.extend({
        tableName: 'read',
        idAttribute: 'id',
        hasTimestamps: ['created_at', 'updated_at']

    });

    // book reads
    bookshelf.reads = Bookshelf.Collection.extend({
        model: bookshelf.read
    });


    // Chapter votes
    bookshelf.vote = Bookshelf.Model.extend({
        tableName: 'vote',
        idAttribute: 'id',
        hasTimestamps: ['created_at', 'updated_at']

    });

    // Votes Collection
    bookshelf.votes = Bookshelf.Collection.extend({
        model: bookshelf.vote
    });

    return bookshelf;
}