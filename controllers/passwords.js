var crypto = require('crypto'),
    passport = require('passport'),
    data = require('../models/auth')(),
    utils = require('../util/utils'),
    content = require('../content/english'),
    jobs = require('../queues/kue');


exports.forgotten = function(req, res) {
    res.render('login/forgotten', {
        frame: content.frame.ui,
        messages: req.flash('p-error'),
        content: content.login.ui
    });
}

exports.sendPassword = function(req, res) {
    var email = req.body.email;
    req.checkBody('email', content.login.messages.invalidEmail).notEmpty().isEmail();
    var errors = req.validationErrors();
    if (errors) {
        var msg = errors[0].msg;
        req.flash('error', content.login.messages.invalidEmail);
        res.redirect('/forgot');
        return;
    }
    new data.ApiUser({
        email: email
    }).fetch().then(function(user) {
        if (user) {

            var userId = user.attributes.id,
                email = user.attributes.email,
                username = user.attributes.username,
                hashgen = utils.generateToken(30);

            new data.passwords({
                user_id: userId,
                token: hashgen,
                user_ip: req.ip
            }).save().then(function(data) {
                jobs.sendPasswordReset(username, email, data.attributes.token, data.attributes.user_id);
                res.redirect('/password-sent');

            }, function(err) {
                // do nothing so i dont give anything away!
                res.redirect('/password-sent');
            });

        } else {
            // false
            res.redirect('/password-sent');
        }
    });
}

exports.updatePassword = function(req, res) {
    var userId = req.body.userid,
        token = req.body.token,
        vpw = req.body.vpw,
        pwu = req.body.pw

        // validate passwords in case of cheaters
    if (vpw !== pwu) {
        req.flash('p-error', content.login.messages.failedPassword);
        res.redirect('/resetpassword/' + userId + '/' + token);
        return;
    }

    new data.passwords({
        token: token,
        user_id: userId
    }).fetch().then(function(item) {
        if (item) {
            var itemId = item.attributes.id;
            new data.passwords({
                id: itemId
            }).save({
                isUsed: 1,
                user_ip: req.ip
            }, {
                patch: true
            }).then(function(userConfirmation) {
                // create salt and hash password
                var new_salt = Math.round((new Date().valueOf() * Math.random())) + '',
                    pw = crypto.createHmac('sha1', new_salt).update(pwu).digest('hex'),
                    created = new Date().toISOString().slice(0, 19).replace('T', ' ');

                new data.ApiUser({
                    id: userId
                }).save({
                    password: pw,
                    salt: new_salt,
                    user_ip: req.ip
                }).then(function(data) {
                    req.flash('info', content.login.messages.passwordChanged);
                    res.redirect('/login');
                }, function(data) {
                    res.redirect('/login');
                });
            }, function(err) {
                res.redirect('/');
            });
        } else {
            res.redirect('/');
        }
    }, function(err) {
        res.redirect('/');
    });

}

exports.resetPassword = function(req, res) {
    var userId = req.params.userid,
        token = req.params.token;

    new data.passwords({
        token: token,
        user_id: userId
    }).fetch().then(function(item) {
        if (item) {
            var itemId = item.attributes.id,
                isUsed = item.attributes.isUsed;

            if (!isUsed) {

                var created = item.attributes.createdAt,
                    validToDate = new Date();
                validToDate.setDate(validToDate.getDate() - 1);

                if (validToDate > created) {
                    // Ite's been to long!
                    res.render('login/passwordexpired', {
                        frame: content.frame.ui,
                        content: content.login.ui
                    });
                } else {
                    res.render('login/resetpassword', {
                        frame: content.frame.ui,
                        content: content.login.ui,
                        userid: userId,
                        token: token,
                        messages: req.flash('p-error')
                    });

                }
            } else {
                res.render('login/passwordexpired', {
                    frame: content.frame.ui,
                    content: content.login.ui
                });
            }

        }
    }, function(err) {
        res.render('login/passwordexpired', {
            frame: content.frame.ui,
            content: content.login.ui
        });
    });

}

exports.passwordSent = function(req, res) {
    res.render('login/passwordsent', {
        frame: content.frame.ui,
        content: content.login.ui
    });

}