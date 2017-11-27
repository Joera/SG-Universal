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
     * Get pages from wordpress api
     * @param correlationId
     */
    getPages(correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {

			let url = config.wordpressUrl + '/api/get_posts/?count=-1';

            // send http request
            requestify.get(url)
                .then(function(response) {
                    logger.info('Received posts from wordpress', correlationId);
                    resolve(response.getBody().posts); // only return the posts of api response
                })
                .catch((error) => {
                    reject(error);
                });

        })
    }


}

module.exports = WordpressConnector;
