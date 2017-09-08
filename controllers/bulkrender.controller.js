'use strict';

const Promise = require('bluebird');
const uuidv4 = require('uuid/v4');
const RenderProcessService = require('../services/render.process.service');
const PageController = require('./page.controller');
const PagePersistence = require('../persistence/page.persistence');
const logger = require('../services/logger.service');
const config = require('../config');


/**
 * Sync controller
 *
 */
class SyncController {


    constructor () {
        this.renderProcessService = new RenderProcessService();
        this.pageController = new PageController();
        this.pagePersistence = new PagePersistence();
    }


    /**
     * Start the render process
     */
    render() {
        const self = this;
        return new Promise((resolve, reject) => {

            let pages = null; // pages that will to be rendered
            const correlationId = uuidv4(); // set correlation id for debugging the process chain
            self.pagePersistence.find({}) // get all pages from mongodb
                .then((p) => { return new Promise((res, rej) => { pages = p; res({}); })}) // set pages for later use

                // add pages to render queue
                .then(() => { //
                    return Promise.all(pages.map((page) => { //
                        return self.renderProcessService.enqueue(page, correlationId); // add page to render queue
                    }));
                })

                // add pages dependencies to render queue
                .then(() => { //
                    return Promise.all(pages.map((page) => { //
                        return self.renderProcessService.enqueueDependencies(page, correlationId); // add page dependencies to render queue
                    }));
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




}

module.exports = SyncController;