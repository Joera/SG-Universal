'use strict';

const logger = require('../services/logger.service');

let RSSService = require('../services/rss.service'),
    xml = require('xml');

/**
 * RSS controller
 *
 */
class RSSController {


    constructor () {

    }

    get (eq, res, next) {

        let rssService = new RSSService();
        rssService.get().then( (feed) => {
            logger.info('rss received');
            logger.info(feed);
            res.type('application/xml');
            res.status(200); // set http status code for response
            res.send(feed.rss2()); // send response body
        });
    }

}

module.exports = RSSController;


/**
 * Start the sync process
 */