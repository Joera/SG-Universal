'use strict';

const Promise = require('bluebird');
const uuidv4 = require('uuid/v4');
const PageController = require('./page.controller');
const logger = require('../services/logger.service');
const SyncService = require('../services/sync.service');
const CmsConnector = require('../connectors/wordpress.connector');
const config = require('../config');


/**
 * Sync controller
 *
 */
class SyncController {


    constructor () {
        this.cmsConnector = new CmsConnector();
        this.pageController = new PageController();
        this.syncService = new SyncService();
    }


    /**
     * Start the sync process
     */
    sync() {
        const self = this;
        return new Promise((resolve, reject) => {

            let cmsPages = null; // all pages received from cms
            let deletedPages = null; // pages that will deleted

            const correlationId = uuidv4(); // set correlation id for debugging the process chain
            self.cmsConnector.getPages(correlationId)
                .then((pages) => { return new Promise((res, rej) => { cmsPages = pages; res({}); })}) // save pages received from cms api for later use

                // delete pages
                .then(() => { return self.syncService.findDeletedPages(cmsPages, correlationId) }) // find the deleted pages
                .then((pages) => { // delete pages from database and algolia
                    deletedPages = pages;
                    return Promise.all(deletedPages.map((page) => {
                        return self.pageController.delete(page, correlationId); //
                    }));
                })

                // save pages
                .then(() => { // save pages to database and algolia
                    return Promise.all(cmsPages.map((page) => {
                        return self.pageController.save(page, correlationId, true); //
                    }));
                })

                // resolve promise
                .then(() => {
                    const countSave = cmsPages.length || 0; // number of updated pages
                    const countDelete = deletedPages.length || 0; // number of deleted pages
                    logger.info('Sync completed. Saved ' + countSave + ' pages and deleted ' + countDelete + ' pages', correlationId);
                    resolve(cmsPages);
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