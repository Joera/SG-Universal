'use strict';

const Promise = require('bluebird');
const logger = require('./logger.service');
const TemplateService = require('../services/template.service');
const SearchService = require('../services/search.service');


/**
 * Service for getting documents from the post sections
 */
class ThreadSearchService {


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
    toSearch(data,correlationId, options) {

        let self = this;

        return new Promise((resolve, reject) => {

            if(data.interaction.comments && data.interaction.comments.length > 0) {

                self._renderSnippets(data,correlationId)
                    .then((snippets) => {
                        return new Promise((res, rej) => {
                            for (let i = 0; i < data.interaction.comments.length; i++) {
                                data.interaction.comments[i].searchSnippet = snippets[i];
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

        resolve(data);

        // if(data.comments && data.comments.length > 0) {
        //
        //
        //     return Promise.all(data.interaction.comments.map(function (thread) {
        //
        //         return new Promise(function (resolve, reject) {
        //
        //             // if(thread && thread[0] && thread[0] !== null) {
        //             //
        //             //     var renderConfig = {
        //             //         id: thread[0].id,
        //             //         author: thread[0].name,
        //             //         content: thread[0].content,
        //             //         date: thread[0].date,
        //             //         comments: thread,
        //             //         reply_count: thread.length - 1,
        //             //         url: data.url + '#dialoog'
        //             //
        //             //     }
        //             //
        //             //     thread = renderConfig;
        //             // }
        //
        //             resolve(thread);
        //         });
        //     }))
        //
        // } else {
        //     data.comments = null;
        // }
    }

    _renderSnippets(data,correlationId) {

        let self = this;

        if(data.interaction.comments && data.interaction.comments.length > 0) {

            return Promise.all(data.interaction.comments.map(function (thread) {

                thread.objectID = 'thread_' + thread.comment_ID;
                thread.type = 'comments';
                thread.date = thread.comment_date;
                thread.comment_count = thread.comment_children.length + 1;
                thread.post = {};
                thread.post.url = data.url;

                return self.templateService.render('search-snippet','thread-search-snippet.handlebars', thread, correlationId);
            }))

        }
    }

    _uploadSnippets(data,correlationId){

        let self = this;

        if (data.interaction.comments && data.interaction.comments.length > 0) {

<<<<<<< HEAD
            return Promise.all(data.interaction.comments.map(function (thread) {

                return self.searchService.updateSearch(thread, false, correlationId);

            }));
=======
                return Promise.all(data.interaction.comments.map(function (thread) {

                    return self.searchService.updateSearch(thread, false, correlationId);

                }));
>>>>>>> master
        }
    }
}

module.exports = ThreadSearchService;