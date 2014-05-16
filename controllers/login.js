var crypto = require('crypto'),
    passport = require('passport'),
    data = require('../models/auth')(),
    utils = require('../util/utils'),
    content = require('../content/english'),
    jobs = require('../queues/kue'),
    sanitizer = require('sanitizer');

// Route: register
// Render signup form
exports.registerPage = function(req, res) {
    res.render('login/register', {
        messages: req.flash('error'),
        username: req.flash('username'),
        content: content.login.ui,
        frame: content.frame.ui,
        validation: content.validation
    });
};

// route: POST register
// Validate and save user sign in details.
exports.registerPost = function(req, res) {
    // get all field values
    var vpw = sanitizer.sanitize(req.body.vpw),
        pwu = sanitizer.sanitize(req.body.pw),
        un = sanitizer.sanitize(req.body.un),
        email = sanitizer.sanitize(req.body.email),
        hashgen = utils.generateToken(30);

    // check for empties 
    if (!vpw.length || !pwu.length || !un.length || !email.length) {
        req.flash('error', content.login.messages.missingField);
        res.redirect('/register');
    }

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

    new data.user({
        username: un
    }).fetch().then(function(result) {
        if (result) {
            req.flash('error', content.login.messages.usernameTaken);
            res.redirect('/register');
        } else {
            // first save user in users table
            new data.user({
                username: un,
                email: email,
                password: pw,
                salt: new_salt,
                user_ip: req.ip
            }).save().then(function(model) {

                    // once complete, save row in email confirmation table
                    new data.emailConfirmations({
                        user_id: model.attributes.id,
                        token: hashgen,
                        user_ip: req.ip
                    }).save().then(function(data) {

                        //Send email via kue
                        jobs.sendSignUpEmail(un, email, data.attributes.token, data.attributes.user_id);

                        // Log user join draftler to activity feed via kue
                        jobs.userActivity(1, model.attributes.id, null);


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
    }, function(err) {
        res.redirect('/register');
    });
};

// route: login
// Render login form
exports.loginPage = function(req, res) {
    // render login page.
    res.render('login/login', {
        messages: req.flash('error'),
        info: req.flash('info'),
        username: req.flash('username'),
        frame: content.frame.ui,
        content: content.login.ui,
        validation: content.validation,
        refer: req.headers.referer
    });
};

// route: login
// Render POST login
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

            if (req.body.refer) {
                res.redirect(req.body.refer);
                return;
            } else {
                // if all went ok, redirect to homepage as a logged in user!
                res.redirect('/');
                return;
            }
        });
    })(req, res, next);
};


exports.resendEmailRedirect = function(req, res) {
    // get userId and token from query 
    var userId = utils.cleanNum(req.user.id);
    res.redirect('/resendemail/' + userId);
};

// route: resendemail/:id
// render resend email from
exports.resendEmailPage = function(req, res) {
    // get userId and token from query 
    var userId = utils.cleanNum(req.params.id);
    if (userId) {
        res.render('login/resend-confirmation', {
            user: userId,
            frame: content.frame.ui,
            content: content.login.ui
        });
    } else {
        res.redirect('/');
    }
};

// route: POST resendemail/:id
// validate and trigger confirmation email
exports.resendEmail = function(req, res) {
    var userId = utils.cleanNum(req.params.id);

    if (userId) {
        new data.user('id', userId).fetch().then(function(data) {
            userId = data.attributes.id,
            email = data.attributes.email,
            username = data.attributes.username,
            hashgen = utils.generateToken(30);

            new data.emailConfirmations({
                user_id: userId,
                token: hashgen,
                user_ip: req.ip
            }).save().then(function(data) {
                //Send email via kue
                jobs.sendSignUpEmail(username, email, data.attributes.token, data.attributes.user_id);

                req.flash('info', content.login.messages.messageResent);
                res.redirect('/');
            });
        }, function() {
            // Error
            req.flash('error', content.login.messages.messageResentError);
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
};


// route: emailconfirmation/:id/:token
// validate and update user to confirmed
exports.confirmEmail = function(req, res) {
    // get userId and token from query 
    var userId = utils.cleanNum(req.params.id),
        token = sanitizer.sanitize(req.params.token);

    if (userId && token.length) {
        new data.emailConfirmations({
            token: token,
            user_id: userId
        }).fetch().then(function(item) {
            if (item) {
                var itemId = item.attributes.id,
                    is_used = item.attributes.is_used;

                if (!is_used) {

                    new data.emailConfirmations({
                        id: itemId
                    }).save({
                        is_used: 1,
                        user_ip: req.ip
                    }).then(function(userConfirmation) {

                        var created = userConfirmation.attributes.created_at,
                            validToDate = new Date();
                        validToDate.setDate(validToDate.getDate() - 3);

                        if (validToDate > created) {
                            // Ite's been to long!
                            res.redirect('/resendemail/' + userId);
                        } else {
                            // still valid
                            if (userConfirmation) {

                                new data.user({
                                    id: userId
                                }).save({
                                    'email_confirmed': 1
                                }).then(function(data) {
                                    res.redirect('/');
                                    return;
                                }, function(ee) {
                                    res.redirect('/resendemail/' + userId);
                                });
                            }
                        }
                    }, function(err) {
                        res.redirect('/resendemail/' + userId);
                    });

                } else {
                    res.redirect('/resendemail/' + userId);
                }
            }
        }, function(err) {
            res.redirect('/resendemail/' + userId);
        });
    } else {
        res.redirect('/');
    }

};

// log user out.
exports.logout = function(req, res) {
    req.logout();
    req.flash('info', content.login.messages.loggedOut);
    res.redirect('/');
};