/**
 * Created by Rohit Raj.
 * Date: 25/7/18
 * Time: 4:33 PM
 * Version : v1.0
 */

var uuid    = require('uuid/v4');
var moment  = require('moment');
var config  = require("config");
var $       = require('./mongoHandler').client;

exports.getUsers = function (user, callback) {
    var collection = config.get('mongodbSettings.userCollection');
    $.finder(collection, {username : {$ne : user.username}}, {_id: 0, password : 0, created_at: 0}, function(err, users) {
        if(err) {
            return callback(err);
        }
        callback(null, users);
    });
};

exports.getUserChat = function (callback) {
    var collection = config.get('mongodbSettings.chatCollection');
    $.finder(collection, {}, {}, function (err, msgs) {
        if (err) {
            return callback(err);
        }
        callback(null, msgs);
    });
};

exports.saveChat = function (msg, user, callback) {
    var collection = config.get('mongodbSettings.chatCollection');
    var timestamp = moment().utc().valueOf();
    var data = {
        text : msg.message,
        author : user.username,
        timestamp : timestamp
    };
    console.log("recv ==> ", data);
    $.creator(collection, data, function (err, res) {
        console.log("res ==> ", res.result);
        console.log("err ==> ", err);
        if (err) {
            return callback(err);
        }
        callback();
    });
};

exports.tailableChat = function (user, callback) {
    var collection = config.get('mongodbSettings.chatCollection');
    var query = {};
    var fields = {_id : 0, author : 1, text : 1, timestamp : 1};
    $.tailable(collection, query, fields, function (err, res) {
        if (err) {
            return callback();
        }
        var result = '';
        if(res.hasOwnProperty('author')) {
            if (res.author === user.username) {
                res.className = 'right';
            } else {
                res.className = 'left';
            }
            return callback(null, res);
        }
    });
};

exports.tailableUsers = function (user, callback) {
    var collection = config.get('mongodbSettings.userCollection');
    var query = {};
    var fields = {};
    $.tailable(collection, query, fields, function (err, res) {
        if (err) {
            return callback();
        }
        if (res.hasOwnProperty('username')) {
            if(res.username != user.username)
                return callback(null, res.username);
        }
    });
};