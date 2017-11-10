'use strict';

const Promise = require('bluebird');
const uuidv4 = require('uuid/v4');
const _ = require('lodash');
const RenderProcessService = require('../services/render.process.service');
const PageController = require('./page.controller');
const PagePersistence = require('../persistence/page.persistence');
const logger = require('../services/logger.service');
const config = require('../config');


/**
 * Sync controller
 *
 */
class BulkRenderController {


    constructor () {
        this.renderProcessService = new RenderProcessService();
        this.pageController = new PageController();
        this.pagePersistence = new PagePersistence();
    }


    /**
     * Start the render process
     */
    render(type) {
        const self = this;
        return new Promise((resolve, reject) => {

            let pages = null; // pages that will to be rendered
            const query = (type) ? {"type": type} : {};
            const correlationId = uuidv4(); // set correlation id for debugging the process chain
            self.pagePersistence.find({query: query}) // get all pages from mongodb
                .then((p) => { return new Promise((res, rej) => { pages = p; res({}); })}) // set pages for later use

                // add pages to render queue
                .then(() => {
                    logger.info('Add pages to render queue', correlationId);
                    return self._enqueue(pages, correlationId);
                })

                // add pages dependencies to render queue
                .then(() => {
                    logger.info('Add pages dependencies to render queue', correlationId);
                    return self._enqueue(pages, correlationId, true);
                })

                // render all pages in the render queue
                .then(() => { return self.renderProcessService.render(correlationId) }) // render all templates in the render queue

                // resolve promise
                .then(() => {
                    const count = pages.length || 0;
                    logger.info('Re-render completed. Rendered ' + count + ' pages', correlationId);
                    resolve(pages);
                })
                .catch(error => {
                    error.correlationId = correlationId;
                    logger.error(error, correlationId);
                    reject(error);
                });

        });
    }


    /**
     * Chunk pages array and enqueue the pages in chunks
     * Enqueues the pages or the page dependencies depending on the dependencies property
     * @param pages                             array of pages to enqueue
     * @param correlationId                     correlation id
     * @param dependencies                      boolean: if true the page dependencies will be enqueued else the pages will be enqueued
     * @private
     */
    _enqueue(pages, correlationId, dependencies) {
        const self = this;
        return new Promise((resolve, reject) => {
            const chunkSize = 10; // set chunk size, number of templates that are rendered async at the same time
            const chunkedPages = _.chunk(pages, chunkSize); // chunk render queue

            // set the q function that needs to be called
            // enqueue dependencies or the pages
            let q;
            if(dependencies) {
                q = self._enqueueDependenciesChunk.bind(self);
            } else {
                q = self._enqueueChunk.bind(self);
            }

            // iterate chunks serially
            Promise.each(chunkedPages, (chunk, i) => { return q(chunk, (i + 1), chunkedPages.length, correlationId); })
                .then(() => {
                    resolve(pages);
                })
                .catch(error => {
                    error.correlationId = correlationId;
                    reject(error);
                })
        })
    }


    /**
     * Enqueue chunk of pages
     * @param chunk
     * @param chunkNumber
     * @param totalChunks
     * @param correlationId
     * @returns {Promise.<*[]>}
     * @private
     */
    _enqueueChunk(chunk, chunkNumber, totalChunks, correlationId) {
        logger.info('Add pages to queue in chunk ' + chunkNumber + '/' + totalChunks, correlationId);
        const self = this;
        return Promise.all(chunk.map((page) => { //
            return self.renderProcessService.enqueue(page, correlationId); // add page to render queue
        }));
    }


    /**
     * Enqueue chunk of dependencies for pages
     * @param chunk
     * @param chunkNumber
     * @param totalChunks
     * @param correlationId
     * @returns {Promise.<*[]>}
     * @private
     */
    _enqueueDependenciesChunk(chunk, chunkNumber, totalChunks, correlationId) {
        logger.info('Add pages dependencies to queue in chunk ' + chunkNumber + '/' + totalChunks, correlationId);
        const self = this;
        return Promise.all(chunk.map((page) => { //
            return self.renderProcessService.enqueueDependencies(page, correlationId); // add page to render queue
        }));
    }


}

module.exports = BulkRenderController;