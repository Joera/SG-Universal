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
                    error.correlationId = correlationId;
                    reject(error);
                })
        })
    }


    /**
     * Delete page from database
     * @param data
     * @param correlationId
     */
    delete(data, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {
            resolve({});
        })
    }
}

module.exports = PagePersistence;