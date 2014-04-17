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
    }, function(error) {
        console.log('no');
    });
}