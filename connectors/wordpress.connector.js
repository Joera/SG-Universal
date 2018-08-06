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

        this.concatenatedResponse = [];
    }

    /**
     * Get pages from wordpress api
     * @param correlationId
     */
    getPages(page,correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {

			let url = config.wordpressUrl + '/' + config.wordpressApiPath + '?page=' + page;

			logger.info(url);
            requestify.get(url,{
                redirect: true,
                timeout: 120000
            }).then((response) => {

                    if(response.getBody() !== null) {
                        self.concatenatedResponse = self.concatenatedResponse.concat(response.getBody());
                        page++;
                       self.getPages(page,correlationId)
                    } else {
                        logger.info('Received ' + self.concatenatedResponse.length + ' items from wordpress', correlationId);
                        resolve(self.concatenatedResponse);
                    }
                })
                .catch((error) => {
                    reject(error);
                });

        })
    }
}

module.exports = WordpressConnector;
