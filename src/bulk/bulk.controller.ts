import CMSConnector from "../connectors/cms.connector";
import MongostorePersistence  from "../store/mongostore.persistence";
import {CustomContentModel} from "../store/custom-content.model";
import { QueueController } from "../html-queue/queue.controller";
import { RenderController} from "../html-queue/render.controller";
import { SearchController } from "../search/search.controller";

import logger from "../util/logger";
import _ from "lodash";
import {IReport, Report} from "../reports/report";
import {configServiceForBulk} from "../util/config.service";
import {RenderEnv} from "config";
import {v4 as uuidV4} from "uuid";
import {DatasetController} from "../datasets/dataset.controller";

export default class BulkController {

    cms: any;
    service: any;
    mongoStore: any;
    queue: any;
    renderer: any;
    searchCtrl: any;
    datasets: any;

    constructor() {
        this.cms = new CMSConnector();
        this.mongoStore = new MongostorePersistence();
        this.queue = new QueueController();
        this.renderer = new RenderController();
        this.searchCtrl = new SearchController();
        this.datasets = new DatasetController();
    }

    async render(owner: string, env: string, type: string) {

        const report: IReport = new Report("bulkrender");
        const { contentOwner, renderEnv } = await configServiceForBulk(owner,env);

        const query = type ? {
            "type": type,
            "renderEnvironments": {$in: [renderEnv.RENDER_ENVIRONMENT]}
        } : {"renderEnvironments": {$in: [renderEnv.RENDER_ENVIRONMENT]}};

        try {

            let pages = await this.mongoStore.find({query: query}, contentOwner.MONGODB_DB, report);

            pages = pages.reverse();

            for (const page of pages) {

                const report: IReport = new Report(page._id);
                await this.queue.primaries(page, contentOwner, renderEnv, report);
           //     await this.queue.ripples(page, contentOwner, renderEnv, report);

                if (renderEnv.RENDER_TASKS.indexOf("datasets") > -1)  {
                    await this.datasets.save(page,renderEnv, report, contentOwner);
                }
            }
           //
            await this.renderer.renderQueue(report,[renderEnv]);

            logger.info( { payload : "Re-render completed. Rendered " + report.rendered.length + " pages", processId : report.processId });

            // if(report.error.length > 0) {
            //     logger.debug(report.error);
            // }
        }
        catch(error) {
            logger.error({ payload : "failed at bulkrender", processId : report.processId} );
        }
    }

    async search(owner: string, env: string, type: string, ) {

        const report: IReport = new Report("bulksearch");
        const { contentOwner, renderEnv } = await configServiceForBulk(owner,env);

        const envs = [renderEnv.RENDER_ENVIRONMENT];

        const query = type ? {
            "type": type,
            "renderEnvironments": {$in: envs}
        } : {"renderEnvironments": {$in: envs}};

        try {

            const pages = await this.mongoStore.find({query: query}, contentOwner.MONGODB_DB, report);

            for (const page of pages) {

                const report: IReport = new Report(page._id);

                await this.searchCtrl.updatePost(page, contentOwner, renderEnv, report);

                if (renderEnv.RENDER_TASKS.indexOf("searchcomments") > -1 && page.interaction && page.interaction.nestedComments && page.interaction.nestedComments.length > 0) {
                    for (const thread of page.interaction.nestedComments) {
                        for (const comment of thread) {
                            await this.searchCtrl.updatePost({
                                type: "comment",
                                comment: comment,
                                thread: thread,
                                post: page
                            }, contentOwner, renderEnv, report);
                        }
                    }
                }

                if (renderEnv.RENDER_TASKS.indexOf("searchdocuments") > -1 && page.sections) {
                    for (const key of Object.keys(page.sections)) {
                        const sectionKeys = Object.keys(page.sections[key]);
                        if (sectionKeys.indexOf("documents") !== -1) {
                            for (const document of page.sections[key].documents) {
                                await this.searchCtrl.updatePost({
                                    type: "document",
                                    document: document,
                                    post: page
                                }, contentOwner, renderEnv, report);
                            }
                        }
                    }
                }
            }

            logger.debug({ payload: "bulksearch for " + pages.length + " " + type ? type : "all type" + "s"});
        }

        catch(error) {
            logger.error( { payload : "failed at bulksearch"});
        }
    }
}
