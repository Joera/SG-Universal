'use strict';


/**
 * Render task
 * Re-render all the pages in the local mongodb
 */


const logger = require('../services/logger.service');
const BulkrenderController = require('../controllers/bulkrender.controller');
const bulkrenderController = new BulkrenderController();



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







bulkrenderController.render()
    .then((pages) => {
        process.exit(0);
    })
    .catch((error) => {
        process.exit(1);
    });








