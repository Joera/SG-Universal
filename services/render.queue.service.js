'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const logger = require('../services/logger.service');
const db = require('../connectors/mongodb.connector');
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
        // this.queue = []; // the render queue

        return instance; // return singleton instance
    }


    /**
     * Add template to the render queue
     * @param queueItem
     * @param correlationId
     */
    add(queueItem, correlationId) {
        // const self = this;
        // return new Promise((resolve, reject) => {
        //     const isInQueue = _.find(self.queue, (i) => { return i.path === queueItem.path; }); // find item in queue
        //
        //     if(!isInQueue) { // check if item is already in queue
        //         self.queue.push(queueItem); // add item to queue
        //         logger.info('Added template to render queue: ' + queueItem.path, correlationId);
        //     } else {
        //         logger.info('Template is already in queue: ' + queueItem.path, correlationId);
        //     }
        //     resolve(queueItem);
        // })

        const self = this;
        return new Promise((resolve, reject) => {
            queueItem._id = queueItem.path;

            db.getRenderQueueCollection() // get page collection
                .then((collection) => { return collection.save(queueItem); }) // execute save
                .then((d) => {
                    logger.info('Added template to render queue: ' + queueItem.path, correlationId);
                    resolve(queueItem);
                })
                .catch((error) => {
                    // error.correlationId = correlationId;
                    reject(error);
                    // resolve(queueItem);
                })
        })
    }


    /**
     * Get all items from the render queue and clear the queue
     * @param correlationId
     */
    get(query, limit, correlationId) {
        // const self = this;
        // return new Promise((resolve, reject) => {
        //     const queue = _.map(self.queue, _.clone); // make copy of render queue to return
        //     self.queue = []; // empty queue
        //     resolve(queue);
        // })


        // if(!limit) limit = 10;
        // return db.getRenderQueueCollection() // get page collection
        //         // .then((collection) => { return collection.find({}).limit(limit).toArray(); }); // execute find query
        //         .then((collection) => { return collection.remove().limit(limit).toArray(); }); // execute find query

        const self = this;
        return new Promise((resolve, reject) => {

            let collection = null;
            let queueItems = []; // queue items to return
            db.getRenderQueueCollection() // get page collection
                .then((col) => { return new Promise((res, rej) => { collection = col; res(collection)}) }) // save collection for later use
                .then(() => {
                    return collection.find(query).limit(limit).toArray()
                    // return collection.find({}, {_id : 1}).limit(limit).toArray()
                        // .map((doc) => { return doc._id; });  // pull out just the _ids
                })
                .then((qi) => {
                    queueItems = qi; // set queue items that will be returned
                    return collection.remove({_id: {$in: queueItems.map((item) => { return item._id })}}) // remove items
                })
                .then(() => { resolve(queueItems); })
                .catch((error) => { reject(error) });

        })

    }


    /**
     * Get the total number of items in the render queue
     * @param correlationId
     */
    getCount(query, correlationId) {
        return db.getRenderQueueCollection() // get page collection
            .then((collection) => { return collection.count(query); }); // execute find query
    }



}

module.exports = RenderQueueService;