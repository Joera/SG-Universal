'use strict';
const Promise = require('bluebird');
const uuidv4 = require('uuid/v4');
const requestify = require('requestify');
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



    /**
     * Get pages from wordpress api
     * @param correlationId
     */
    getPages(correlationId) {

        const self = this;

        let done = false;

        promiseWhile(function() {
            // Condition for stopping
            return done;

        }, function() {
            // The function to run, should return a promise
            return new Promise(function(resolve, reject) {
                let url = config.wordpressUrl + '/' + config.wordpressApiPath + '?page=' + self.page;
                logger.info(url);
                requestify.get(url,{
                    redirect: true,
                    timeout: 120000
                }).then((response) => {

                    if(response.getBody() !== null) {
                        self.concatenatedResponse = self.concatenatedResponse.concat(response.getBody());
                        self.page++;
                        resolve();
                    } else {
                        done = true;
                    }
                });

            });
        }).then(function() {
            // Notice we can chain it because it's a Promise, this will run after completion of the promiseWhile Promise!
            resolve(self.concatenatedResponse);
        });

    }
}

module.exports = WordpressConnector;
