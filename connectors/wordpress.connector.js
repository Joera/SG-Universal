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

    loop(url) {

        logger.info(url);
        const self = this;

        return Promise.try( () => {

            return requestify.get(url, {redirect: true, timeout: 120000});

        }).then(function (response) {

            let r = response.getBody();

            // self.results = self.results.concat(_.values(r));

            if (r["_links"] && r["_links"]["next"]) {
                return Promise.try( () => {
                    self.loop(r["_links"]["next"][0]["href"]);
                }).then( (recursiveResults) => {
                        logger.info('adding stuff');
                        logger.info(logger.info);
                        return recursiveResults;
                    });
            } else {
                // Done looping
                logger.info('finished stuff');
                // logger.info(self.results.length);
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

        function loop(url) {

            logger.info(url);

            return new Promise((resolver, rejecter) => {

                // return Promise.try( () => {

                    return requestify.get(url, {redirect: true, timeout: 120000}) // ;

               // })
                .then(response => {

                    let r = response.getBody();

                    self.results = self.results.concat(_.values(r));
                    logger.info(self.results.length);

                    if (r["_links"] && r["_links"]["next"]) {
                        Promise.try(() => {
                            loop(r["_links"]["next"][0]["href"]);
                        });
                    } else {
                        // Done looping
                        logger.info('finished stuff');
                        resolver();
                        // logger.info(self.results.length);
                        // return [r];
                    }
                }).catch(error => {
                    logger.error(error, correlationId);
                    rejecter(error);
                });

            });

        }

        return new Promise((resolve, reject) => {

            return Promise.try( () => {

                return loop('http://zuidas.publikaan.nl/wp-json/wp/v2/all?page=0');

            }).then(results => {
                // logger.info(results.length);
                logger.info('comes back');
            }).catch(error => {
                logger.error(error, correlationId);
                reject(error);
            });
        });
    }
}

module.exports = WordpressConnector;
