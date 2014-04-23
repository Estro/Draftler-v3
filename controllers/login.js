var crypto = require('crypto'),
    passport = require('passport'),
    data = require('../models/auth')(),
    utils = require('../util/utils'),
    content = require('../content/english'),
    jobs = require('../queues/kue');




exports.registerPage = function(req, res) {
    res.render('login/register', {
        messages: req.flash('error'),
        username: req.flash('username'),
        content: content.login.ui,
        frame: content.frame.ui
    });
}

exports.forgotten = function(req, res) {
    res.render('login/forgotten', {
        frame: content.frame.ui,
        content: content.login.ui
    });

}


exports.registerPost = function(req, res) {
    // get all field values
    var vpw = req.body.vpw,
        pwu = req.body.pw,
        un = req.body.un,
        email = req.body.email,
        hashgen = utils.generateToken(30);

    // validate passwords in case of cheaters
    if (vpw !== pwu) {
        req.flash('error', content.login.messages.failedPassword);
        res.redirect('/register');
        return;
    }

    // valid email address
    req.checkBody('email', content.login.messages.invalidEmail).notEmpty().isEmail();
    var errors = req.validationErrors();
    if (errors) {
        var msg = errors[0].msg;
        req.flash('error', content.login.messages.invalidEmail);
        res.redirect('/register');
        return;
    }

    // create salt and hash password
    var new_salt = Math.round((new Date().valueOf() * Math.random())) + '',
        pw = crypto.createHmac('sha1', new_salt).update(pwu).digest('hex'),
        created = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // first save user in users table
    new data.ApiUser({
        username: un,
        email: email,
        password: pw,
        salt: new_salt,
        user_ip: req.ip
    }).save().then(function(model) {

            // once complete, save row in email confirmation table
            new data.emailConfirmations({
                userId: model.attributes.id,
                hash: hashgen
            }).save().then(function(data) {

                //Send email via kue
                jobs.sendSignUpEmail(un, email, data.attributes.hash, data.attributes.userId);


                // all complete, redirect to homepage after authenicating 
                passport.authenticate('local')(req, res, function() {
                    res.redirect('/');
                }, function() {
                    req.flash('error', content.login.messages.alreadyRegistered);
                    res.redirect('/register');

                })

            });
        },
        function(err) {
            // this seems wrong, but seems to error when email has already been taken
            req.flash('error', content.login.messages.alreadyRegistered);
            res.redirect('/register');
        });
}


exports.loginPage = function(req, res) {
    res.render('login/login', {
        messages: req.flash('error'),
        username: req.flash('username'),
        frame: content.frame.ui,
        content: content.login.ui
    });
}


exports.checkLogin = function(req, res, next) {
    // really need to understand how this works!
    passport.authenticate('local', function(err, user, info) {
        if (err || !user) {
            // pass back error message and redirect to login
            req.flash('error', content.login.messages.incorrectDetails);
            return res.redirect('/login');
        }
        req.logIn(user, function(err) {
            if (err) {
                // and again
                req.flash('error', content.login.messages.incorrectDetails);
                res.redirect('/login');
                return;
            }
            // if all went ok, redirect to homepage as a logged in user!
            res.redirect('/');
            return;
        });
    })(req, res, next);
}


exports.resendEmailPage = function(req, res) {
    // get UserID and token from query 
    var userID = req.params.id;
    res.render('login/resend-confirmation', {
        user: userID,
        frame: content.frame.ui,
        content: content.login.ui
    });

}

exports.resendEmail = function(req, res) {
    var userID = req.params.id;

    new data.ApiUser('id', userID).fetch().then(function(data) {
        userId = data.attributes.id,
        email = data.attributes.email,
        username = data.attributes.username,
        hashgen = utils.generateToken(30);

        new data.emailConfirmations({
            userId: userId,
            hash: hashgen
        }).save().then(function(data) {
            // Send email confirmation. Need to move to a queue job?
            emailServer.send({
                from: 'martpomeroy@gmail.com',
                to: email,
                subject: 'Email Confirmation',
                text: 'Confirm Email',
                attachment: utils.composeConfimrationEmail(data.attributes.userId, data.attributes.hash, username)
            }, function(err, message) {
                req.flash('info', content.login.messages.messageResent);
                res.redirect('/');
            });

            req.flash('error', content.login.messages.messageResent);
            res.redirect('/');
        });
    }, function() {
        // Error
        req.flash('error', content.login.messages.messageResentError);
        res.redirect('/');
    });

}

exports.confirmEmail = function(req, res) {
    // get UserID and token from query 
    var userID = req.params.id,
        token = req.params.token;

    new data.emailConfirmations({
        hash: token,
        userID: userID
    }).save({
        isUsed: 1
    }).then(function(userConfirmation) {

        var created = userConfirmation.attributes.updatedAt,
            validToDate = new Date();
        validToDate.setDate(validToDate.getDate() - 3);

        if (validToDate > created) {
            // Ite's been to long!
            res.redirect('login/resend-confirmation/' + userID);
        } else {
            // still valid
            if (userConfirmation) {
                new data.ApiUser({
                    id: userID
                }).save({
                    'email_confirmed': 1
                }).then(function(data) {
                    res.redirect('/');
                    return;
                }, function(ee) {
                    res.redirect('login/resend-confirmation/' + userID);
                });
            }
        }
    }, function(err) {
        res.redirect('login/resend-confirmation/' + userID);
    });

}


exports.logout = function(req, res) {
    req.logout();
    req.flash('info', content.login.messages.loggedOut);
    res.redirect('/');
}