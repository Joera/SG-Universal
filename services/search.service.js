'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
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
    getSearchSnippet(data, templateDefinition, correlationId, options) {
        const self = this;
        return new Promise((resolve, reject) => {

            if(templateDefinition.searchSnippetTemplate && templateDefinition.searchSnippetTemplate !== '') { // check if search snippet template is defined

                templateDefinition.getSearchSnippetData(data, correlationId) // get search snippet data
                    .then((templateData) => {
                        return self.templateService.render('search-snippet',  templateDefinition.searchSnippetTemplate + '.handlebars', templateData, correlationId) }) // render search snippet
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

    getActivitySearchSnippet(data) {
        const self = this;
        return new Promise((resolve, reject) => {

                 return self.templateService.render('search-snippet', 'activity-snippet.handlebars', data, correlationId)  // render search snippet
                    // resolve rendered search snippet
                    .then((searchSnippetHtml) => {
                        resolve(searchSnippetHtml);
                    })
                    .catch((error) => {
                        reject(error);
                    })

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
                // logger.info(data);

                // trim comments
                let algoliaData = JSON.parse(JSON.stringify(data));

                // trim comments
                if(algoliaData.interaction && algoliaData.interaction.comments && algoliaData.interaction.comments.length > 0) {
                    algoliaData.interaction.comments = algoliaData.interaction.comments.slice(0,1);
                }

                if (algoliaData.sections) {
                    algoliaData.sections = _.pickBy(algoliaData.sections, (v, k) => {
                        return v.type === 'paragraph';
                    });
                }

                // trim documents
                if(algoliaData.sections) {

                    for (var i in algoliaData.sections) {
                        if(algoliaData.sections[i].type == 'documents') {
                            delete algoliaData.sections[i];
                        }
                    }
                }

                algoliaData.exerpt = null;
                algoliaData.main_image = null;
                algoliaData.author = null;

                save(algoliaData, correlationId)
                    .then((d) => {

                        logger.info('snippet uploaded to algolia');
                        resolve(data)

                    })
                    .catch((error) => { reject(error) });
                // save page to algolia
            } else {
                resolve(data);
            }
        })
    }
}

module.exports = SearchService;
