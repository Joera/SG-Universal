'use strict';

const Promise = require('bluebird');
const uuidv4 = require('uuid/v4');
const PageController = require('./page.controller');
const logger = require('../services/logger.service');
const WordpressConnector = require('../connectors/wordpress.connector');
const config = require('../config');


/**
 * Page controller
 *
 */
class SyncController {


    constructor () {
        this.wordpressConnector = new WordpressConnector();
        this.pageController = new PageController();
    }


    /**
     * Start the sync process
     */
    sync() {
        const self = this;
        return new Promise((resolve, reject) => {

            const correlationId = uuidv4(); // set correlation id for debugging the process chain
            self.wordpressConnector.getPages(correlationId)
                .then((pages) => {
                    return Promise.all(pages.map((page) => {
                        return self.pageController.save(page, correlationId, true); //
                    }));
                })
                .then((pages) => {
                    const count = pages.length || 0; // number of updated pages
                    logger.info('Sync completed. Updated ' + count + ' pages', correlationId);
                    resolve(pages);
                })
                .catch(error => {
                    error.correlationId = correlationId;
                    logger.error(error, correlationId);
                    reject(error);
                });

        });
    }




}

module.exports = SyncController;