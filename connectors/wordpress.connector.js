'use strict';
const Promise = require('bluebird');
const uuidv4 = require('uuid/v4');
const requestify = require('requestify');
const logger = require('../services/logger.service');
const config = require('../config');
const _ = require('lodash');



/**
 * Wordpress connector
 *
 */
class WordpressConnector {

    constructor () {

        // this.concatenatedResponse = [];
        // this.page = 0;
        this.results = [];
    }

    getPage(url,correlationId) {

        const self = this;

        function loop(url,resolve,reject) {

            requestify.get(url, {redirect: true, timeout: 120000}) // ;

            .then(response => {

                    let r = response.getBody();
                    self.results = self.results.concat(_.values(r));

                    if (r["_links"] && r["_links"]["next"]) {
                            loop(r["_links"]["next"][0]["href"],resolve, reject);
                    } else {
                        // Done looping
                        resolve(self.results.filter( (r) => {
                            return r.title !== undefined;
                        }));
    }
                }).catch(error => {
                    logger.error(error, correlationId);
                    reject(error);
                });
        }

        return new Promise((resolve, reject) => {
            return loop(url,resolve, reject)
        });
    }


    /**
     * Get pages from wordpress api
     * @param correlationId
     */
    getPages(correlationId) {

        const self = this;

        return new Promise((resolve, reject) => {

         logger.info(config.wordpressUrl + '/' +  config.wordpressApiPath);

            self.getPage(config.wordpressUrl + '/' +  config.wordpressApiPath, correlationId) //  + '?page=0'
            .then(results => {
                let json = JSON.parse(results);
                resolve(json.results);
            }).catch(error => {
                logger.error(error, correlationId);
                    reject(error);
                });
        });
    }
}

module.exports = WordpressConnector;
