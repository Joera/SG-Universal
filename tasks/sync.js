'use strict';


const logger = require('../services/logger.service');
const SyncController = require('../controllers/sync.controller');
const syncController = new SyncController();



/**
 * Set string replace all prototype
 * @param search
 * @param replacement
 * @returns {string}
 */
String.prototype.replaceAll = function (search, replacement) {
    let target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};







syncController.sync()
    .then((pages) => {
        process.exit(0);
    })
    .catch((error) => {
        process.exit(1);
    });








