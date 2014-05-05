var crypto = require('crypto'),
    passport = require('passport'),
    data = require('../models/auth')(),
    utils = require('../util/utils'),
    content = require('../content/english'),
    sanitizer = require('sanitizer');

exports.home = function(req, res) {
    res.redirect('/Explore');
}


exports.userHome = function(req, res) {

    var loggedin = false,
        admin = false,
        itemsPerSection = 10,
        daysPerRound = 72,
        i, current = new Date(), dif, start, total, pastTime,
        totalTime = 259200;

    if (req.user) {
            loggedin = true;
        if (req.user.attributes.is_admin) {
            admin = true;
        }
    }

    new data.books().query(function(qb) {
        qb.limit(itemsPerSection).orderBy('created_at', 'DESC').where('is_featured', 1);
    }).fetch().then(function(books) {

        for (i = 0; i < books.length; i++) {
            start = new Date(books.models[i].attributes.stage_changed);
            current = new Date();
            dif =  current.getTime() - start.getTime();
            pastTime = Math.abs(dif / 1000);
            books.models[i].attributes.remaining_time = Math.abs(100 - ((pastTime/totalTime) * 100));
        }

        res.render('index/home', {
            loggedIn: loggedin,
            is_admin: admin,
            frame: content.frame.ui,
            content: content.spotlight.ui,
            callout: [content.spotlight.ui.findOutMore],
            books: books.models
        });

    }, function(err) {
        // Error
    });
}