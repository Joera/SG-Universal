'use strict';

const Promise = require('bluebird');
const uuidv4 = require('uuid/v4');
const logger = require('../services/logger.service');
const AuthService = require('../services/auth.service');
const TemplateService = require('../services/template.service');
const RenderProcessService = require('../services/render.process.service');
const TemplateDefinitionService = require('../services/template.definition.service');
const PagePersistence = require('../persistence/page.persistence');
const SearchConnector = require('../connectors/algolia.connector');
const FileSystemConnector = require('../connectors/filesystem.connector');
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
        this.searchConnector = new SearchConnector();
        this.fileSystemConnector = new FileSystemConnector();
    }



    /***********************************************************************************************
     * CRUD handlers
     ***********************************************************************************************/

    /**
     * Handles the create page api call
     * @param req
     * @param res
     * @param next
     */
    handleCreateCall(req, res, next) {
        const self = this;

        let url = null;
        const correlationId = uuidv4(); // set correlation id for debugging the process chain
        logger.info('Received create call', correlationId);
        self.authService.isAuthorized(req.headers.authorization, correlationId) // check if authorized to make call
            .then(() => { return self.templateDefinitionService.getDefinition(req.body[templateDefinitions.templateNameKey], correlationId) }) // get template definition
            .then((definition) => { return definition.getPath(req.body, correlationId) }) // get path of the template that will be rendered
            .then((path) => { return new Promise((res, rej) => { url = config.baseUrl + '/' + path; res({}); }) }) // set url for response
            .then(() => { return self.save(req.body, correlationId, false) }) // save page
            .then((data) => { return self.renderProcessService.enqueue(data, correlationId) }) // add page to render queue
            .then((data) => { return self.renderProcessService.enqueueDependencies(data, correlationId) }) // add page dependencies to render queue
            .then((data) => { return self.renderProcessService.render(correlationId) }) // render all templates in the render queue
            .then((data) => { // send response
                return new Promise((resolve, reject) => {
                    logger.info('Finished successfully, send response', correlationId);
                    res.status(201); // set http status code for response
                    res.json({message: 'Ok', url: url}); // send response body
                    resolve({}); // resolve promise
                })
            })
            .catch(error => {
                error.correlationId = correlationId;
                logger.error(error);
                res.status(error.statusCode || 500); // set http status code for response
                res.json({message: error.message}); // send response body
            });
    }


    /**
     * Handles the update page api call
     * @param req
     * @param res
     * @param next
     */
    handleUpdateCall(req, res, next) {
        const self = this;

        let url = null;
        const correlationId = uuidv4(); // set correlation id for debugging the process chain
        logger.info('Received update call', correlationId);
        self.authService.isAuthorized(req.headers.authorization, correlationId) // check if authorized to make call
            .then(() => { return self.templateDefinitionService.getDefinition(req.body[templateDefinitions.templateNameKey], correlationId) }) // get template definition
            .then((definition) => { return definition.getPath(req.body, correlationId) }) // get path of the template that will be rendered
            .then((path) => { return new Promise((res, rej) => { url = config.baseUrl + '/' + path; res({}); }) }) // set url for response
            .then(() => { return self.save(req.body, correlationId, true) }) // save page
            .then((data) => { return self.renderProcessService.enqueue(data, correlationId) }) // add page to render queue
            .then((data) => { return self.renderProcessService.enqueueDependencies(data, correlationId) }) // add page dependencies to render queue
            .then((data) => { return self.renderProcessService.render(correlationId) }) // render all templates in the render queue
            .then((data) => { // send response
                return new Promise((resolve, reject) => {
                    logger.info('Finished successfully, send response', correlationId);
                    res.status(200); // set http status code for response
                    res.json({message: 'Ok', url: url}); // send response body
                    resolve({}); // resolve promise
                })
            })
            .catch(error => {
                error.correlationId = correlationId;
                logger.error(error);
                res.status(error.statusCode || 500); // set http status code for response
                res.json({message: error.message}); // send response body
            });
    }


    /**
     * Handles the delete age api call
     * @param req
     * @param res
     * @param next
     */
    handleDeleteCall(req, res, next) {
        const self = this;

        const correlationId = uuidv4(); // set correlation id for debugging the process chain
        logger.info('Received delete call', correlationId);
        self.authService.isAuthorized(req.headers.authorization, correlationId) // check if authorized to make call
            // delete page
            .then(() => { return self.delete(req.body, correlationId) }) // delete page from database and search

            // render dependencies
            .then((data) => { return self.renderProcessService.enqueueDependencies(data, correlationId) }) // add page dependencies to render queue
            .then((data) => { return self.renderProcessService.render(correlationId) }) // render all templates in the render queue

            .then(() => { // send response
                return new Promise((resolve, reject) => {
                    logger.info('Finished successfully, send response', correlationId);
                    res.status(200); // set http status code for response
                    res.json({message: 'Ok'}); // send response body
                    resolve({}); // resolve promise
                })
            })
            .catch(error => {
                error.correlationId = correlationId;
                logger.error(error);
                res.status(error.statusCode || 500); // set http status code for response
                res.json({message: error.message}); // send response body
            });
    }


    /**
     * Handles the preview page api call
     * @param req
     * @param res
     * @param next
     */
    handlePreviewCall(req, res, next) {

    }




    /***********************************************************************************************
     *
     ***********************************************************************************************/

    /**
     * Save page to database and algolia search
     * @param data                          page data
     * @param correlationId
     * @param isUpdate                      true if is update, false if new record
     */
    save(data, correlationId, isUpdate) {
        const self = this;
        return new Promise((resolve, reject) => {
            //
            let templateDefinition = null; // save empty template definition object for later re-use
            let saveData = null; // data that will be saved. Object defined for later use

            // get template definitions
            // find the template that belongs to the data
            self.templateDefinitionService.getDefinition(data[templateDefinitions.templateNameKey], correlationId) // get template definition
                .then((definition) => { return new Promise((res, rej) => { templateDefinition = definition; res({}); }) }) // set templateDefinition object for later use

                // map data
                .then(() => { return templateDefinition.getMapping(data, correlationId); }) // map incoming data to data format that will be saved in database
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

                // update search
                .then(() => { return (isUpdate) ? self.searchConnector.updatePage(saveData, correlationId) : self.searchConnector.addPage(saveData, correlationId) }) // save page to search

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


    /**
     * Delete page from database, algolia search and from the filesystem
     * @param data                      page data
     * @param correlationId
     */
    delete(data, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {

            let templateDefinition = null; // save empty template definition object for later re-use
            // get template definitions
            self.templateDefinitionService.getDefinition(data[templateDefinitions.templateNameKey], correlationId) // get template definition
                .then((definition) => { return new Promise((res, rej) => { templateDefinition = definition; res({}); }) }) // set templateDefinition object for later use

                // pre-delete
                .then(() => { return templateDefinition.preDelete(data, correlationId) }) // pre delete function

                // delete from mongo and search
                .then(() => { return self.pagePersistence.delete(data.id, correlationId) }) // delete page from database
                .then(() => { return self.searchConnector.deletePage(data.id, correlationId) }) // delete page from algolia search

                // delete rendered template from cache/disk
                .then(() => { return templateDefinition.getPath(data, correlationId) }) // get path of the template that will be rendered
                .then((path) => { return self.fileSystemConnector.deleteDirectory(path, correlationId) }) // delete template file and directory

                // post-delete
                .then(() => { return templateDefinition.postDelete(data, correlationId) }) // post delete function

                .then(() => { resolve(data) }) // resolve promise
                .catch(error => {
                    error.correlationId = correlationId; // add correlationId to error object
                    logger.error(error);
                    reject(error);
                });

        })
    }





}

module.exports = PageController;