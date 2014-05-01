var crypto = require('crypto'),
    passport = require('passport'),
    data = require('../models/auth')(),
    utils = require('../util/utils'),
    emailServer = require('emailjs/email').manager,
    content = require('../content/english');

exports.profile = function(req, res) {
    var userid = req.user.id;

    new data.followers().query(function(qb) {
        qb.where({
            user_id: userid
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
                    follows_id: userid
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
                            res.render('profile/myprofile', {
                                loggedIn: true,
                                isAdmin: req.user.attributes.isAdmin,
                                frame: content.frame.ui,
                                user: req.user.attributes,
                                following: followersResult.models,
                                followers: followers.length,
                                content: content.profile.ui
                            });

                        }, function(err) {
                            // Err getting followers details
                        });

                    } else {
                        res.render('profile/myprofile', {
                            loggedIn: true,
                            isAdmin: req.user.attributes.isAdmin,
                            frame: content.frame.ui,
                            user: req.user.attributes,
                            following: false,
                            followers: followers.length,
                            content: content.profile.ui
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
};

exports.userProfile = function(req, res) {
    var userID = req.params.userid;

    if (userID == req.user.id) {
        res.redirect('/profile');
        return;
    }

    new data.ApiUser({
        id: userID
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
                        isAdmin: req.user.attributes.isAdmin,
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
                    isAdmin: req.user.attributes.isAdmin,
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
};

exports.editProfile = function(req, res) {
    var userID = req.user.id;
    new data.ApiUser('id', userID).fetch().then(function(data) {
        if (data && data.attributes) {
            res.render('profile/edit-profile', {
                loggedIn: true,
                isAdmin: req.user.attributes.isAdmin,
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
};


exports.updateProfile = function(req, res) {
    var userID = req.user.id;
    firstname = req.body.firstname.trim(),
    surname = req.body.surname.trim(),
    email = req.body.email.trim(),
    city = req.body.city.trim(),
    country = req.body.country.trim(),
    bio = req.body.bio.trim();

    new data.ApiUser({
        id: userID
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
    var userId = req.user.id
    vpw = req.body.vpw,
        pwu = req.body.pw

        // validate passwords in case of cheaters
    if (vpw !== pwu) {
        req.flash('p-error', content.profile.messages.failedPassword);
        res.redirect('/changepassword');
        return;
    }

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
        req.flash('info', content.profile.messages.passwordChanged);
        res.redirect('/profile');
    }, function(data) {
        res.redirect('/profile');
    });

};