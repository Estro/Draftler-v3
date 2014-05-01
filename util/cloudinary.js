var config = require('../config.js');

module.exports = function(cloudinary) {
    cloudinary.start = cloudinary.config(config.development.cloudinary);
}