import logger from "../util/logger";
import { QueueController } from "./queue.controller";
import { DataObject} from "content";
import { TemplateDataService} from "./templateData.service";
import { TemplateController} from "../html-template/template.controller";
import { FileSystemConnector } from "../connectors/filesystem.connector";
import { getPath} from "./path.service";
import {DIST_FOLDER} from "../util/config";
import {IReport} from "../reports/report";
import {RenderEnv} from "config";
import { DistConnector} from "../connectors/dist.connector";
import {v4 as uuidV4} from "uuid";


export class RenderController {

    queue: any;
    templateData: any;
    templateController: any;
    filesystem: any;
    dist: any;

    constructor() {
        this.queue = new QueueController();
        this.templateData = new TemplateDataService();
        this.templateController = new TemplateController();
        this.filesystem = new FileSystemConnector();
        this.dist = new DistConnector();
    }

    async renderQueue(report: IReport, renderEnvironments: RenderEnv[]) {

        const resultArray: any[] = [];
        const chunkPromises = [];
        const count = await this.queue.getCount({}); // get the number of items in the render queue

        const chunkSize = 20; // set chunk size, number of templates that are rendered async at the same time
        const numberOfChunks = Math.ceil(count / chunkSize); // set the total number of chunks
        const chunks = new Array(numberOfChunks); // create chunks array for the Promise.each. Just a array with empty items for looping, does not contain data

        for (const index of chunks.keys()) {
            const chunkResult = await this._renderQueueChunk(chunkSize, (index + 1), numberOfChunks, report, renderEnvironments);
            //resultArray = resultArray.concat(chunkResult);
        }

        for (const renderEnv of renderEnvironments) {
            const output = await this.dist.sync(renderEnv);
         //   logger.debug(output.data);
        }
        //
        //
        // for (let result of resultArray) {
        //     report.add('rendered', result);
        // }
        return;
    }

    async _renderQueueItem(name: string, template: string, path: string, data: DataObject, renderEnvironment: RenderEnv, report: IReport) {

        let templateHtml: string;

        try {
            templateHtml = await this.templateController.render(name, template, data, renderEnvironment,report);
      //      logger.debug('rendered template for ' + path);
        }
        catch (error) {

            logger.error({ payload : "failed to render template for " + path, processId : report.processId });
            return false;
        }

        if (templateHtml) {

            try {
                await this.filesystem.createDirectory(renderEnvironment.RENDER_ENVIRONMENT + "/" + path);
                await this.filesystem.writeTemplateFile(renderEnvironment.RENDER_ENVIRONMENT + "/" + path, templateHtml);

                // // dist copy voor alle files .. of s3cmd
                // await this.dist.copy(path,renderEnvironment);
                // logger.info("wrote new html at " + path);
                return path;
            } catch (error) {
                logger.error({ payload : "failed to write html at" + path, processId : report.processId});
                return false;
            }
        }

        return false;
    }

    async _renderQueueChunk(chunkSize: number, chunkNumber: number, totalChunks: number, report: IReport, renderEnvironments: RenderEnv[]) {

        const renderResults: any[] = [];
        const chunk = await this.queue.get({}, chunkSize); // get chunk from render queue
        let renderEnv: RenderEnv;
        const renderedPaths = [];

        for (const item of chunk) {

            renderEnv = renderEnvironments.find( (env) => env.RENDER_ENVIRONMENT === item.renderEnvironment);

            const path = await this._renderQueueItem(item.name, item.template, item.path, item.data, renderEnv, report);
            renderedPaths.push(path);
            if (path) { report.add("rendered", path); } else { report.add("error","failed to render " + path); }
        }

        return renderResults;
    }
}
