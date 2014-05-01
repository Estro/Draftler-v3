var utils = require('../util/utils'),
    kue = require('kue'),
    jobs = kue.createQueue();

// sends sign up confirmation email. used in login.js
exports.sendSignUpEmail = function(un, email, hash, userid) {
    jobs.create('signup-email', {
        username: un,
        emailAddress: email,
        token: hash,
        user_id: userid
    }).priority('high').save();
}

exports.sendPasswordReset = function(un, email, hash, userid) {
    jobs.create('password-reset-email', {
        username: un,
        emailAddress: email,
        token: hash,
        user_id: userid
    }).priority('high').save();
}

// saves user activity to user activity table. Uses message id which is converted using a function in untils 
exports.userActivity = function(messageid, userid, references) {
    var created = new Date().toISOString().slice(0, 19).replace('T', ' ');
    jobs.create('user-activity', {
        messageId: messageid,
        userId: userid,
        references: references,
        created: created
    }).priority('high').save();
}