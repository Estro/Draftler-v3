var utils = require('../util/utils'),
    kue = require('kue'),
    jobs = kue.createQueue();

//kue.app.listen(4000);

exports.sendSignUpEmail = function(un, email, hash, userid) {
    jobs.create('signup-email', {
        username: un,
        emailAddress: email,
        hash: hash,
        userId: userid
    }).priority('high').save();
}