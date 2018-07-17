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
        const self = this;
        return new Promise((resolve, reject) => {
            queueItem._id = (queueItem.path === '') ? '/' : queueItem.path;

            db.getRenderQueueCollection() // get page collection

                // check if template is already in render queue
                // check id not water tight because the add function is executed async and templates can be added simultaneously
                .then((collection) => {
                    return new Promise((res, rej) => {
                        collection.find({"_id": queueItem._id}).limit(1).toArray()
                            .then((items) => {
                                if(items.length === 0) {
                                    // template not found in queue
                                    res(collection)
                                } else {
                                    // template already in queue
                                    const proxiedError = new TypeError();
                                    proxiedError.message = 'Skipping';
                                    rej(proxiedError.message)
                                    // rej(proxiedError)
                                }
                            })
                    })
                })

                // save template to render queue collection
                .then((collection) => {
					return collection.save(queueItem);
				})

                //
                .then((d) => {
                    logger.info('Added template to render queue: ' + queueItem.path, correlationId);
                    resolve(queueItem);
                })
                .catch((error) => {
                    // error.correlationId = correlationId;
                    // logger.warn('Could not add template to render queue: ' + queueItem.path, correlationId);
                    logger.error(error);
                    // reject(error);
                    resolve(queueItem);
                })
        })
    }


    /**
     * Get all items from the render queue and clear the queue
     * @param correlationId
     */
    get(query, limit, correlationId) {
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


    /**
     * Remove all items from the render queue
     * @param correlationId
     */
    clear(correlationId,options) {
        const self = this;
        return new Promise((resolve, reject) => {
            db.getRenderQueueCollection() // get page collection
                .then((collection) => {
                    return collection.remove({});
                })
                .then((d) => {
                    logger.info('Cleared the render queue', correlationId);
                    resolve({});
                })
                .catch((error) => {
                    // error.correlationId = correlationId;
                    reject(error);
                })
        })
    }


}

module.exports = RenderQueueService;
