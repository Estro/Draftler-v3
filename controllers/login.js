var crypto = require('crypto'),
    passport = require('passport'),
    data = require('../models/auth')(),
    utils = require('../util/utils'),
    emailServer = require('emailjs/email').manager;


exports.registerPage = function(req, res) {
    res.render('login/register', {
        messages: req.flash('info'),
        username: req.flash('username')
    });
}

exports.forgotten = function(req, res) {
    res.render('login/forgotten');

}


exports.registerPost = function(req, res) {
    // get all field values
    var vpw = req.body.vpw,
        pwu = req.body.pw,
        un = req.body.un,
        email = req.body.email;

    // validate passwords in case of cheaters
    if (vpw !== pwu) {
        req.flash('info', 'Your passwords did not match.');
        res.redirect('/register');
        return;
    }

    // valid email address
    req.checkBody('email', 'Please enter a valid email.').notEmpty().isEmail();
    var errors = req.validationErrors();
    if (errors) {
        var msg = errors[0].msg;
        req.flash('info', 'Your email is invalid');
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
        created: created
    }).save().then(function(model) {

            // once complete, save row in email confirmation table
            new data.emailConfirmations({
                userId: model.attributes.id,
                hash: utils.generateToken(30)
            }).save().then(function(data) {

                // Send email confirmation. Need to move to a queue job?
                emailServer.send({
                    from: 'mpomeroy@wearearchitect.com',
                    to: email,
                    subject: 'Email Confirmation',
                    text: 'Confirm Email',
                    attachment: utils.composeConfimrationEmail(data.attributes.userId, data.attributes.hash, un)
                }, function(err, message) {
                    console.log(err || message);
                });

                // all complete, redirect to homepage after authenicating 
                passport.authenticate('local')(req, res, function() {
                    res.redirect('/home');
                }, function() {
                    req.flash('info', 'Your email is already registered');
                    res.redirect('/register');

                })

            });
        },
        function(err) {
            // this seems wrong, but seems to error when email has already been taken
            req.flash('info', 'Your email is already registered');
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
    // really need to understand how this works!
    passport.authenticate('local', function(err, user, info) {
        if (err || !user) {
            // pass back error message and redirect to login
            req.flash('info', 'Oops, have you entered the correct details?');
            return res.redirect('/login');
        }
        req.logIn(user, function(err) {
            if (err) {
                // and again
                req.flash('info', 'Oops, have you entered the correct details?');
                res.redirect('/login');
                return;
            }
            // if all went ok, redirect to homepage as a logged in user!
            res.redirect('/home');
            return;
        });
    })(req, res, next);
}

exports.confirmEmail = function(req, res, next) {
    // get UserID and token from query 
    var userID = req.params.id,
        token = req.params.token;

    // Send email. - need to move this to a queue
    new data.emailConfirmations({
        userId: userID,
        hash: token
    }).fetch().then(function(userConfirmation) {
        // if there is an account returned
        // check date
        var created = userConfirmation.attributes.updatedAt,
            validToDate = new Date();
        validToDate.setDate(validToDate.getDate() - 3);
        if (validToDate > created) {
            // Ite's been to long!
            console.log('too old');
        } else {
            // still valid
            if (userConfirmation) {
                // new data.ApiUser({
                //     id: userID
                // }).save({
                //     'email_confirmed': 1
                // }).then(function(data) {
                //     console.log('yup');
                //     return;
                // });
            }
            res.redirect('/home');
            return;
        }
    });
}


exports.logout = function(req, res) {
    req.logout();
    req.flash('info', 'You are now logged out.');
    res.redirect('/');
}