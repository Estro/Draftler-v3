var config = require('../config.js');

module.exports = function(Email) {
    Email.manager = Email.server.connect(config.development.smtp);
}