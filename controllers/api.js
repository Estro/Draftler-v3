var crypto = require('crypto'),
    passport = require('passport'),
    data = require('../models/auth')();


exports.checkUsername = function(req, res, next) {
    var un = req.params.username;
    new data.ApiUser({
        username: un
    }).fetch().then(function(user) {
        if (user) {
            res.send({
                username: 'taken'
            });
        } else {
            res.send({
                username: 'available'
            });
        }
    }, function(err) {
        res.send(err);
    });
}


exports.followUser = function(req, res, next) {
    var userid = req.params.userid;
    new data.ApiUser({
        id: userid
    }).fetch().then(function(user) {
        //check if already there
        if (user) {
            var follow = new data.follower({
                users_id: req.user.id,
                follows_id: userid
            });

            follow.fetch().then(function(follower) {
                if (follower) {
                    res.send({
                        status: 'Already following'
                    });
                } else {
                    follow.save().then(function() {
                        res.send({
                            status: 'successful'
                        });
                    }, function(err) {
                        res.send(err);
                    });
                }
            }, function(err) {
                res.send(err);
            });
        } else {
            res.send({
                status: 'user not found'
            });
        }

    }, function(err) {
        res.send(err);
    });
}

exports.unFollowUser = function(req, res, next) {
    var userid = req.params.userid;

    new data.follower({
        users_id: req.user.id,
        follows_id: userid
    }).fetch().then(function(record) {
        if (record) {
            var recordid = record.attributes.idfollowers;
            new data.follower({
                idfollowers: recordid
            }).destroy().then(function() {
                res.send({
                    status: 'successful'
                });
            }, function(err) {
                res.send(err);
            });
        } else {
            res.send({
                status: 'record not found'
            });
        }
    }, function(err) {
        res.send(err);
    });
}