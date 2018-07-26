/**
 * Created by Rohit Raj.
 * Date: 24/7/18
 * Time: 11:39 PM
 * Version : v1.0
 */

var LocalStrategy   = require('passport-local').Strategy;
var passport        = require('passport');
var bcrypt          = require('bcryptjs');
var async           = require('async');
var config          = require("config");
var moment          = require('moment');
var uuid            = require('uuid/v4');
var xss             = require('xss');
var $               = require('./mongoHandler').client;

passport.use('signup',
    new LocalStrategy({ usernameField: 'username', passwordField: 'password', passReqToCallback: true}, function (req, username, password, done) {
        console.log("here");
        var token = uuid();
        var timeStamp = moment().utc().valueOf();
        var data = {
            _id: token,
            username: username,
            password: bcrypt.hashSync(password, 10),
            created_at: timeStamp
        };
        var tasks = [
            checkIfUserNameExist.bind(null, username),
            registerUser.bind(null, data)
        ];
        async.waterfall(tasks, function (err, reg) {
            if(err) {
                if (err.flag === 'ALIAS_ALREADY_EXISTS') {
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                }
                return done(null, false, req.flash('signupMessage', 'Failed to register user.'));
            }
            return done(null, reg);
        });
    })
);

function checkIfUserNameExist(username, callback) {
    var collection = config.get('mongodbSettings.userCollection');
    $.finder(collection, {username : username}, {}, function (err, user) {
        if(err) {
            return callback(err);
        }
        if(user.length) {
            var error = new Error('Alias Exist');
            error.flag = 'ALIAS_ALREADY_EXISTS';
            return callback(error);
        }
        callback();
    })
}

function registerUser(data, callback) {
    var collection = config.get('mongodbSettings.userCollection');
    $.creator(collection, data, function (err, reg) {
        if(err) {
            return callback(err);
        }
        var user = {id: data.token, username: data.username};
        callback(null, user);
    });
}

passport.use('login',
    new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, username, password, done) {
            var collection = config.get('mongodbSettings.userCollection');
            $.finder(collection, {username : username}, {}, function (err, user) {
                if (err)
                    return done(err);
                if (!user.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found.'));
                }

                // if the  password is wrong
                if (!bcrypt.compareSync(password, user[0].password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

                // successful user
                var userInfo = {id: user[0]._id, username: user[0].username};
                return done(null, userInfo);
            });
        })
);

module.exports = passport;