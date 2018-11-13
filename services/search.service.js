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
    getSearchSnippet(templateDefinition, data, correlationId, options) {
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

    updateSearch(data, isUpdate, correlationId, options) {
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
                let algoliaObject = self._trimData(data);
                save(algoliaObject, correlationId)
                    .then((d) => { logger.info('succes'); resolve(d) })
                    .catch((error) => { reject(error) });
            } else {
                resolve(data);
            }
        })
    }

    _trimData(data) {

        // algolia has a max size for one record
        let algoliaObject = Object.assign({}, data);

        if (data.type === 'post') {

            if (algoliaObject.sections) {
                algoliaObject.sections = _.pickBy(algoliaObject.sections, (v, k) => {
                    return v.type === 'paragraph';
                });
            }

            algoliaObject.excerpt = null;
            algoliaObject.main_image = null;
            algoliaObject.author = null;
            algoliaObject.comments = null;
            algoliaObject.attachments = null;
            algoliaObject.content = null;
        }

        return algoliaObject;
    }
}

module.exports = SearchService;
