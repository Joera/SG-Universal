"use strict";

import algoliasearch from "algoliasearch";
import {DataObject} from "content";
import logger  from "../util/logger";
import {RenderEnv} from "config";


export default class AlgoliaConnector {

    async addPage(data: DataObject, renderEnv: RenderEnv) {

        logger.debug({ payload: renderEnv.ALGOLIA_INDEX_NAME_PREFIX });

        const client = algoliasearch(renderEnv.ALGOLIA_APP_ID, renderEnv.ALGOLIA_API_KEY);
        const index = client.initIndex(renderEnv.ALGOLIA_INDEX_NAME_PREFIX);
        return (await index.saveObjects([data])) ? true : false;
    }

    async deletePage(id: string, renderEnv: RenderEnv) {

        const client = algoliasearch(renderEnv.ALGOLIA_APP_ID, renderEnv.ALGOLIA_API_KEY);
        const index = client.initIndex(renderEnv.ALGOLIA_INDEX_NAME_PREFIX);
        return (await index.deleteObjects([id])) ? true : false;
    }
}
