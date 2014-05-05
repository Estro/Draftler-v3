var crypto = require('crypto'),
    passport = require('passport'),
    data = require('../models/auth')(),
    utils = require('../util/utils'),
    emailServer = require('emailjs/email').manager,
    content = require('../content/english'),
    sanitizer = require('sanitizer');

exports.profile = function(req, res) {
    var userId = utils.cleanNum(req.user.id);
    if (userId) {
        new data.followers().query(function(qb) {
            qb.where({
                user_id: userId
            }).limit(10);
        }).fetch().then(function(result) {

            if (result) {
                var followingArray = [],
                    i;
                for (i = 0; i < result.models.length; i++) {
                    followingArray.push(result.models[i].attributes.follows_id);
                }
                //get follower count
                new data.followers().query(function(qb) {
                    qb.where({
                        follows_id: userId
                    });
                }).fetch({
                    columns: ['follows_id']
                }).then(function(followers) {
                        if (followingArray.length > 0) {
                            new data.users().query(function(qb) {
                                qb.whereIn('id', followingArray);
                            }).fetch({
                                columns: ['id', 'avatar', 'username']
                            }).then(function(followersResult) {
                                var callout = [];
                                if (!req.user.attributes.email_confirmed) {
                                    callout.push(content.profile.ui.notConfirmed);
                                }
                                res.render('profile/myprofile', {
                                    loggedIn: true,
                                    is_admin: req.user.attributes.is_admin,
                                    frame: content.frame.ui,
                                    user: req.user.attributes,
                                    following: followersResult.models,
                                    followers: followers.length,
                                    content: content.profile.ui,
                                    callout: callout
                                });

                            }, function(err) {
                                // Err getting followers details
                            });

                        } else {
                            var callout = [];

                            if (!req.user.attributes.email_confirmed) {
                                callout.push(content.profile.ui.notConfirmed);
                            }

                            res.render('profile/myprofile', {
                                loggedIn: true,
                                is_admin: req.user.attributes.is_admin,
                                frame: content.frame.ui,
                                user: req.user.attributes,
                                following: false,
                                followers: followers.length,
                                content: content.profile.ui,
                                callout: callout
                            });

                        }
                    },
                    function(err) {
                        // Error getting followers
                    });
            }

        }, function() {
            // Error getting followers
        });
    } else {
        res.redirect('/');
    }
};

exports.userProfile = function(req, res) {
    var userId = utils.cleanNum(req.params.userId);
    if (userId) {
        if (userId == req.user.id) {
            res.redirect('/profile');
            return;
        }

        new data.user({
            id: userId
        }).fetch({
            withRelated: ['following', 'allFollowers']
        }).then(function(currentUser) {
            if (currentUser) {
                var followerCount = currentUser.related('allFollowers').length,
                    following = currentUser.related('following').models,
                    followingArray = [],
                    i;

                for (i = 0; i < following.length; i++) {
                    followingArray.push(following[i].attributes.follows_id);
                }

                if (followingArray.length > 0) {

                    new data.users().query(function(qb) {
                        //qb.where('id', '=', '63');
                        qb.whereIn('id', followingArray);
                    }).fetch({
                        columns: ['id', 'avatar', 'username']
                    }).then(function(followersResult) {
                        res.render('profile/profile', {
                            loggedIn: true,
                            is_admin: req.user.attributes.is_admin,
                            frame: content.frame.ui,
                            user: currentUser.attributes,
                            following: followersResult.models,
                            followers: followerCount,
                            content: content.profile.ui
                        });
                    }, function(err) {
                        // Error
                        res.send(404);
                    });

                } else {
                    res.render('profile/profile', {
                        loggedIn: true,
                        is_admin: req.user.attributes.is_admin,
                        frame: content.frame.ui,
                        user: currentUser.attributes,
                        following: false,
                        followers: followerCount,
                        content: content.profile.ui
                    });
                }
            }
        }, function(err) {
            // Error
            res.send(404);
        });
    } else {
        res.redirect('/');
    }
};

exports.editProfile = function(req, res) {
    var userId = utils.cleanNum(req.user.id);
    if (userId) {
        new data.user('id', userId).fetch().then(function(data) {
            if (data && data.attributes) {
                res.render('profile/edit-profile', {
                    loggedIn: true,
                    is_admin: req.user.attributes.is_admin,
                    models: data.attributes,
                    error: req.flash('uerror'),
                    messages: req.flash('uinfo'),
                    user: data.attributes,
                    content: content.editProfile.ui,
                    frame: content.frame.ui
                });
            } else {
                res.redirect('/profile');
            }
        }, function(err) {
            res.send(404);
        });
    } else {
        res.redirect('/');
    }
};


exports.updateProfile = function(req, res) {
    var userId = utils.cleanNum(req.user.id),
        firstname = sanitizer.sanitize(req.body.firstname.trim()),
        surname = sanitizer.sanitize(req.body.surname.trim()),
        email = sanitizer.sanitize(req.body.email.trim()),
        city = sanitizer.sanitize(req.body.city.trim()),
        country = sanitizer.sanitize(req.body.country.trim()),
        bio = sanitizer.sanitize(req.body.bio.trim());

    if (userId) {
        new data.user({
            id: userId
        }).save({
            first_name: firstname,
            last_name: surname,
            email: email,
            bio: bio,
            city: city,
            country: country
        }).then(function(data) {
            req.flash('uinfo', content.editProfile.messages.profileUpdated);
            res.redirect('/profile');
            return;
        }, function() {
            req.flash('uinfo', content.editProfile.messages.updateFailed);
            res.redirect('/profile');
        });
    } else {
        res.redirect('/profile');
    }
};

exports.changePassword = function(req, res) {
    res.render('profile/changePassword', {
        messages: req.flash('p-error'),
        info: req.flash('p-info'),
        frame: content.frame.ui,
        content: content.profile.ui
    });
};

exports.updatePassword = function(req, res) {
    var userId = utils.cleanNum(req.user.id),
        vpw = sanitizer.sanitize(req.body.vpw),
        pwu = sanitizer.sanitize(req.body.pw);

    if (userId) {

        if (vpw.length < 7 || pwu.length < 7) {
            req.flash('p-error', content.profile.messages.failedPassword);
            res.redirect('/resetpassword/' + userId + '/' + token);
        }
        // validate passwords in case of cheaters
        if (vpw !== pwu) {
            req.flash('p-error', content.profile.messages.failedPassword);
            res.redirect('/changepassword');
            return;
        }

        var new_salt = Math.round((new Date().valueOf() * Math.random())) + '',
            pw = crypto.createHmac('sha1', new_salt).update(pwu).digest('hex'),
            created = new Date().toISOString().slice(0, 19).replace('T', ' ');

        new data.user({
            id: userId
        }).save({
            password: pw,
            salt: new_salt,
            user_ip: req.ip
        }).then(function(data) {
            req.flash('info', content.profile.messages.passwordChanged);
            res.redirect('/profile');
        }, function(data) {
            res.redirect('/profile');
        });
    } else {
        res.redirect('/profile');
    }

};