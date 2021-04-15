import logger from "../util/logger";
import _ from "lodash";
import MongoStorePersistence from "../store/mongostore.persistence";


export default class SyncService {

    store: any;

    constructor() {
        this.store = new MongoStorePersistence();
    }

    async findDeletedPages(cmsPages: any[], type: string, env: string) {

        let query;

        if (type && env) {

            query = {
                query : {
                    "type": type,
                    "renderEnvironments": { $in: [env] }
                }
            };

        } else if (type) {

            query = {
                query : {
                    "type": type,
                }
            };

        } else if (env) {

            query = {
                query : {
                    "type": {$ne: "document"},
                    "renderEnvironments": { $in: [env] }
                }
            };

        } else {

            query = {
                query : {
                    "type": {$ne: "document"}
                }
            };
        }

        const pages = await this.store.find(query); // get all pages from mongodb

        const dbPages = pages.map((p: any) => { p.id = p._id; return p; }); // make sure that all pages from mongodb have a id property for comparison, by default mongo items only have _id
        return _.differenceWith(dbPages, cmsPages, this._idComparitor); // find the pages that are deleted
    }

    async findDeletedDocuments(cmsPages: any[]) {

        const pages = await this.store.find({ query : { "type" : "document"}}); // get all pages from mongodb
        const dbPages = pages.map((p: any) => { p.id = p._id; return p; }); // make sure that all pages from mongodb have a id property for comparison, by default mongo items only have _id
        return _.differenceWith(dbPages, cmsPages, this._idComparitor); // find the pages that are deleted
    }

    _idComparitor(a: any, b: any) {
        return String(a.id) === String(b.id);
    }
}
