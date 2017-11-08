'use strict';

const Promise = require('bluebird');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
// const Collection = mongodb.Collection;
const logger = require('../services/logger.service');
const config = require('../config');

// // convert all mongo functions so they return promises
// Promise.promisifyAll(Collection.prototype);
// // Promise.promisifyAll(MongoClient);
//
//
// // set database connection object
// let database = null;
//
// // connect to database
// MongoClient.connect(config.db, (error, db) => {
//     if(error) {
//         logger.error('Error connecting to MongoDB');
//         logger.error(error);
//     }
//     database = db;
// });
//
// //
// module.exports = {
//     page: function() { return database.collection('page'); } // page collection
// };



// set database connection object
let database = null;


// get connection to mongodb
function getMongoConnection() {
    if(database === null) {
        database =  MongoClient.connect(config.db, { promiseLibrary: Promise, poolSize: 10 })
    }
    return database;
    // return MongoClient.connect(config.db, { promiseLibrary: Promise, poolSize: 10 })
}



module.exports = {
    getPageCollection: function() {
        return getMongoConnection().then((conn) => {
            return conn.collection('page');
        })
    }
};



