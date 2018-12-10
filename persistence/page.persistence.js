'use strict';

const Promise = require('bluebird');
const logger = require('../services/logger.service');
const db = require('../connectors/mongodb.connector');
const config = require('../config');


/**
 * Class takes care of all database operations for the page
 */
class PagePersistence {

    constructor() {

    }


    /**
     * Query page collections in MongoDB
     * @param options
     * @param correlationId
     */
    find(options, correlationId) {
        const self = this;
        if (typeof options.limit === "undefined") {
            options.limit = 0;
        };
        return new Promise((resolve, reject) => {
            db.getPageCollection() // get page collection
                .then((collection) => { return collection.find(options.query).sort(options.sort).limit(options.limit).toArray(); }) // execute find query

                // .then((collection) => { return collection.find(options.query).limit(options.sort).sort(options.sort).toArray(); }) // execute find query
                .then((result) => { resolve(result); }) // return results
        })
    }


    /**
     * Query page collection in MongoDb and return single document
     * @param options
     * @param correlationId
     */
    findOne(options, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {
            db.getPageCollection() // get page collection
                .then((collection) => { return collection.findOne(options.query); }) // execute find query
                .then((result) => { resolve(result); }) // return results
        })
    }


    /**
     * Save page to database
     * @param data
     * @param correlationId
     */
    save(data, correlationId, options) {
        const self = this;
        return new Promise((resolve, reject) => {
            data._id = String(data._id); // make sure id is a string
            data.objectID = String(data.objectID); // make sure objectID is a string

            db.getPageCollection() // get page collection
                .then((collection) => { return collection.save(data); }) // execute save
                .then((d) => {
              //      logger.info('Saved page to database', correlationId);
                    resolve(data);
                })
                .catch((error) => {
                    // error.correlationId = correlationId;
                    reject(error);
                })
        })
    }


    /**
     * Delete page from database
     * @param id                        id of the page
     * @param correlationId
     */
    delete(id, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {
            db.getPageCollection() // get page collection
                .then((collection) => {

                    id = id.toString();
                    return collection.remove({"_id": id});

                }) // execute delete
                .then((d) => {
               //     logger.info('Deleted page from database', correlationId);
                    resolve(id);
                })
                .catch((error) => {
                    // error.correlationId = correlationId;
                    reject(error);
                })
        })
    }
}

module.exports = PagePersistence;