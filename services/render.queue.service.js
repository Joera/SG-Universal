'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const logger = require('../services/logger.service');
const config = require('../config');

// declare singleton instance
let instance = null;


/**
 * Render queue service
 */
class RenderQueueService {

    /**
     * Constructor
     * Set the singleton instance if it is not set
     * @returns {*}
     */
    constructor() {
        // check if singleton instance is set
        if(!instance) {
            instance = this;
        }

        // define render queue
        this.queue = []; // the render queue

        return instance; // return singleton instance
    }


    /**
     * Add template to the render queue
     * @param queueItem
     * @param correlationId
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


    /**
     * Get all items from the render queue and clear the queue
     * @param correlationId
     */
    get(correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {
            const queue = _.map(self.queue, _.clone); // make copy of render queue to return
            self.queue = []; // empty queue
            resolve(queue);
        })
    }





}

module.exports = RenderQueueService;