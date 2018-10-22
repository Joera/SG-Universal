'use strict';

    const fs = require('graceful-fs');
    const Promise = require('bluebird');
    const logger = require('./logger.service');
    const config = require('../config/index');

/**
 * Service for getting dataset for visualization from the post sections and saving the dataset in a separate file so it can be loaded on the static pages
 */
class DatasetService {

    constructor() {}
    /**
     * Get dataset properties from sections and place the data from the dataset properties in the config.data.datasets
     * @param config
     * @returns {*|promise|Constructor|e}
     */
    getDataset(data,path) {

        let self = this;

        return new Promise((resolve, reject) => {

            logger.info('1');

            if (data.sections) {

                logger.info('2');

                // loop all sections on the page
                Object.keys(data.sections).forEach(key => {
                    let sectionKeys = Object.keys(data.sections[key]);
                    logger.info('3');
                    // check if section contains a dataset property
                    if (sectionKeys.indexOf('dataset') !== -1) {
                        logger.info('4');
                        if (!data.datasets) data.datasets = {}; // init datasets property if it is not set
                        data.datasets['datasetSection' + key] = data.sections[key].dataset; // add dataset from section to datasets variable
                    } else if (sectionKeys.indexOf('datavismap') !== -1) {
                        if (!data.datasets) data.datasets = {}; // init datasets property if it is not set
                        data.datasets['datasetSection' + key] = data.sections[key].dataset; // add dataset from section to datasets variable
                    }
                });

                resolve(data,path);
            } else {
                resolve(data,path);
            }
        });
    }
    /**
     * Write the dataset property in the config.data to a json file in the same directory as the template
     * @param config
     * @returns {*|promise|Constructor|e}
     */
    writeJsonFile(data,path,filename) {

        return new Promise((resolve, reject) => {

            if (path && path !== null && data) {
                logger.info({message: 'write json file', path: path});

                fs.writeFile(config.dist + path + '/' + filename, JSON.stringify(data), function (error) {
                    if (error) {
                        logger.error(error);
                        reject({status: 500, message: 'error writing json file'});
                    }
                    resolve(data,path);
                });
            } else {
                resolve(data,path);
            }
        });
    }
    /**
     * Controller function for writing the dataset to a json file
     * @param config
     * @returns {*|promise|Constructor|e}
     */
    saveDataset(data,path) {

        let self = this;

        return new Promise((resolve, reject) => {

            self.getDataset(data, path)
                .then( data => {
                    if(data.datasets) {
                        logger.info('5');
                        self.writeJsonFile(data.datasets, path, 'dataset.json');
                    } else {
                        resolve(data);
                    }
                })
                .then(data => {
                    resolve(data)
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
}


module.exports = DatasetService;