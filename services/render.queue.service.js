'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const logger = require('../services/logger.service');
const config = require('../config');


/**
 *
 */
class RenderQueueService {


    constructor() {
        this.queue = []; // the render queue
    }


    /*
                - start queue
                    - pre render
                    - render template
                    - create directory >>> FileSystemService?
                    - write temlpate file >>> FileSystemService?
                    - post render
     */








    add(queueItem, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {
            const isInQueue = _.find(self.queue, (i) => { return i.path === queueItem.path; }); // find item in queue

            if(!isInQueue) { // check if item is already in queue
                self.queue.push(queueItem); // add item to queue
                logger.info('Added template to render queue: ' + queueItem.path, correlationId);
            } else {
                logger.info('Template is already in queue: ' + queueItem.path, correlationId);
            }
            resolve(queueItem);
        })
    }







}

module.exports = RenderQueueService;