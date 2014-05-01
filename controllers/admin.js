var data = require('../models/auth')(),
    utils = require('../util/utils'),
    moment = require('moment'),
    content = require('../content/english');

// route: admin/manage-users
// redirects to page one of manage users.
exports.homePage = function(req, res) {
    res.redirect('admin/manage-users/1');
};

// route: admin/manage-users/:page
// Get count of users then render user details for given page
exports.manageUsers = function(req, res) {
    var page = req.params.page,
        offset, nextPage, lastPage, i, itemsPerPage = 20;

    // need to use knex to get count. 
    data.knex('users').count('id as cnt').then(function(count) {

        // calcuate offset and construct date for next/prev buttons
        page = parseInt(page);
        offset = (page - 1) * itemsPerPage;
        nextPage = page + 1;
        lastPage = page == 1 ? false : (page - 1);

        // if no more records, set no next page
        if (page * itemsPerPage > count[0].cnt) {
            nextPage = false;
        }

        // get collections of users
        new data.users().query(function(qb) {
            qb.limit(itemsPerPage).offset(offset).orderBy('username', 'DESC');
        }).fetch().then(function(data) {
            // if we get results
            if (data && data.models) {
                for (i = 0, l = data.models.length; i < l; i++) {
                    data.models[i].attributes.createdAt = moment(data.models[i].attributes.createdAt).fromNow();
                    data.models[i].attributes.updatedAt = moment(data.models[i].attributes.updatedAt).fromNow();
                }

                if (data.models.length < 1) {
                    res.redirect('admin/manage-users/' + lastPage);
                }
                // render page with content and user stats
                res.render('admin/manage-users', {
                    loggedIn: true,
                    isAdmin: true,
                    models: data.models,
                    content: content.admin.ui,
                    frame: content.frame.ui,
                    nextPage: nextPage,
                    lastPage: lastPage,
                    error: req.flash('a-error'),
                    messages: req.flash('a-info')
                });
            } else {
                // just redirect on errors. simples.
                res.redirect('admin/manage-users/1');
            }
        }, function(err) {
            res.redirect('admin/manage-users/1');
        });
    }, function(err) {
        res.redirect('admin/manage-users/1');
    });
};

// route: /admin/edit-user/:id
// Check user exists and render page with user details
exports.editUser = function(req, res) {
    var userId = req.params.id;
    new data.ApiUser('id', userId).fetch().then(function(data) {
        if (data && data.attributes) {
            res.render('admin/edit-user', {
                loggedIn: true,
                isAdmin: true,
                models: data.attributes,
                error: req.flash('a-error'),
                messages: req.flash('a-info'),
                content: content.admin.ui,
                frame: content.frame.ui
            });
        } else {
            req.flash('a-error', content.admin.messages.cantGetUsers);
            res.redirect('admin/manage-users');
        }
    }, function(err) {
        req.flash('a-error', content.admin.messages.cantGetUsers);
        res.redirect('admin/manage-users');
    });
};

// route: post /admin/edit-user
// validate user and update user profile details
exports.updateUser = function(req, res) {
    var userId = req.body.userid,
        username = req.body.username.trim(),
        firstname = req.body.firstname.trim(),
        surname = req.body.surname.trim(),
        email = req.body.email.trim(),
        email_confirmed = req.body.emailconfirmed,
        active = req.body.active,
        verified = req.body.verified,
        admin = req.body.admin,
        banned = req.body.banned;

    // switch checkbox values to bool.
    active = active === 'on' ? 1 : 0;
    admin = admin === 'on' ? 1 : 0;
    verified = verified === 'on' ? 1 : 0;
    email_confirmed = email_confirmed === 'on' ? 1 : 0;
    banned = banned === 'on' ? 1 : 0;

    // save user details.
    new data.ApiUser({
        id: userId
    }).save({
        email_confirmed: email_confirmed,
        username: username,
        first_name: firstname,
        last_name: surname,
        email: email,
        isActive: active,
        isVerified: verified,
        isAdmin: admin,
        isBanned: banned
    }).then(function(data) {
        req.flash('a-info', content.admin.messages.profileUpdated);
        res.redirect('/admin/edit-user/' + userId);
        return;
    }, function() {
        req.flash('a-error', content.admin.messages.updateFailed);
        res.redirect('/admin/edit-user/' + userId);
    });
};