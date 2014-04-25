var utils = require('../util/utils'),
    config = require('../config.js'),
    email = require('emailjs/email'),
    data = require('../models/auth')(),
    kue = require('kue'),
    jobs = kue.createQueue();


// Set up email connection 
var mailServer = email.server.connect(config.development.smtp);

// Sets sign up email confirmation. called in user registration
jobs.process('signup-email', 20, function(job, done) {
    mailServer.send({
        from: 'martpomeroy@gmail.com',
        to: job.data.emailAddress,
        subject: 'Email Confirmation',
        text: 'Confirm Email',
        attachment: utils.composeConfimrationEmail(job.data.userId, job.data.emailAddress.hash, job.data.username)
    }, function(err, message) {
        if (message) {
            done();
        } else {
            done(err);
        }

    });
});


// Logs user activity references to the user activity table.
jobs.process('user-activity', 20, function(job, done) {
    new data.activity({
        user_id: job.data.userId,
        message_id: job.data.messageId,
        references: job.data.references,
        completedAt: job.data.created
    }).save().then(function(model) {
        done();
    }, function(err) {
        done(err);
    });

});


kue.app.listen(4000);
console.log('Listening on port 4000');