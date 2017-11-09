'use strict';

const Promise = require('bluebird');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const fs = require('fs');
const logger = require('../services/logger.service');
const config = require('../config');


/**
 * Connector servide that does all filesystem operations
 */
class FileSystemConnector {

    /**
     * Create directory
     * @param path                      path of directory that needs to be created
     * @param correlationId             id for correlation through the process chain
     * @returns {string}
     */
    createDirectory(path, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {
            if(path && path !== null && path !== '') {
                mkdirp(config.dist + '/' + path, (error) => {
                // mkdirp(config.root + '/' + config.dist + '/' + path, (error) => {
                    if(error) {
                        reject(error);
                    }
                    logger.info('Created directory: ' + path, correlationId);
                    resolve(path); // resolve promise
                });
            } else {
                resolve(path); // resolve promise
            }
        });
    }


    /**
     * Delete directory
     * @param path                      path of directory that needs to be removed
     * @param correlationId             id for correlation through the process chain
     * @returns {string}
     */
    deleteDirectory(path, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {
            if(path && path !== null && path !== '') {
                rimraf(config.dist + '/' + path, (error) => {
                // rimraf(config.root + '/' + config.dist + '/' + path, (error) => {
                    if (error) {
                        reject(error);
                    }
                    logger.info('Deleted directory: ' + path, correlationId);
                    resolve(path); // resolve promise
                })
            } else {
                resolve(path); // resolve promise
            }
        });
    }


    /**
     * Write template file
     * @param path                      path of directory that needs to be removed
     * @param html                      html of the template file
     * @param correlationId             id for correlation through the process chain
     * @returns {string}
     */
    writeTemplateFile(path, html, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {
            if(path !== null) {
                fs.writeFile(config.dist + '/' + path + '/index.html', html, (error) => {
                // fs.writeFile(config.root + '/' + config.dist + '/' + path + '/index.html', html, (error) => {
                    if(error) {
                        reject(error);
                    }
                    resolve(path); // resolve promise
                });
            } else {
                resolve(path); // resolve promise
            }
        });
    }


}





module.exports = FileSystemConnector;