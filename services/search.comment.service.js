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


            if(data.interaction && data.interaction.nested_comments && data.interaction.nested_comments.length > 0) {

                self._createSnippetData(data,correlationId)
                    .then((comments) => {

                        return new Promise((res, rej) => {
                            data.comments = comments;
                            res(data);
                        });

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
                            thread: thread.filter( t => { t.id != c.id }),
                            reply_count: thread.filter( t => { t.id != c.id }).length,
                            url: data.url + '#comment-id-' + c.id,
                            post_title: data.title.rendered || data.title

                        }


                        comment.objectID = c.id;
                        comment.type = 'comment';
                        comment.language = data.language;
                        comment.snippetData = renderConfig;
                        comment.title = c.content.slice(0,120).replace(/<(?:.|\n)*?>/gm, '');
                        comment.content = c.content.replace(/<(?:.|\n)*?>/gm, '');
                        comment.author = c.author;
                        comment.comments = thread.filter( t => { t.id != c.id });
                        comments.push(comment);
                    })
                });

            } else {
                comments = false;
            }

            res(comments);
        });
    }

    _renderSnippets(data,correlationId) {

        let self = this;

        if(data.comments && data.comments.length > 0) {
            return Promise.all(data.comments.map(function (comment) {
                return self.templateService.render('search-snippet','comment-snippet.handlebars', comment.snippetData, correlationId);
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
