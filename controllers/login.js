var crypto = require('crypto'),
    passport = require('passport'),
    data = require('../models/auth')();


exports.registerPage = function(req, res) {
    res.render('login/register', {
        messages: req.flash('info'),
        username: req.flash('username')
    });
}


exports.registerPost = function(req, res) {
    var vpw = req.body.vpw;
    var pwu = req.body.pw;
    var un = req.body.un;

    req.flash('username', un);

    if(vpw !== pwu) {
        req.flash('info', 'Your passwords did not match.');
        res.redirect('/register');
        return;
    }

    req.checkBody('un', 'Please enter a valid email.').notEmpty().isEmail();
    var errors = req.validationErrors();
    if (errors) {
        var msg = errors[0].msg;
        req.flash('info', 'Your email is invalid');
        res.redirect('/register');
        return;
    }
    
    var new_salt = Math.round((new Date().valueOf() * Math.random())) + '';
    var pw = crypto.createHmac('sha1', new_salt).update(pwu).digest('hex');
    var created = new Date().toISOString().slice(0, 19).replace('T', ' ');

    new data.ApiUser({email: un, password: pw, salt: new_salt, created: created}).save().then(function(model) {
        passport.authenticate('local')(req, res, function () {
            res.redirect('/home');
        })
    }, function(err) {
        req.flash('info', 'Unable to create account.');
        res.redirect('/register');
    });
}


exports.loginPage = function(req, res) {
    res.render('login/login', {
        messages: req.flash('info'),
        username: req.flash('username')
    });
}


exports.checkLogin = function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err || !user) {
            req.flash('username', req.body.un);
            req.flash('info', 'Oops, have you entered the correct details?');
            return res.redirect('/login');
        }
        req.logIn(user, function(err) {
            if (err) {
                req.flash('info', 'Oops, have you entered the correct details?');
                res.redirect('/login');
                return;
            }
            req.flash('info', 'Welcome!');
            res.redirect('/home');
            return;
        });
    })(req, res, next);
}


exports.logout = function(req, res) {
    req.logout();
    req.flash('info', 'You are now logged out.');
    res.redirect('/');
}
