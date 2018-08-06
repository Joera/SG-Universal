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

                        return new Promise((res, rej) => {
                            data.comments = comments;
                            res(data);
                        });

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

                    })
                    .then((data) => { return self._renderSnippets(data,correlationId); })
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

            } else {

                    data.comments = [];
                    resolve(data);
             }
        })
    }

    _createSnippetData(data,correlationId) {


        return new Promise((res, rej) => {

            let comments,comment;


            if (data.interaction && data.interaction.nested_comments && data.interaction.nested_comments.length > 0) {

                // alle comments los .. maar thread insluiten

                comments = [];

                data.interaction.nested_comments.forEach((thread) => {

                    thread.forEach((c) => {

                        comment = {};

                        // logger.info(thread);

                        var renderConfig = {
                            id: c.id,
                            author: c.name,
                            content: c.content,
                            date: c.date,
                            thread: thread,
                            reply_count: thread.length - 1,
                            url: data.url + '#dialoog'

                        }

                        comment.objectID = c.id;
                        comment.type = 'comment';
                        comment.language = data.language;
                        comment.snippetData = renderConfig;
                        comment.content = c.content;
                        comment.author = c.author;
                        comment.comments = thread;
                        comments.push(comment);
                    })
                });

            } else {
                comments = false;
            }

            res(comments);

        });


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

        // logger.info(data.comments);

        if (data.comments && data.comments.length > 0) {

                return Promise.all(data.comments.map(function (comment) {
                    return self.searchService.updateSearch(comment, false, correlationId);

                }));
        } else {

            data.documents = [];
        }
    }
}

module.exports = CommentSearchService;
