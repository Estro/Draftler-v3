var crypto = require('crypto'),
    passport = require('passport'),
    data = require('../models/auth')(),
    utils = require('../util/utils'),
    content = require('../content/english'),
    jobs = require('../queues/kue'),
    sanitizer = require('sanitizer');

// route /book
exports.redirectBook = function(req, res) {
    res.redirect('/');
};

// route: /book/:id
exports.getBook = function(req, res) {
    var loggedin = false,
        admin = false,
        bookId = req.params.id;

    if (req.user) {
        loggedin = true;
        if (req.user.attributes.is_admin) {
            admin = true;
        }
    }
    var bookId = req.params.id;
    // {
    // withRelated: ['genre', 'editions']
    //}
    new data.book({
        id: bookId
    }).fetch({
        withRelated: ['finalChapters', 'votingChapters']
    }).then(function(book) {
        if (book) {
            res.render('books/book', {
                book: book,
                loggedIn: loggedin,
                is_admin: admin,
                frame: content.frame.ui,
                content: content.book.ui,
                chapters: book.relations.finalChapters.models,
                voting: book.relations.votingChapters.models,
            });
        }
    }, function(err) {
        res.redirect(err);
    });
};