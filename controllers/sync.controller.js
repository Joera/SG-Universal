'use strict';

const Promise = require('bluebird');
const uuidv4 = require('uuid/v4');
const logger = require('../services/logger.service');
const WordpressConnector = require('../connectors/wordpress.connector');

const config = require('../config');


/**
 * Page controller
 *
 */
class SyncController {


    constructor () {
        this.wordpressConnector = new WordpressConnector();
    }



    sync() {
        const self = this;

        const correlationId = uuidv4(); // set correlation id for debugging the process chain
        this.wordpressConnector(correlationId)
            .then()
            .catch(error => {
                error.correlationId = correlationId;
                logger.error(error);
            });

    }




}

module.exports = SyncController;