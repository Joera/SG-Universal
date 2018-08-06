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
    commentsToSearch(data,correlationId, options) {

        let self = this;

        return new Promise((resolve, reject) => {

                // init template service

            if(data.interaction.nested_comments && data.interaction.nested_comments.length > 0) {

                self._createSnippetData(data,correlationId)
                    .then((comments) => {

                        data.comments = comments;

                        // return new Promise((res, rej) => {
                        //     for (let i = 0; i < comments.length; i++) {
                        //         let threadObject = {};
                        //
                        //         if (threads[i] !== null) {
                        //             threadObject.objectID = threads[i].id;
                        //             threadObject.date = threads[i].date;
                        //             threadObject.type = 'comments';
                        //             threadObject.snippetData = threads[i];
                        //             threadObject.comments = threads[i].comments;
                        //             data.threads.push(threadObject);
                        //         }
                        //
                        //     }
                        //     res(data);
                        // });
                        resolve(data);
                    })
                    .then((data) => { return self._renderSnippets(data,correlationId); })
                    .then((snippets) => {
                            return new Promise((res, rej) => {
                                for (let i = 0; i < data.threads.length; i++) {
                                    data.threads[i].searchSnippet = snippets[i];
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

            } else {

                    data.comments = [];
                    resolve(data);
             }
        })
    }

    _createSnippetData(data,correlationId) {

        if(data.interaction && data.interaction.nested_comments && data.interaction.nested_comments.length > 0) {

            // alle comments los .. maar thread insluiten

            let comments = [];

            data.interaction.nested_comments.forEach ( (thread)  => {

                thread.forEach ( (comment) => {

                    var renderConfig = {
                        id: comment.id,
                        author: comment.name,
                        content: comment.content,
                        date: comment.date,
                        thread: thread,
                        reply_count: thread.comments.length - 1,
                        url: data.url + '#dialoog'

                    }

                    comments.push(renderConfig);
                })
            }

            resolve(comments);


            // return Promise.all(data.interaction.nested_comments.map(function (thread) {
            //
            //     return new Promise(function (resolve, reject) {
            //
            //         if(thread && thread[0] && thread[0] !== null) {
            //
            //             var renderConfig = {
            //                 id: thread[0].id,
            //                 author: thread[0].name,
            //                 content: thread[0].content,
            //                 date: thread[0].date,
            //                 comments: thread,
            //                 reply_count: thread.length - 1,
            //                 url: data.url + '#dialoog'
            //
            //             }
            //
            //             thread = renderConfig;
            //         }
            //
            //         resolve(thread);
            //     });
            // }))

        } else {
            data.comments = null;
        }
    }

    _renderSnippets(data,correlationId) {

        let self = this;

        if(data.comments && data.comments.length > 0) {
            return Promise.all(data.comments.map(function (comment) {
                return self.templateService.render('search-snippet','thread.handlebars', comment.snippetData, correlationId);
            }))
        }

    }

    _uploadSnippets(data,correlationId){

        let self = this;

        if (data.threads && data.threads.length > 0) {

                return Promise.all(data.threads.map(function (thread) {
                    // save of update?
                    // logger.info('test');
                    // logger.info(thread);

                    return self.searchService.updateSearch(thread, false, correlationId);

                }));
        } else {

            data.documents = [];
        }
    }
}

module.exports = CommentSearchService;
