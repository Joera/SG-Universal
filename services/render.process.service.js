'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const FileSystemConnector = require('../connectors/filesystem.connector');
const RenderQueue = require('./render.queue.service');
const TemplateDefinitionService = require('./template.definition.service');
const TemplateService = require('../services/template.service');
const logger = require('./logger.service');
const dependencyValidator = require('../validators/template.dependencies.validator');
const templateDefinitions = require('../templates/definition');
const config = require('../config');


/**
 *
 */
class RenderProcessService {

    /**
     * constructor
     */
    constructor() {
        this.fileSystemConnector = new FileSystemConnector();
        this.renderQueue = new RenderQueue();
        this.templateDefinitionService = new TemplateDefinitionService();
        this.templateService = new TemplateService();
    }


    /**
     * Create render queue item
     * Get the name, dataset and path of the template that will be added to the render queue
     * @param data
     * @param correlationId
     * @private
     */
    _createQueueItem(data, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {

            //
            let templateDefinition = null; // save empty template definition object for later re-use
            let queueItem = { // queue item object, this object will be placed in render queue
                template: null, // filename of template
                path: null, // path to render the template to
                data: null // template data
            };

            // get template definitions
            // find the template that belongs to the data
            self.templateDefinitionService.getDefinition(data[templateDefinitions.templateNameKey], correlationId)
                .then((definition) => { return new Promise((res, rej) => { templateDefinition = definition; res({}); }) }) // set templateDefinition object for later use

                // set queueItem template
                .then(() => { return new Promise((res, rej) => { queueItem.template = templateDefinition.template; res({}); }) }) //

                // set queueItem path
                .then(() => { return templateDefinition.getPath(data, correlationId) }) // get path of the template that will be rendered
                .then((path) => { return new Promise((res, rej) => { queueItem.path = path; res({}); }) }) // set url on data object that will be saved

                // set queueItem data
                .then(() => { return templateDefinition.getTemplateData(data, correlationId) }) // get data for the template that will be rendered
                .then((templateData) => { return new Promise((res, rej) => { queueItem.data = templateData; res({}); }) }) // set url on data object that will be saved

                // resolve promise
                .then(() => { resolve(queueItem); })

                // catch errors
                .catch(error => {
                    reject(error);
                });
        })
    }


    /**
     * Set the data object in the right format so the enqueue function can process it and determine
     * what template should be enqueued
     * @param templateName                  name of the template to render
     * @param data                          data object as defined in the getDependencies function
     * @param correlationId
     * @private
     */
    _setDependencyDataObject(templateName, data, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {

            // if data object set in the getDependencies function is a string or number assume it is a id and set it
            // as id on the data property
            if(typeof data === 'string' || typeof data === 'number') {
                let id = data;
                data = {id: id};
            } else {
                // save empty object if data is not defined
                if(data === null || typeof data === 'undefined') {
                    data = {};
                }
            }

            // set template name in data object
            // template name is set in the templateNameKey property of the data object as defined in the template definition file
            if(typeof data === 'object') {
                data[templateDefinitions.templateNameKey] = templateName
            }

            resolve(data);
        })
    }


    /**
     * Controller function for rendering a single template from the render queue
     * @param template                  name of the handlebars template file, assume it is in the templates root folder
     * @param path                      path of the template file
     * @param data                      template data
     * @param correlationId
     * @private
     */
    _renderQueueItem(template, path, data, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {
            //
            let templateDefinition = null; // save empty template definition object for later re-use
            let templateHtml = null;

            // get template definitions
            self.templateDefinitionService.getDefinition(data[templateDefinitions.templateNameKey], correlationId) // get template definition
                .then((definition) => { return new Promise((res, rej) => { templateDefinition = definition; res({}); }) }) // set templateDefinition object for later use

                // render template
                .then(() => { return templateDefinition.preRender(path, data, correlationId) }) // execute the pre render hook
                .then((templateData) => { return self.templateService.render(template, templateData, correlationId) }) // render template
                .then((html) => { return new Promise((res, rej) => { templateHtml = html; res({}); }) }) // set html for later use
                .then(() => { return templateDefinition.postRender(templateHtml, path, data, correlationId) }) // execute the post render hook

                // write template file
                .then(() => { return self.fileSystemConnector.createDirectory(path, correlationId) }) // save template directory
                .then(() => { return self.fileSystemConnector.writeTemplateFile(path, templateHtml, correlationId) }) // write template file

                //
                .then(() => { resolve(templateHtml); }) // resolve promise
                .catch(error => {
                    logger.error(error);
                    reject(error);
                });
        })
    }


    /**
     * Render a chunk of the render queue
     * @param chunk                     array of render queue items
     * @param chunkNumber               index of the current chunk
     * @param totalChunks               total number of chunks
     * @param correlationId
     * @private
     */
    _renderQueueChunk(chunk, chunkNumber, totalChunks, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {
            logger.info('Start rendering all templates in chunk ' + chunkNumber + '/' + totalChunks, correlationId);

            // promise group to render all templates in chunk
            const promiseGroup = chunk.map((d) => {
                return self._renderQueueItem(d.template, d.path, d.data, correlationId);
            });

            // resolve promise group
            Promise.all(promiseGroup)
                .then(() => {
                    resolve({});
                })
                .catch(error => {
                    error.correlationId = correlationId;
                    reject(error);
                })

        })
    }


    /**
     * Add template to render queue
     * @param data
     * @param correlationId
     */
    enqueue(data, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {
            self._createQueueItem(data, correlationId) // save queue item
                .then((queueItem) => { return self.renderQueue.add(queueItem, correlationId); }) // add to render queue
                .then(() => { resolve(data); }) // resolve promise
                .catch(error => {
                    reject(error);
                });
        })
    }


    /**
     * Controller function that gets the dependencies of the page and add them to the render queue
     * Function also makes sure the data object that is passed to the enqueue function is formatted correctly
     * @param data
     * @param correlationId
     */
    enqueueDependencies(data, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {

            // get page dependencies
            self.templateDefinitionService.getDefinition(data[templateDefinitions.templateNameKey], correlationId) // get template definitions
                .then((definition) => { return definition.getDependencies(data, correlationId) }) // get dependencies
                .then((dependencies) => { return dependencyValidator.validate(dependencies) }) // validate dependency array

                // set data objects for enqueueing templates
                // make sure data object is in the right format so enqueue function can process request
                .then((dependencies) => { return new Promise((res, rej) => {
                    // save promise group for setting data objects
                    const promiseGroup = dependencies.map((d) => {
                        return self._setDependencyDataObject(d.template, d.data, correlationId);
                    });

                    // resolve promise group
                    Promise.all(promiseGroup)
                        .then((dep) => {
                            res(dep);
                        })
                        .catch(error => {
                            reject(error);
                        })
                })})

                // enqueue depenencies
                .then((dependencies) => { return new Promise((res, rej) => {
                    // save promise group enqueueing templates
                    const promiseGroup = dependencies.map((d) => {
                        return self.enqueue(d, correlationId);
                    });

                    // resolve promise group
                    Promise.all(promiseGroup)
                        .then((dataArray) => {
                            res(dataArray);
                        })
                        .catch(error => {
                            reject(error);
                        })
                })})

                // resolve promise
                .then(() => { resolve(data); }) // resolve promise

                // catch errors
                .catch(error => {
                    reject(error);
                });
        })
    }


    /**
     * Render all the templates in the queue
     * @param correlationId
     */
    render(correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {

            self.renderQueue.get() // get all items in render queue
                .then((queue) => {
                    const chunkSize = 3; // set chunk size, number of templates that are rendered async at the same time
                    const chunkedQueue = _.chunk(queue, chunkSize); // chunk render queue

                    // iterate chunks serially
                    Promise.each(chunkedQueue, (chunk, i) => { return self._renderQueueChunk(chunk, (i + 1), chunkedQueue.length, correlationId); })
                        .then(() => {
                            logger.info('Rendered all templates in render queue', correlationId);
                            resolve({});
                        })
                        .catch(error => {
                            error.correlationId = correlationId;
                            reject(error);
                        })
                })

        })
    }




}

module.exports = RenderProcessService;