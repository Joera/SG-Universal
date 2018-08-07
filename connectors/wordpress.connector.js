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
        const self = this;
        let r,results = [];
        return requestify.get(url,{redirect: true,timeout: 120000})
        .then(function(response) {

            r = response.getBody();

            if (r["_links"]["next"]) {
                return Promise.try(function() {
                    return self.loop(r["_links"]["next"][0]["href"]);
                }).then(function(recursiveResults) {
                    logger.info('adding stuff');
                    return results.concat(recursiveResults);
                });
            } else {
                // Done looping
                logger.info('finished stuff');
                return results;
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

            self.loop('http://zuidas.publikaan.nl/wp-json/wp/v2/all?page=0')
            .then(function (results) {
                logger.info('coomes back');
            });
        });

    }
}

module.exports = WordpressConnector;
