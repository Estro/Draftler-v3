/**
 * Module dependencies.
 */

var config = require('./config.js'),
    express = require('express'),
    http = require('http'),
    path = require('path'),
    expressValidator = require('express-validator'),
    mysql = require('mysql'),
    passport = require('passport'),
    helmet = require('helmet'),
    crypto = require('crypto'),
    flash = require('connect-flash'),
    Bookshelf = require('bookshelf'),
    Knex = require('knex'),
    app = express(),
    email = require('emailjs/email'),
    kue = require('./queues/kue'),
    cloudinary = require('cloudinary');



app.use(flash());
app.use(express.cookieParser());
app.use(express.bodyParser({keepExtensions: true, uploadDir: __dirname + "/public/uploads" }));
app.use(expressValidator());
app.use(express.session(config.development.session));
app.use(express.json());
app.use(passport.initialize());
app.use(express.logger('dev'));
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.favicon(__dirname + '/public/images/shortcut-icon.png'));


app.engine('mustache', require('hogan-middleware').__express);
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache');

require('./util/auth')(passport);
require('./routes')(app, passport);


app.listen(3000);
console.log('Listening on port 3000');