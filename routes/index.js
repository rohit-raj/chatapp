var express = require('express');
var router  = express.Router();
var async   = require('async');
var passport = require('../lib/validator');
var chatHandler = require('../lib/chatHandler');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

router.get('/login', function (req, res) {
    res.render('login', {message: req.flash('loginMessage')});
});

router.post('/login', passport.authenticate('login', {
    successRedirect: '/chat',
    failureRedirect: '/login',
    failureFlash: true
}),
function (req, res) {
    if (req.body.remember) {
        req.session.cookie.maxAge = 1000 * 60 * 3;
    } else {
        req.session.cookie.expires = false;
    }
    res.redirect('/');
});

router.get('/signup', function (req, res) {
    res.render('signup', {message: req.flash('signupMessage')});
});

router.post('/signup', passport.authenticate('signup', {
    successRedirect: '/chat',
    failureRedirect: '/signup',
    failureFlash: true
}));

router.get('/chat', isLoggedIn, function (req, res) {
    var tasks = [
        chatHandler.getUsers.bind(null, req.user)
    ];

    async.waterfall(tasks, function (err, result) {
        res.render('chat', {
            user: req.user, // get the user out of session and pass to template
            users: result
        });
    });

    /*//chatHandler.getUsers(req.user);
    res.render('chat', {
        user: req.user // get the user out of session and pass to template
    });*/
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;

function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

