'use strict';

let Q = require('q'),
    appConfig = require('../config/env'),
    logger = require('../config/winston'),
    RSSService = require('../services/rss.service'),
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