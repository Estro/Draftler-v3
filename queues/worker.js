var utils = require('../util/utils'),
    config = require('../config.js'),
    email = require('emailjs/email'),
    kue = require('kue'),
    jobs = kue.createQueue();

// Set up email connection 
var mailServer = email.server.connect(config.development.smtp);

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



kue.app.listen(4000);
console.log('Listening on port 4000');