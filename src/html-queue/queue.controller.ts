import bluebird from "bluebird";
import logger from "../util/logger";
import { getPath } from "./path.service";
import { QueueItem, MongoQuery, RippleObject } from "renderer";
import { DataObject } from "content";
import { getCollection } from "../connectors/mongo.connector";
import { TemplateDataService} from "./templateData.service";
import { RippleService } from "./ripple.service";
import { IReport } from "../reports/report";
import {ContentOwner, RenderEnv } from "config";
import {DatasetController} from "../datasets/dataset.controller";

export class QueueController {

    rippleService: any;
    templateData: any;
    datasets: any;

    constructor() {
        this.rippleService = new RippleService();
        this.templateData = new TemplateDataService();
        this.datasets = new DatasetController();
    }

    async primaries(dataObject: DataObject, contentOwner: ContentOwner, renderEnv: RenderEnv, report: IReport) {

        if (renderEnv.RENDER_TASKS.indexOf("datasets") > -1)  {
            await this.datasets.save(dataObject,renderEnv, report, contentOwner);
        }

        if (renderEnv.RENDER_TYPES.indexOf(dataObject.type) < 0) { return; }

        const queueResponses: any[] = [];
        const queueItems: QueueItem[] = [];
        let templateData: DataObject;

        try {

            try {
                templateData = await this.templateData.get(dataObject, renderEnv, contentOwner.MONGODB_DB, dataObject.template, report);
           //     logger.debug('gathered templateData for ' + dataObject.slug);
            }
            catch (error) {
                logger.error({ payload : "failed to gather templateData for " + dataObject.slug, processId : report.processId});
                return false;
            }

            queueItems.push({
                name: dataObject.type,
                template: dataObject.template,
                renderEnvironment: renderEnv.RENDER_ENVIRONMENT,
                path: getPath(dataObject, renderEnv),
                data: templateData
            });
            // }

            for (const queueItem of queueItems) {

                if (queueItem.path !== null && queueItem.template && queueItem.template !== null) {
                    const queueResponse = await this.add(queueItem, report);
                    report.add("queued",queueItem.template + ": " + queueItem.path);
                    queueResponses.push(queueResponse);
                }
            }
            return queueResponses;
        }

        catch (error) {
            logger.error({ payload : "failed to enqueue primaries", processId : report.processId});
            return false;
        }
    }

    async ripples(dataObject: DataObject, contentOwner: ContentOwner, renderEnv: RenderEnv, report: IReport) {

        const queueResponses: any[] = [];
        const queueItems: QueueItem[] = [];
        const cascades: RippleObject[] = await this.rippleService.get(dataObject,renderEnv,contentOwner);



        try {

            for (const cascade of cascades) {



                const templateData = await this.templateData.get(cascade, renderEnv, contentOwner.MONGODB_DB, cascade.type, report);
            //    logger.debug('gathered templateData for ' + cascade.slug);

                queueItems.push({
                    name: cascade.slug,
                    template: cascade.type,
                    renderEnvironment: renderEnv.RENDER_ENVIRONMENT,
                    path: cascade.path,
                    data: templateData
                });

                if (renderEnv.RENDER_TASKS.indexOf("datasets") > -1)  {
                    await this.datasets.save(templateData,renderEnv, report, contentOwner);
                }
            }

            for (const queueItem of queueItems) {

                if (queueItem.path !== null && queueItem.template && queueItem.template !== null) {
                    const queueResponse = await this.add(queueItem, report);
                    report.add("queued","ripple " + queueItem.template + ": " + queueItem.path);
                    queueResponses.push(queueResponse);
                }
            }
            return queueResponses;
        }

        catch (error) {
            logger.error({ payload : "failed to enqueue ripples", processId : report.processId});
            return false;
        }
    }

    async bulk(queueItems: QueueItem[], contentOwner: ContentOwner, report: IReport) {

        const queueResponses: any[] = [];

        for (const queueItem of queueItems) {
                const queueResponse = await this.add(queueItem, report);
                queueResponses.push(queueResponse);
        }

        return;
    }


    async add(queueItem: QueueItem, report: IReport) {

        let result;
        const queue = await getCollection("universal", "queue", report); // get page collection

        const exists = await queue.findOne({ path: queueItem.path});

        if(exists === null) {
            result = await queue.insertOne(queueItem);
        }

        return result;
    }

    async get(query: MongoQuery, limit: number, test: boolean, report: IReport) {

        const queue = await getCollection("universal","queue", report);
        // get chunck
        const items = await queue.find(query).limit(limit).toArray();
        // remove items from queue
        if (items !== null) {
            queue.deleteMany({
                _id: {
                    $in: items.map((item: QueueItem) => {
                        return item._id;
                    })
                }
            });
        }

        return items;
    }


    async getCount(query: any, test: boolean, report: IReport) {

        const queue = await getCollection("universal", "queue", report);
        return queue.countDocuments(query);
    }

    async clear(test: boolean, report: IReport) {
        const queue = await getCollection("universal", "queue", report); // get page collection
        queue.remove({});
    }

}
