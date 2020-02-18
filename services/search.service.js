'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const logger = require('./logger.service');
const stripHtml = require("string-strip-html");
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

                templateDefinition.getSearchSnippetData(data, correlationId) // get search snippet data
                    .then((templateData) => {
                        return self.templateService.render('search-snippet', 'search-snippet.handlebars',templateData, correlationId)
                    })
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

                const templateService = new TemplateService();

                 templateService.render('search-snippet', 'activity-snippet.handlebars', data)  // render search snippet
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

                let save;

                if(isUpdate) { // if update use the update call else use add
                    save = self.searchConnector.updatePage.bind(self.searchConnector);
                } else {
                    save = self.searchConnector.addPage.bind(self.searchConnector);
                }

                // save page to algolia
                save(data, correlationId)
                    .then((d) => { resolve(d) })

                let algoliaObject = self._trimData(data);

                save(algoliaObject, correlationId)
                    .then((d) => {
                        resolve(d)
                    })
                    .catch((error) => { reject(error) });
            } else {
                resolve(data);
            }
        })
    }

    _trimData(data) {

        // algolia has a max size for one record
        let algoliaObject = Object.assign({}, data);

        if (data.type === 'post' || data.type === 'page' ) {


                if (algoliaObject.date) {
                    // algolia prefers start tot time value for sorting // this happens after snippet has been generated.
                    algoliaObject.date = new Date(algoliaObject.date.replace('T', ' ')).getTime();
                }

                if (algoliaObject.sections) {
                    algoliaObject.sections = _.pickBy(algoliaObject.sections, (v, k) => {
                        return v.type === 'paragraph';
                    });
                }

                // algoliaObject.sections = algoliaObject.sections.slice(0,5);

                if(algoliaObject.sections) {

                    // for (let section of Object.values(algoliaObject.sections)) {
                    //
                    //     section.text = stripHtml(section.text).substring(0, 800);
                    // }
                     algoliaObject.sections = Object.entries(algoliaObject.sections).slice(0,3).map(entry => entry[1]);
                }

            algoliaObject.sections = null;

              //   algoliaObject.excerpt = null;
                algoliaObject.main_image = null;
                algoliaObject.author = null;
                algoliaObject.comments = null;
                algoliaObject.attachments = null;
                algoliaObject.datasets = null;
               //  algoliaObject.content = null;
        }

        logger.debug(algoliaObject);

        return algoliaObject;
    }

    deleteByKeyValue(key,value,correlationId) {

        const self = this;
        return new Promise((resolve, reject) => {

            self.searchConnector.deleteByKeyValue(key,value,correlationId).then( () => {

                resolve();

            }).catch( (error) => {

                reject(error);
            });
        });
    }
}

module.exports = SearchService;
