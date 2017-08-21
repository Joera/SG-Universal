'use strict';

const Promise = require('bluebird');
const uuidv4 = require('uuid/v4');
const logger = require('../services/logger.service');
const AuthService = require('../services/auth.service');
const TemplateService = require('../services/template.service');
const RenderProcessService = require('../services/render.process.service');
const TemplateDefinitionService = require('../services/template.definition.service');
const PagePersistence = require('../persistence/page.persistence');
const AlgoliaConnector = require('../connectors/algolia.connector');
const templateDefinitions = require('../templates/definition');
const config = require('../config');


/**
 * Page controller
 *
 */
class PageController {


    constructor () {
        this.authService = new AuthService();
        this.pagePersistence = new PagePersistence();
        this.templateService = new TemplateService();
        this.renderProcessService = new RenderProcessService();
        this.templateDefinitionService = new TemplateDefinitionService();
        this.algoliaConnector = new AlgoliaConnector();
    }



    /***********************************************************************************************
     * CRUD handlers
     ***********************************************************************************************/

    handleCreateCall(req, res, next) {
        const self = this;

        const correlationId = uuidv4(); // set correlation id for debugging the process chain
        self.authService.isAuthorized(req.headers.authorization, correlationId) // check if authorized to make call
            // .then(() => { return self.templateDefinitionService.getDefinition(req.body[templateDefinitions.templateNameKey], correlationId) }) // get template definition
            // .then((definition) => { return definition.getPath(req.body, correlationId) }) // get path of the template that will be rendered
            .then(() => { return self.create(req.body, correlationId) }) // save page
            .then((data) => { return self.renderProcessService.enqueue(data, correlationId) }) // add page to render queue
            .then((data) => { return self.renderProcessService.enqueueDependencies(data, correlationId) }) // add page dependencies to queue
            .then((data) => { return self.renderProcessService.render(correlationId) }) // render all templates in the render queue
            .then((data) => { // send response
                return new Promise((resolve, reject) => {
                    logger.info('Finished successfully, send response', correlationId);
                    res.status(201); // set http status code for response
                    res.json({message: 'Ok', url: data.url}); // send response body
                    resolve({}); // resolve promise
                })
            })
            .catch(error => {
                logger.error(error);
                res.status(error.statusCode || 500); // set http status code for response
                res.json({message: error.message}); // send response body
            });
    }



    handleUpdateCall(req, res, next) {

    }




    handleDeleteCall(req, res, next) {

    }




    handlePreviewCall(req, res, next) {

    }




    /***********************************************************************************************
     *
     ***********************************************************************************************/


    create(data, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {
            //
            let templateDefinition = null; // create empty template definition object for later re-use
            let saveData = null; // data that will be saved. Object defined for later use

            // get template definitions
            // find the template that belongs to the data
            self.templateDefinitionService.getDefinition(data[templateDefinitions.templateNameKey], correlationId) // get template definition
                .then((definition) => { return new Promise((res, rej) => { templateDefinition = definition; res({}); }) }) // set templateDefinition object for later use

                // map data
                .then(() => { return templateDefinition.getMapping(data, correlationId); }) // map incomming data to data format that will be saved in database
                .then((mappedData) => { return new Promise((res, rej) => { saveData = mappedData; res({}); }) }) // set saveData object for later use

                // set url
                .then(() => { return templateDefinition.getPath(saveData, correlationId) }) // get path of the template that will be rendered
                .then((path) => { return new Promise((res, rej) => { saveData.url = config.baseUrl + '/' + path; res({}); }) }) // set url on data object that will be saved

                // set search snippet
                .then(() => { return templateDefinition.getSearchSnippetData(saveData, correlationId) }) // get search snippet data
                .then((templateData) => { return self.templateService.render(templateDefinition.searchSnippetTemplate, templateData, correlationId) }) // render search snippet
                .then((searchSnippetHtml) => { return new Promise((res, rej) => { saveData.searchSnippet = searchSnippetHtml; res({}); }) }) // set search snippet on data object that will be saved

                // save page
                .then(() => { return self.pagePersistence.save(saveData, correlationId) }) // save page to database

                // update algolia search
                .then(() => { return self.algoliaConnector.addPage(saveData, correlationId) }) // save page to database

                // resolve promise
                .then(() => { resolve(saveData) }) // resolve promise

                // catch errors
                .catch(error => {
                    error.correlationId = correlationId; // add correlationId to error object
                    logger.error(error);
                    reject(error);
                });
        })
    }



    delete() {
        /*
            -
         */
        const self = this;
        return new Promise((resolve, reject) => {
            resolve({});
        })
    }





}

module.exports = PageController;