'use strict';

const Promise = require('bluebird');
const logger = require('./logger.service');
const TemplateService = require('../services/template.service');
const SearchService = require('../services/search.service');


/**
 * Service for getting documents from the post sections
 */
class CommentSearchService {


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
    commentsToSearch(data,correlationId) {

        let self = this;

        return new Promise((resolve, reject) => {
                // init template service

                self._createSnippetData(data,correlationId)
                    .then((comments) => { return self._renderSnippets(comments,correlationId); })
                    .then((snippets) => {
                            return new Promise((res, rej) => {
                                for (let i = 0; i < data.comments.length; i++) {
                                    data.comments[i].searchSnippet = snippets[i];
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

    _createSnippetData(data,correlationId) {

        if(data.comments && data.comments.length > 0) {

            return Promise.all(data.comments.map(function (thread) {

                return new Promise(function (resolve, reject) {

                    var renderConfig = {
                        author: thread[0].author,
                        content: thread[0].content,
                        date: thread[0].date,
                        type: 'comments',
                        comments: thread;

                    }

                    newObject.type = 'comments';
                    newObject.snippetData = renderConfig;
                    resolve(newObject);
                });
            }))

        } else {
            data.comments = [];
        }
    }

    _renderSnippets(comments,correlationId) {

        let self = this;

        if(comments && comments.length > 0) {

            return Promise.all(comments.map(function (thread) {
                return self.templateService.render('search-snippet','thread-search-snippet.handlebars', thread.snippetData, correlationId);
            }))

        } else {
            comments = [];
        }
    }

    _uploadSnippets(data,correlationId){

        let self = this;

        if (data.comments && data.comments.length > 0) {

                return Promise.all(data.comments.map(function (thread) {
                    // save of update?
                    logger.info('thread');
                    logger.info(thread);
                    return self.searchService.updateSearch(thread, false, correlationId);

                }));
        } else {

            data.documents = [];
        }
    }

}


module.exports = CommentSearchService;