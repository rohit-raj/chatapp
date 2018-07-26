/**
 * Created by Rohit Raj.
 * Date: 24/7/18
 * Time: 11:43 PM
 * Version : v1.0
 */

(function () {
    'use strict';
    var config = require("config");
    var client = require('mongodb').MongoClient;
    var initMongo = require('./dbInitialize').initializeMongo;

    var mongoUrl = config.get('mongodbSettings.url');
    var dbName   = config.get('mongodbSettings.dbName');

    var myDbName;

    function MongoClient() {
        console.log("connecting ... ");
        client.connect(mongoUrl, function (error, client) {
            if (error)
                throw error;
            myDbName = client.db(dbName);
            initMongo(myDbName);
        });
    }

    MongoClient.prototype.creator = function (collectionName, value, callback) {
        var collection = myDbName.collection(collectionName);
        collection.insert(value, function (err, result) {
            return callback(err, err ? {} : result);
        });
    };

    MongoClient.prototype.finder = function (collectionName, filter, fields, callback) {
        var collection = myDbName.collection(collectionName);
        collection.find(filter).project(fields).toArray(function (err, result) {
            if (!err && result === null) {
                err = new Error("RECORD_NOT_FOUND");
            }
            return callback(err, err ? {} : result);
        });
    };

    MongoClient.prototype.tailable = function (collectionName, query, fields, callback) {
        var collection = myDbName.collection(collectionName);
        collection.find(query, {
            tailable: true,
            awaitdata: true,
            numberOfRetries: -1}).project(fields).each(function (err, result) {
            if (!err && result === null) {
                err = new Error("RECORD_NOT_FOUND");
            }
            return callback(err, err ? {} : result);
        });
    };

    var getClient = function () {
        return new MongoClient();
    };

    exports.client = getClient();
}());
