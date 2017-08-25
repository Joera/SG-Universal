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
     * @param query                         MongoDB query object
     * @param correlationId
     */
    find(query, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {
            db.page().find(query)
                .then((data) => {
                    resolve(data);
                })
                .catch((error) => {
                    // error.correlationId = correlationId;
                    reject(error);
                })
        })
    }


    /**
     * Save page to database
     * @param data
     * @param correlationId
     */
    save(data, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {
            db.page().save(data)
                .then((d) => {
                    logger.info('Saved page to database', correlationId);
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
            db.page().remove({"_id": id})
                .then((d) => {
                    logger.info('Deleted page from database', correlationId);
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