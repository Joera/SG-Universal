'use strict';

const Promise = require('bluebird');
const logger = require('./logger.service');
const TemplateService = require('../services/template.service');
const SearchService = require('../services/search.service');


/**
 * Service for getting documents from the post sections
 */
class DocumentService {


    constructor() {

        this.searchService = new SearchService();
        this.templateService = new TemplateService();
    }


    /**
     * Get the documents from post and put them in the config.data.documents property
     * Render search snippets for the documents and add them to the documents
     * @param config
     * @returns {*|promise|Constructor|e}
     */
    documentsToSearch(data,correlationId) {

        let self = this;

        return new Promise((resolve, reject) => {
                // init template service

                self._getDocuments(data,correlationId)
                    .then((data) => { return self._createSnippetData(data,correlationId); })
                    .then((documents) => { return self._renderSnippets(documents,correlationId); })
                    .then((snippets) => {
                            return new Promise((res, rej) => {
                                for (let i = 0; i < data.documents.length; i++) {
                                    data.documents[i].searchSnippet = snippets[i];
                                }
                                res(data);
                            });
                    })
                    .then((data) => { return self._uploadSnippets(data,correlationId); })
                    .then((data) => {
                        resolve(data);
                    })
                    .catch((error) => {
                        reject(error);
                    });
        })
    }
    _getDocuments(data,correlationId)  {

        // get documents from section
        return new Promise((resolve, reject) => {

            if (data.sections) {
            // loop all sections on the page
                Object.keys(data.sections).forEach(key => {
                    let sectionKeys = Object.keys(data.sections[key]);

                    // check if section contains a document property
                    if (sectionKeys.indexOf('documents') !== -1) {
                        if (!data.documents) data.documents = []; // init documents property if it is not set
                        data.documents = data.sections[key].documents; // add dataset from section to datasets variable
                    }
                });
            }
            resolve(data);
        });
    }

    _createSnippetData(data,correlationId) {

        return Promise.all(data.documents.map(function (document) {

            return new Promise(function(resolve, reject) {

                var renderConfig = {
                    title: document.file_name,
                    content: document.file_description,
                    date: document.post.date,
                    url: document.file_cdn_url,
                    type: 'document',
                    tags: document.file_tags,
                    post: document.post

                }
                document.type = 'document';
                document.snippetData = renderConfig;
                resolve(document);
            });
        }))
    }

    _renderSnippets(documents,correlationId) {

        let self = this;

        return Promise.all(documents.map(function (doc) {
            return self.templateService.render('search-snippet','search-snippet.handlebars', doc.snippetData, correlationId);
        }))
    }

    _uploadSnippets(data,correlationId) {

        let self = this;

        return Promise.all(data.documents.map(function (document) {
            // save of update?
            return self.searchService.updateSearch(document,false,correlationId);

        }));
    }
}


module.exports = DocumentService;