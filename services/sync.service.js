'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const logger = require('../services/logger.service');
const PagePersistence = require('../persistence/page.persistence');
const config = require('../config');


/**
 * Sync service
 *
 */
class SyncService {


    constructor () {
        this.pagePersistence = new PagePersistence();
    }


    /**
     * Find the pages that are deleted
     * Compare the pages in mongo db to the supplied pages by the cms
     * @param cmsPages                      pages received from the cms
     * @param correlationId
     */
    findDeletedPages(cmsPages, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {
            self.pagePersistence.find({}) // get all pages from mongodb
                .then((pages) => {
                    let dbPages = pages.map((p) => { p.id = p._id; return p; }); // make sure that all pages from mongodb have a id property for comparison, by default mongo items only have _id
                    let deletedPages = _.differenceWith(dbPages, cmsPages, self._idComparitor); // find the pages that are deleted
                    resolve(deletedPages);
                })
                .catch(error => {
                    error.correlationId = correlationId; // add correlationId to error object
                    logger.error(error);
                    reject(error);
                });
        });
    }


    /**
     * Copmare the if properties of the objects
     * @param a                     object
     * @param b                     object
     * @returns {boolean}           return true if objects id's are the same
     * @private
     */
    _idComparitor(a, b) {
        return a.id === b.id;
    }




}

module.exports = SyncService;