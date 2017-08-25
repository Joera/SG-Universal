'use strict';

const Promise = require('bluebird');
const uuidv4 = require('uuid/v4');
const requestify = require('requestify');
const logger = require('../services/logger.service');

const config = require('../config');


/**
 * Wordpress connector
 *
 */
class WordpressConnector {


    constructor () {

    }


    /**
     * Get posts from wordpress api
     * @param correlationId
     */
    getPosts(correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {

            // send http request
            requestify.get(appConfig.wordpresUrl + '/api/get_posts/?count=-1')
                .then(function(response) {
                    logger.info('Received posts from wordpress', correlationId);
                    resolve(response.getBody());
                })
                .catch((error) => {
                    reject(error);
                });

        })
    }


}

module.exports = WordpressConnector;