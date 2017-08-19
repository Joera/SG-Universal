'use strict';

const Promise = require('bluebird');
const RenderQueue = require('./render.queue.service');
const TemplateDefinitionService = require('./template.definition.service');
const logger = require('./logger.service');
const config = require('../config');


/**
 *
 */
class EnqueueService {

    constructor() {
        this.renderQueue = new RenderQueue();
        this.templateDefinitionService = new TemplateDefinitionService();
    }


    /**
     * Create render queue item
     * Get the name, dataset and path of the template that will be added to the render queue
     * @param data
     * @param correlationId
     */
    createQueueItem(data, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {

            //
            let templateDefinition = null; // create empty template definition object for later re-use
            let queueItem = { // queue item object, this object will be placed in render queue
                template: null, // filename of template
                path: null, // path to render the template to
                data: null // template data
            };

            // get template definitions
            // find the template that belongs to the data
            self.templateDefinitionService.getDefinition(data, correlationId)
                .then((definition) => { return new Promise((res, rej) => { templateDefinition = definition; res({}); }) }) // set templateDefinition object for later use

                // set queueItem template
                .then(() => { return new Promise((res, rej) => { queueItem.template = templateDefinition.template; res({}); }) }) //

                // set queueItem path
                .then(() => { return templateDefinition.getPath(data, correlationId) }) // get path of the template that will be rendered
                .then((path) => { return new Promise((res, rej) => { queueItem.path = path; res({}); }) }) // set url on data object that will be saved

                // set queueItem data
                .then(() => { return templateDefinition.getTemplateData(data, correlationId) }) // get path of the template that will be rendered
                .then((templateData) => { return new Promise((res, rej) => { queueItem.data = templateData; res({}); }) }) // set url on data object that will be saved

                // resolve promise
                .then(() => { resolve(queueItem); })

                // catch errors
                .catch(error => {
                    error.correlationId = correlationId; // add correlationId to error object
                    logger.error(error);
                    reject(error);
                });
        })
    }





    enqueue(data, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {
            self.createQueueItem(data, correlationId) //
                .then((queueItem) => { return self.renderQueue.add(queueItem, correlationId); }) // add to render queue

                .then(() => { resolve(data); }) // resolve promise
                .catch(error => {
                    error.correlationId = correlationId; // add correlationId to error object
                    logger.error(error);
                    reject(error);
                });
        })
    }





}

module.exports = EnqueueService;