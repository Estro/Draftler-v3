var indexController = require('./controllers/index'),
    loginController = require('./controllers/login'),
    adminController = require('./controllers/admin'),
    passwordController = require('./controllers/passwords'),
    bookController = require('./controllers/book'),
    profileController = require('./controllers/profile'),
    apiController = require('./controllers/api');

module.exports = function(app, passport) {

    // Home
    app.get('/', indexController.home);
    app.get('/Explore', indexController.explore);
    app.get('/Explore/Spotlight', indexController.userHome);

    //Books
    app.get('/book', bookController.redirectBook);
    app.get('/book/:id', bookController.getBook);


    // Register and login
    app.get('/register', loginController.registerPage);
    app.post('/register', loginController.registerPost);
    app.get('/login', loginController.loginPage);
    app.post('/login', loginController.checkLogin);
    app.get('/logout', loginController.logout);

    // Email Confirmations
    app.get('/resendemail', loginController.resendEmailRedirect);
    app.get('/resendemail/:id', loginController.resendEmailPage);
    app.post('/resendemail/:id', loginController.resendEmail);
    app.get('/emailconfirmation/:id/:token', loginController.confirmEmail);

    // Forgotten passwords
    app.get('/forgot', passwordController.forgotten);
    app.post('/forgot', passwordController.sendPassword);
    app.get('/password-sent', passwordController.passwordSent);
    app.get('/resetpassword/:userId/:token', passwordController.resetPassword);
    app.post('/resetpassword', passwordController.updatePassword);

    //Profiles
    app.get('/profile', ensureAuthenticated, profileController.profile);
    app.get('/profile/user/:userId', ensureAuthenticated, profileController.userProfile);
    app.get('/profile/editprofile', ensureAuthenticated, profileController.editProfile);
    app.post('/profile/editprofile', ensureAuthenticated, profileController.updateProfile);
    app.get('/changepassword', ensureAuthenticated, profileController.changePassword);
    app.post('/changepassword', ensureAuthenticated, passwordController.updatePassword);

    //Admin
    app.get('/admin', ensureAdmin, adminController.homePage);
    app.get('/admin/manage-users/:page', ensureAdmin, adminController.manageUsers);
    app.get('/admin/edit-user/:id', ensureAdmin, adminController.editUser);
    app.post('/admin/edit-user', ensureAdmin, adminController.updateUser);

    // Public APIS
    app.get('/api/usernames/:username', apiController.checkUsername);

    // Internal API
    app.post('/api/follow/:userid', ensureAuthenticated, apiController.followUser);
    app.post('/api/unfollow/:userid', ensureAuthenticated, apiController.unFollowUser);
    app.get('/api/followstatus/:userid', ensureAuthenticated, apiController.followStatus);
    app.get('/api/getuseractivity/:userId', ensureAuthenticated, apiController.getUserActivity);
    app.get('/api/getuseractivity/:userId/:page', ensureAuthenticated, apiController.getUserActivityPage);
    app.post('/api/useractivity', ensureAuthenticated, apiController.postUserActivity);
    app.post('/api/profileimage', ensureAuthenticated, apiController.uploadProfileImage);
    app.get('/api/getcomments/:chapter', apiController.getComments);
    app.post('/api/postcomment/:chapter', ensureAuthenticated, apiController.postComment);
    app.get('/api/getauthor/:userId', apiController.getAuthor);


    app.get('*', indexController.notFound);

    function ensureAuthenticated(req, res, next) {
        // Check user is autenticated and not banned.
        if (req.isAuthenticated() && req.user.attributes.is_banned == false) {
            return next();
        }
        res.redirect('/login');
    };

    function ensureAdmin(req, res, next) {
        // check that the user has isAdmin set to true
        if (req.isAuthenticated() && req.user.attributes.is_admin == true)
            return next();
        else
            res.redirect('/');
    };

}