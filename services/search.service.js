'use strict';

const Promise = require('bluebird');
const logger = require('./logger.service');
const TemplateService = require('../services/template.service');
const TemplateDefinitionService = require('../services/template.definition.service');
const SearchConnector = require('../connectors/algolia.connector');


/**
 * Class with utility functions for the algolia search
 */
class SearchService {

    constructor () {
        this.templateService = new TemplateService();
        this.templateDefinitionService = new TemplateDefinitionService();
        this.searchConnector = new SearchConnector();
    }


    /**
     * Returns rendered search snippet for page
     * If no search snippet template is defined return an empty string
     * @param templateDefinition                template definition of the pages
     * @param data                              page data
     * @param correlationId
     */
    getSearchSnippet(templateDefinition, data, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {

            if(templateDefinition.searchSnippetTemplate && templateDefinition.searchSnippetTemplate !== '') { // check if search snippet template is defined
                // get search snippet template definition
                let searchSnippetTemplateDefinition = null; // save empty template definition object for later re-use
                self.templateDefinitionService.getDefinition(templateDefinition.searchSnippetTemplate, correlationId)
                    .then((definition) => { return new Promise((res, rej) => { searchSnippetTemplateDefinition = definition; res({}); }) }) // set templateDefinition object for later use

                    // get search snippet
                    .then(() => { return templateDefinition.getSearchSnippetData(data, correlationId) }) // get search snippet data
                    .then((templateData) => {
                        return self.templateService.render(searchSnippetTemplateDefinition.name, searchSnippetTemplateDefinition.template, templateData, correlationId) }) // render search snippet
                    // resolve rendered search snippet
                    .then((searchSnippetHtml) => {
                        resolve(searchSnippetHtml);
                    })
                    .catch((error) => {
                        reject(error);
                    })
            } else { // no search snippet template is defined
                resolve('');
            }

        })
    }


    /**
     * Update algolia search
     * Only update if searchSnippet property on data object is NOT undefined or an empty string
     * @param data                          data to be saved in algolia
     * @param isUpdate                      true if is update, false is new record
     * @param correlationId
     */

    updateSearch(data, isUpdate, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {
            if(data.searchSnippet && data.searchSnippet !== '') {
                // set algolia save function
                let save;
                if(isUpdate) { // if update use the update call else use add
                    save = self.searchConnector.updatePage.bind(self.searchConnector);
                } else {
                    save = self.searchConnector.addPage.bind(self.searchConnector);
                }

                // save page to algolia
                save(data, correlationId)
                    .then((d) => { resolve(d) })
                    .catch((error) => { reject(error) });
            } else {
                resolve(null);
            }
        })
    }

    /**
     * Save document to algolia index
     * @param config                Config object {res: express response object, path: path of the template file, response: resonse data that will be send to client, data: {type: page type, body: saved blog post data, navigation: null, documents: array of document objects}}
     * @returns {Constructor|*|promise|e}
     */
    saveDocument(data, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {
            logger.info(data.documents);
            if (data.documents) { // check if config has docuemnts property

                data.documents.forEach(document => {

                    let save = self.searchConnector.addPage.bind(self.searchConnector);
                    save(document, correlationId)
                    .then((d) => {resolve(d)})
                    .catch((error) => {reject(error)});

                    logger.info('+++ saved document succesfull to algolia');
                });

            } else {
                resolve(null);
            }
        });
    }
}

module.exports = SearchService;
