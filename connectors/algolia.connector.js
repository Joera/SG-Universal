'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const algoliasearch = require('algoliasearch');
const logger = require('../services/logger.service');
const config = require('../config');


/**
 * Connector for the Algolia Hosted Search API
 */
class AlgoliaConnector {

    constructor() {
        this.client = algoliasearch(config.algoliaApplicationId, config.algoliaApiKey);
    }


    /**
     * Add page to algolia search index
     * @param data                      data to store in search
     * @param correlationId             id for correlation through the process chain
     */
    addPage(data, correlationId) {

        const self = this;
        const index = this.client.initIndex(config.algoliaIndexNamePrefix);
        return new Promise((resolve, reject) => {

            // save record to Algolio Search
            index.addObject(data, data._id, (error, content) => {
                if (error) {
                    error.correlationId = correlationId;
                    reject(error);
                }
            //    logger.info('Added page to Algolia search', correlationId);
                resolve(data); // resolve promise
            });

        })
    }


    /**
     * Update page in algolia search index
     * @param data                      data to store in search
     * @param correlationId             id for correlation through the process chain
     */
    updatePage(data, correlationId) {

		let algoliaObject = Object.assign({}, data);

        const self = this;
        const index = this.client.initIndex(config.algoliaIndexNamePrefix);
        return new Promise((resolve, reject) => {
            // save record to Algolio Search
            index.saveObject(algoliaObject, (error, content) => {
                if (error) {
                    error.correlationId = correlationId;
                    reject(error);
                }
            //    logger.info('Updated page in Algolia search', correlationId);
                resolve(data); // resolve promise
            });

        })
    }


    /**
     * Delete page from algolia search index
     * @param id                        id of record that needs to be removed
     * @param correlationId             id for correlation through the process chain
     */
    deletePage(id, correlationId) {
        const self = this;
        const index = this.client.initIndex(config.algoliaIndexNamePrefix);
        return new Promise((resolve, reject) => {

            // save record to Algolio Search
            index.deleteObject(id, (error, content) => {
                if (error) {
                    error.correlationId = correlationId;
                    reject(error);
                }
          //      logger.info('Deleted page from Algolia search', correlationId);
                resolve(id); // resolve promise
            });

        })
    }

    deleteByKeyValue(key,value,correlationId) {
        const self = this;
        const index = this.client.initIndex(config.algoliaIndexNamePrefix);
        return new Promise((resolve, reject) => {

            let options = {

                filters: 'type:activity'
            };

            index.deleteBy(options, (error, content) => {
                if (error) {
                    error.correlationId = correlationId;
                    logger.info(error);
                    resolve();
                }
                logger.info('vlaflip');
                logger.info(content);
                //      logger.info('Deleted page from Algolia search', correlationId);
                resolve(); // resolve promise
            });

        })
    }


}

module.exports = AlgoliaConnector;
