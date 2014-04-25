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

exports.followStatus = function(req, res, next) {
    var un = req.params.userid;

    if (isNaN(userid)) {
        res.send(404);
        return;
    }

    new data.follower().query(function(qb) {
        qb.where({
            user_id: req.user.id,
            follows_id: un
        });
    }).fetch().then(function(follower) {
        if (follower) {
            res.send({
                status: 'Following'
            });
        } else {
            res.send({
                status: 'Not following'
            });
        }
    }, function(err) {
        res.send(err);
    });

}

exports.followUser = function(req, res, next) {
    var userid = req.params.userid;

    if (isNaN(userid)) {
        res.send(404);
        return;
    }

    new data.ApiUser({
        id: userid
    }).fetch().then(function(user) {
        //check if already there
        if (user) {
            var follow = new data.follower().query(function(qb) {
                qb.where({
                    user_id: req.user.id,
                    follows_id: userid
                });
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

    if (isNaN(userid)) {
        res.send(404);
        return;
    }

    new data.follower({
        user_id: req.user.id,
        follows_id: userid
    }).fetch().then(function(record) {
        if (record) {
            var recordid = record.attributes.id;

            if (isNaN(recordid)) {
                res.send(404);
                return;
            }
            new data.follower({
                id: recordid
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


exports.getUserActivity = function(req, res, next) {
    var userid = req.params.userid,
        activities = [];

    if (isNaN(userid)) {
        res.send(404);
        return;
    }

    new data.activities({
        user_id: req.user.id
    }).fetch().then(function(record) {
        if (record) {
            res.send(record);

        } else {
            res.send({
                status: 'activities not found'
            });
        }
    }, function(err) {
        res.send(err);
    });
}