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
        }, function(err) {
            // Error getting followers
        });

    }, function() {
        // Error getting followers
    });
}

exports.userProfile = function(req, res) {
    var userID = req.params.userid;

    if (userID == req.user.id){
       res.redirect('/profile');
       return;
    }

    new data.ApiUser({
        id: userID
    }).fetch({
        withRelated: ['following', 'allFollowers']
    }).then(function(currentUser) {
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
                res.send(err);
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
    }, function(err) {
        // Error
        res.send(err);
    });
}