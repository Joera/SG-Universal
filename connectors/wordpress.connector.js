'use strict';
const Promise = require('bluebird');
const uuidv4 = require('uuid/v4');
const requestify = require('requestify');

const logger = require('../services/logger.service');
const _ = require('lodash');


const config = require('../config');


/**
 * Wordpress connector
 *
 */
class WordpressConnector {

    constructor () {

        // this.concatenatedResponse = [];
        // this.page = 0;
        this.results = []
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

                self.getPage('http://zuidas.publikaan.nl/wp-json/wp/v2/all?page=0',correlationId)
            .then(results => {
                resolve(results)
            }).catch(error => {
                logger.error(error, correlationId);
                reject(error);
            });
        });
    }
}

module.exports = WordpressConnector;
