import { Request, Response } from "express";
import { v4 as uuidV4 } from "uuid";
import logger from "./util/logger";
import * as mongoStoreController from "./store/mongostore.controller";
import MongoStorePersistence from "./store/mongostore.persistence";
import { QueueController } from "./html-queue/queue.controller";
import { RenderController} from "./html-queue/render.controller";
import { CustomContentModel } from "./store/custom-content.model";
import { DataObject } from "content";
import { IReport, Report } from "./reports/report";
import { FileSystemConnector } from "./connectors/filesystem.connector";
import { DatasetController } from "./datasets/dataset.controller";
import { SearchController } from "./search/search.controller";
import { TemplateController } from "./html-template/template.controller";
import { QueueItem } from "renderer";
import { configService } from "./util/config.service";
import { ContentOwner, RenderEnv } from "config";

const queue = new QueueController();
const renderer = new RenderController();
const filesystem = new FileSystemConnector();
const datasets = new DatasetController();
const search = new SearchController();
const template = new TemplateController();
const mongoStorePersistence =  new MongoStorePersistence();

export const create = async (req: Request, res: Response) => {

    const url: any = null;
    const actions: any[] = [];
    const report: IReport = new Report(req.body.id);
    const { contentOwner, renderEnvironments }: any = await configService(req, res, report);
    const dataObject: DataObject  = new CustomContentModel(req.body, contentOwner, report);

    await mongoStoreController.save(dataObject, contentOwner.MONGODB_DB, report);

    // differentiate for render environments

    for (const envName of dataObject.renderEnvironments) {

        const renderEnv = renderEnvironments.find( (env: RenderEnv) => env.RENDER_ENVIRONMENT === envName);

        await queue.primaries(dataObject, contentOwner, renderEnv, report);
        await queue.ripples(dataObject, contentOwner, renderEnv, report);

        if (renderEnv.RENDER_TASKS.indexOf("datasets") > -1 && dataObject.sections)  {
            actions.push(await datasets.save(dataObject,report));
        }

        if (renderEnv.RENDER_TASKS.indexOf("searchposts") > -1)  {
            actions.push(await search.updatePost(dataObject, contentOwner, renderEnv, report));
        }
    }

    actions.push(await renderer.renderQueue(report, renderEnvironments));

    logger.info( { payload : JSON.stringify(report), processId : report.processId });

    if(actions.length > 0) {

        Promise.all(actions).then((results) => {
            res.status(201); // set http status code for response
            res.json(report); // send response body
        })
        .catch(error => {
            logger.error({ payload : error, processId : report.processId });
            res.status(400); // set http status code for response
            res.json(report); // send response body
        });

    } else {
        res.status(201); // set http status code for response
        res.json(report); // send response body
    }
};

export const remove = async (req: Request, res: Response) => {

    //   const self = this;
    const url: any = null;
    const actions: any[] = [];
    const report: IReport = new Report(req.body.id);
    // test originates outside docker and localhost is not part of dev_net

    const { contentOwner, renderEnvironments }: any = await configService(req, res, report);


    const dataObject: DataObject  = new CustomContentModel(req.body, contentOwner, report);

    // get old url for path to directory
    const oldObject = await mongoStorePersistence.findOne({
        query: {
            _id : dataObject._id
        }
    }, contentOwner, report);

    await mongoStoreController.remove(dataObject, contentOwner, report);

    for (const envName of dataObject.renderEnvironments) {

        const renderEnv = renderEnvironments.find((env: RenderEnv) => env.RENDER_ENVIRONMENT === envName);
        await filesystem.deleteDirectory(oldObject, report);
        await queue.ripples(dataObject, contentOwner, renderEnv, report);

        if (renderEnv.RENDER_TASKS.indexOf("searchposts") > -1)  {
            actions.push(await search.removePost(dataObject,contentOwner, renderEnv, report));
        }
    }

    actions.push(await renderer.renderQueue(report,renderEnvironments));

    logger.info( { payload : JSON.stringify(report), processId : report.processId });

    if(actions.length > 0) {
        Promise.all(actions).then((results) => {

            res.status(201); // set http status code for response
            res.json(report); // send response body
        })
        .catch(error => {
            logger.error({ payload : error, processId : report.processId });
            res.status(400); // set http status code for response
            res.json(report); // send response body
        });

    } else {
        res.status(201); // set http status code for response
        res.json(report); // send response body
    }
};

export const preview = async (req: Request, res: Response) => {

    const report: IReport = new Report(req.body.id);

    try {

        const { contentOwner, renderEnvironments }: any = await configService(req, res, report);
        const dataObject: DataObject  = new CustomContentModel(req.body, contentOwner, report);
        // body = await this.documentService.getDocs(body);
        const html = await template.render(dataObject.slug, dataObject.type, dataObject, dataObject.renderEnvironments[0], report);
        res.status(200); // set http status code for response
        res.json({html: html}); // send response body
    }

    catch (error) {
        logger.error( { payload : "failed to provide preview for " + req.body.id, processId : report.processId });
        res.status(error.statusCode || 500); // set http status code for response
        res.json({message: error.message});
    }
};
