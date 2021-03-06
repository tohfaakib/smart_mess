var express = require('express');
var router = express.Router();


var user_db = require.main.require('./models/user-model');


router.get('*', (req, res, next) => {
    if (req.session.email != null) {
        next();
    } else {
        res.redirect('/');
    }
});


router.get('/:id', (req, res) => {
    if (req.session.user_id == req.params.id) {
        user_db.getById(req.params.id, (result) => {
            res.render('profile/profile', {page: 'Profile', menuId: 'profile', result: result[0]});
        });
    } else {
        res.redirect('/profile/' + req.session.user_id);
    }

});


router.get('/edit/:id', (req, res) => {
    if (req.session.user_id == req.params.id) {
        user_db.getById(req.params.id, (result) => {
            res.render('profile/edit_profile', {page: 'Edit Profile', menuId: 'profile', result: result[0]});
        });
    } else {
        res.redirect('/profile/edit/' + req.session.user_id);
    }

});


update = (req, res, results) => {
    req.checkBody('first_name', '*First Name field cannot be empty!').notEmpty();
    req.checkBody('last_name', '*Last Name field cannot be empty!').notEmpty();
    req.checkBody('email', '*Email field cannot be empty!').notEmpty();
    req.checkBody('email', '*Please enter a valid email!').isEmail();
    req.checkBody('phone', '*Phone Number field cannot be empty!').notEmpty();
    req.checkBody('role', '*Please select a valid role!').notEmpty();
    // req.checkBody('email', 'Username can only contain letters, numbers, or underscores.').matches(/^[A-Za-z0-9_-]+$/, 'i');

    const err = req.validationErrors();

    if (err) {
        res.render('profile/edit_profile', {page: 'Edit Profile', menuId: 'profile', email_exist: 'yes', result: results[0]});
    } else {
        var data = {
            id: req.params.id,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password,
            role: req.body.role,
            social_link: req.body.social_link
        };

        user_db.updateById(data, (result) => {
            if (result) {
                res.redirect('/profile/' + req.params.id);
            } else {
                res.send("Update Failed!");
            }
        });
    }
};


router.post('/edit/:id', (req, res) => {
    if (req.session.user_id == req.params.id) {

        user_db.getById(req.params.id, (results) => {


            var data = {
                email: req.body.email
            };

            user_db.getByEmail(data, (result) => {
                if (result.length > 0 && results[0].id !== result[0].id) {
                    res.render('profile/edit_profile', {
                        page: 'Edit Profile',
                        menuId: 'profile',
                        email_exist: 'yes',
                        result: results[0]
                    });
                } else {
                    var data = {
                        phone: req.body.phone
                    };
                    user_db.getByPhone(data, (result) => {
                        if (result.length > 0 && results[0].id !== result[0].id) {
                            res.render('profile/edit_profile', {
                                page: 'Edit Profile',
                                menuId: 'profile',
                                phone_exist: 'yes',
                                result: results[0]
                            });
                        } else {

                            update(req, res, results);

                        }
                    });
                }
            });

        });

    } else {
        res.redirect('/profile/edit/' + req.session.user_id);
    }

});


router.get('/change-password/:id', (req, res) => {
    if (req.session.user_id == req.params.id) {
        user_db.updateById(req.params.id, (result) => {
            res.render('profile/change_password', {
                page: 'Change Password',
                menuId: 'change_pass',
                invalid_pass: null,
                pass_mismatch: null,
                result: result[0]
            });
        });
    } else {
        res.redirect('/profile/edit/' + req.session.user_id);
    }

});


router.post('/change-password/:id', (req, res) => {
    req.checkBody('password', '*Password field cannot be empty!').notEmpty();
    req.checkBody('new_password', '*New Password field cannot be empty!').notEmpty();
    req.checkBody('confirm_password', '*Confirm New Password field cannot be empty!').notEmpty();

    const err = req.validationErrors();

    if (err) {
        res.render('profile/change_password', {
            page: 'Change Password',
            menuId: 'change_pass',
            errors: err
        });
    } else {

        var data = {
            id: req.params.id,
            password: req.body.password
        };
        user_db.getByIdPass(data, (result) => {
            if (result.length > 0) {
                if (req.body.new_password != null && req.body.new_password === req.body.confirm_password) {
                    var data = {
                        id: req.params.id,
                        password: req.body.new_password
                    };
                    user_db.updateByIdPass(data, (result) => {
                        if (result) {
                            res.redirect("/logout");
                        } else {
                            res.send("Password Has not been changed!");
                        }
                    });
                } else {
                    res.render('profile/change_password', {
                        page: 'Change Password',
                        menuId: 'change_pass',
                        pass_mismatch: 'yes',
                        result: result[0]
                    });
                }
            } else
                res.render('profile/change_password', {
                    page: 'Change Password',
                    menuId: 'change_pass',
                    invalid_pass: 'yes',
                    result: result[0]
                });
        });

    }
});


module.exports = router;