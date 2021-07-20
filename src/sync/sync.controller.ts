import CMSConnector from "../connectors/cms.connector";
import SyncService from "./sync.service";
import MongostorePersistence  from "../store/mongostore.persistence";
import {CustomContentModel} from "../store/custom-content.model";

import logger from "../util/logger";
import _ from "lodash";
import {IReport, Report} from "../reports/report";
import {configServiceForSync} from "../util/config.service";
import {ContentOwner} from "config";

export default class SyncController {

    cms: any;
    service: any;
    mongoStore: any;

    constructor() {
        this.cms = new CMSConnector();
        this.service = new SyncService();
        this.mongoStore = new MongostorePersistence();
    }

    async sync(owner: string, type: string) {

        const contentOwner: ContentOwner = await configServiceForSync(owner);
        const report: IReport = new Report(type);

        if(!type || type === undefined || type === null) { type = "all"; }

        const pages = await this.cms.getPages(type, contentOwner,false, false);
        const cmsPages = JSON.parse(JSON.stringify(pages));
        const deletedPages = await this.service.findDeletedPages(cmsPages, type, contentOwner);

        const chunkSize = 5; // set chunk size, number of pages that are deleted async at the same time
        let chunkedPages = _.chunk(deletedPages, chunkSize); // chunk render queue

        for (let i = 0; i < chunkedPages.length; i++) {
            // delete pages, iterate chunks serially
            const result = await this.deletePages(chunkedPages[i], (i + 1), chunkedPages.length);
            // for (let r of result) {
            //     report.delete.push(r);
            // }
        }

        chunkedPages = _.chunk(cmsPages, chunkSize); // chunk render queue

        for (let i = 0; i < chunkedPages.length; i++) {
            // delete pages, iterate chunks serially
            const result = await this.savePages(chunkedPages[i], (i + 1), chunkedPages.length, contentOwner, report);
            // for (let r of result) {
            //     report.save.push(r);
            // }
        }

        const countSave = cmsPages.length || 0; // number of updated pages
        const countDelete = deletedPages.length || 0; // number of deleted pages
        logger.info("Sync completed. Saved " + countSave + " pages and deleted " + countDelete + " pages");
        // logger.info(report);
    }

    async deletePages(pages: any[], chunkNumber: number, totalChunks: number) {

        const responseArray = [];

        for (const page of pages) {
            const result = await this.mongoStore.remove(page.id);
            if(result) {
                responseArray.push(page.slug);
            }
        }

        return responseArray;
    }

    async savePages(pages: any[], chunkNumber: number, totalChunks: number, contentOwner: ContentOwner, report: IReport) {

        const responseArray: any[] = [];

        for (const page of pages) {
            const dataObject = new CustomContentModel(page, contentOwner, report);
            const result = await this.mongoStore.save(dataObject, contentOwner.MONGODB_DB);
            responseArray.push(dataObject.slug);
        }

        return responseArray;
    }
}
