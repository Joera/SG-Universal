"use strict";

import algoliasearch from "algoliasearch";
import {DataObject} from "content";
import logger  from "../util/logger";
import {RenderEnv} from "config";


export default class AlgoliaConnector {

    constructor() {}

    async addPage(data: DataObject, renderEnv: RenderEnv) {

        const client = algoliasearch(renderEnv.ALGOLIA_APP_ID, renderEnv.ALGOLIA_API_KEY);
        const index = client.initIndex(renderEnv.ALGOLIA_INDEX_NAME_PREFIX);
        return (await index.saveObjects([data])) ? true : false;
    }

    async deletePage(id: string, renderEnv: RenderEnv) {

        const client = algoliasearch(renderEnv.ALGOLIA_APP_ID, renderEnv.ALGOLIA_API_KEY);
        const index = client.initIndex(renderEnv.ALGOLIA_INDEX_NAME_PREFIX);
        return (await index.deleteObjects([id])) ? true : false;
    }

    // deleteByKeyValue(key,value,correlationId) {
    //     const self = this;
    //     const index = this.client.initIndex(config.algoliaIndexNamePrefix);
    //     return new Promise((resolve, reject) => {
    //
    //         let options = {
    //             facetFilters: ['parentID:' + value]
    //         };
    //
    //         index.deleteBy(options, (error, content) => {
    //             if (error) {
    //                 error.correlationId = correlationId;
    //                 logger.info(error);
    //                 resolve();
    //             }
    //             //      logger.info('Deleted page from Algolia search', correlationId);
    //             resolve(); // resolve promise
    //         });
    //
    //     })
    // }
}
