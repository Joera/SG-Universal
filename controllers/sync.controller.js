'use strict';

const Promise = require('bluebird');
const uuidv4 = require('uuid/v4');
const _ = require('lodash');
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
            let page = 0;

            const correlationId = uuidv4(); // set correlation id for debugging the process chain
            self.cmsConnector.getPages(correlationId)
                .then((pages) => {
                    logger.info('back out');
                    logger.info(pages.length);
                    return new Promise((res, rej) => { cmsPages = pages; res({}); })}) // save pages received from cms api for later use

                // delete pages
                .then(() => { return self.syncService.findDeletedPages(cmsPages, correlationId) }) // find the deleted pages
                .then((pages) => { // delete pages from database and algolia
                    deletedPages = pages; // save deleted pages for later use
                    const chunkSize = 5; // set chunk size, number of pages that are deleted async at the same time
                    const chunkedPages = _.chunk(deletedPages, chunkSize); // chunk render queue
                    return Promise.each(chunkedPages, (chunk, i) => { return self.deletePages(chunk, (i + 1), chunkedPages.length, correlationId); }) // delete pages, iterate chunks serially
                })

                // save pages
                .then(() => { // save pages to database and search
                    const chunkSize = 5; // set chunk size, number of pages that are saved async at the same time
                    const chunkedPages = _.chunk(cmsPages, chunkSize); // chunk render queue
                    return Promise.each(chunkedPages, (chunk, i) => { return self.savePages(chunk, (i + 1), chunkedPages.length, correlationId); }) // save pages, iterate chunks serially
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



    /**
     * Delete pages in pages array
     * @param pages                     array of pages that need to be deleted
     * @param chunkNumber               chunk index
     * @param totalChunks               total number of chunks
     * @param correlationId
     * @returns {Promise.<*[]>}
     */
    deletePages(pages, chunkNumber, totalChunks, correlationId) {
        const self = this;
        logger.info('Start deleting pages in chunk ' + chunkNumber + '/' + totalChunks, correlationId);
        return Promise.all(pages.map((page) => { // create promise group for deleting pages
            return self.pageController.delete(page, correlationId); // delete single page
        }));
    }


    /**
     * Save pages in pages array
     * @param pages                     array of pages that need to be saved
     * @param chunkNumber               chunk index
     * @param totalChunks               total number of chunks
     * @param correlationId
     * @returns {Promise.<*[]>}
     */
    savePages(pages, chunkNumber, totalChunks, correlationId) {
        const self = this;
        logger.info('Start saving pages in chunk ' + chunkNumber + '/' + totalChunks, correlationId);
        return Promise.all(pages.map((page) => { // create promise group for saving pages
            return self.pageController.save(page, correlationId, true); //
        }));
    }



}

module.exports = SyncController;
