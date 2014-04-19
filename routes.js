var indexController = require('./controllers/index'),
    loginController = require('./controllers/login'),
    adminController = require('./controllers/admin'),
    apiController = require('./controllers/api');

module.exports = function(app, passport) {

    // Home
    app.get('/', indexController.home);
    app.get('/Explore', ensureAuthenticated, indexController.userHome);


    app.get('/emailconfirmation/:id/:token', loginController.confirmEmail);

    // Auth
    app.get('/register', loginController.registerPage);
    app.post('/register', loginController.registerPost);
    app.get('/forgot', loginController.forgotten);
    app.get('/login', loginController.loginPage);
    app.post('/login', loginController.checkLogin);
    app.get('/logout', loginController.logout);
    app.get('/resendemail/:id', loginController.resendEmailPage);
    app.post('/resendemail/:id', loginController.resendEmail);

    //Admin
    app.get('/admin', ensureAdmin, adminController.homePage);
    app.get('/admin/manage-users', adminController.manageUsers);
    app.get('/admin/edit-user/:id', adminController.editUser);
    app.post('/admin/edit-user', adminController.updateUser);
    // Public facing APIS

    app.get('/api/usernames/:username', apiController.checkUsername);


    function ensureAuthenticated(req, res, next) {
        // Check user is autenticated and not banned.
        if (req.isAuthenticated() && req.user.attributes.isBanned == false) {
            return next();
        }
        res.redirect('/login');
    };

    function ensureAdmin(req, res, next) {
        // check that the user has isAdmin set to true
        if (req.isAuthenticated() && req.user.attributes.isAdmin == true)
            return next();
        else
            res.redirect('/');
    };

}