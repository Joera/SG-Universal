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

        return Promise.try( () => {

            let r, results = [];
            return requestify.get(url, {redirect: true, timeout: 120000})
                .then(function (response) {

                    r = response.getBody();

                    results.concat(Object.values(r);

                    if (r["_links"] && r["_links"]["next"]) {
                        return Promise.try( () => {
                            self.loop(r["_links"]["next"][0]["href"]);
                        }).then( () => {
                                logger.info('adding stuff');
                                // logger.info(r);
                                //
                                // results = results.concat(r);
                                logger.info(results.length);
                            });
                    } else {
                        // Done looping
                        logger.info('finished stuff');
                        logger.info(results);
                        return results;
                    }
                });
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
            .then( (results) =>{
                logger.info('comes back');
            });
        });

    }
}

module.exports = WordpressConnector;
