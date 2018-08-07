'use strict';
const Promise = require('bluebird');
const uuidv4 = require('uuid/v4');
const requestify = require('requestify');
const bhttp = require('bhttp');
const logger = require('../services/logger.service');

const config = require('../config');

const promiseWhile = function(condition, action) {
    return new Promise(function(resolve, reject) {
        var loop = function() {
            if (!condition()) return resolve();
            return Promise.cast(action())
                .then(loop)
                .catch(function(e) {
                    reject(e);
                });
        };
        process.nextTick(loop);
    });
};

/**
 * Wordpress connector
 *
 */
class WordpressConnector {

    constructor () {

        this.concatenatedResponse = [];
        this.page = 0;
    }

    loop(url) {

        let r;
        return Promise.try(function() {
            logger.info(url);
            return bhttp.get(url); // ,{redirect: true,timeout: 120000}
        }).then(function(response) {
            logger.info('r');
            // r = response.getBody();
            // logger.info(r);
            // if (r !== null) {
            //     return Promise.try(function() {
            //         return loop(r["_link"]["next"]);
            //     }).then(function(recursiveResults) {
            //         return [r].concat(recursiveResults);
            //     });
            // } else {
            //     // Done looping
            //     return [r];
            // }
        });
    }



    /**
     * Get pages from wordpress api
     * @param correlationId
     */
    getPages(correlationId) {

        const self = this;

        Promise.try(function() {
            return self.loop("http://zuidas.publikaan.nl/wp-json/wp/v2/all?page=0");
        }).then(function(results) {
            // Now `results` is an array that contains the response for each HTTP request made.
            return results;
        })

    }
}

module.exports = WordpressConnector;
