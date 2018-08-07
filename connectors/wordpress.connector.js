'use strict';
const Promise = require('bluebird');
const uuidv4 = require('uuid/v4');
const requestify = require('requestify');
const bhttp = require('bhttp');
const logger = require('../services/logger.service');

const config = require('../config');


/**
 * Wordpress connector
 *
 */
class WordpressConnector {

    constructor () {

        // this.concatenatedResponse = [];
        // this.page = 0;
    }

    loop(url) {

        logger.info(url);
        let r;
        return requestify.get(url,{redirect: true,timeout: 120000})
        .then(function(response) {

            r = response.getBody();
            logger.info(r["_links"]["next"]["href"]);
            if (r !== null) {
                return Promise.try(function() {
                    return loop(r["_links"]["next"]["href"]);
                }).then(function(recursiveResults) {
                    return [r].concat(recursiveResults);
                });
            } else {
                // Done looping
                return [r];
            }
        });
    }



    /**
     * Get pages from wordpress api
     * @param correlationId
     */
    getPages(correlationId) {

        const self = this;
        return new Promise((resolve, reject) => {

            return self.loop('http://zuidas.publikaan.nl/wp-json/wp/v2/all?page=0')
            .then(function (results) {
                logger.info('coomes back');
            });
        });

    }
}

module.exports = WordpressConnector;
