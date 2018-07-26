/**
* Created by Rohit Raj.
* Date: 26/7/18
* Time: 5:32 PM
* Version : v1.0
*/

'use strict';
var config = require("config");

exports.initializeMongo = function(myDbName) {
    var userCollection = config.get('mongodbSettings.userCollection');
    var chatCollection = config.get('mongodbSettings.chatCollection');

    var collection = myDbName.collection(userCollection);
    collection.find({}).toArray(function (err, res) {
        if (err) {
            console.log("error ==> ", err);
        }
        if(!res.length) {
            //create collection
            myDbName.createCollection(userCollection, {capped: true, size: 10000}, function (err, result) {
                if (err) throw err;

                console.log('userCollection created');
                collection = myDbName.collection(userCollection);
                collection.insert({text: 'initialized', type: 'init'}, function (err, result) {
                    console.log('messages collection initialized');
                });
            });
        }
    });

    var collection2 = myDbName.collection(chatCollection);
    collection2.find({}).toArray(function (err, res) {
        if (err) {
            console.log("error ==> ", err);
        }
        if(!res.length) {
            //create capped collection
            myDbName.createCollection(chatCollection, {capped: true, size: 10000}, function (err, result) {
                if (err) throw err;

                console.log('chatCollection created');
                collection2 = myDbName.collection(chatCollection);
                collection2.insert({text: 'initialized', type: 'init'}, function (err, result) {
                    console.log('messages collection initialized');
                });
            });
        }
    });
};
