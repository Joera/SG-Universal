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
    getPages(page,concatenatedResponse,correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {

			let url = config.wordpressUrl + '/' + config.wordpressApiPath + '?page=' + page;

			logger.info(url);
            logger.info(concatenatedResponse.length);
            requestify.get(url,{
                redirect: true,
                timeout: 120000
            }).then((response) => {

                    if(response.getBody() === null) {
                        logger.info('Received ' + concatenatedResponse.length + 'items from wordpress', correlationId);

                        resolve(concatenatedResponse);
                    } else {

                        let items = response.getBody();
                        concatenatedResponse.concat(items);
                        logger.info(concatenatedResponse.length);

                        page++;
                       self.getPages(page,concatenatedResponse,correlationId)
                    }
                })
                .catch((error) => {
                    reject(error);
                });

        })
    }
}

module.exports = WordpressConnector;
