import {DataObject} from "content";
import {IReport} from "../reports/report";
import {getPath} from "../html-queue/path.service";
import logger from "../util/logger";
import {DIST_FOLDER, TEMPLATE_FOLDER} from "../util/config";
import * as fs from "fs";
import {ContentOwner, RenderEnv} from "config";
import {parseQuery} from "../store/query.service";
import MongoStorePersistence from "../store/mongostore.persistence";

const fsPromises = fs.promises;

export class DatasetController {

    store : any;

    constructor() {
        this.store = new MongoStorePersistence();
    }

    checkSlug(config: any, slug : string) {

        return (config.slug && config.slug !== slug) ? false : true;
    }

    async getFromSections(dataObject: DataObject, renderEnv : RenderEnv) {

        const datasets: any = {};
        if (dataObject.sections) {

            for (let i = 0; i < dataObject.sections.length; i++) {

                if (["dataset", "datavismap", "datavisplanning"].indexOf(dataObject.sections[i].type) > -1) {
                    datasets["datasetSection" + i] = dataObject.sections[i].dataset;
                }
            }
        }

        return datasets;
    }

    async getFromConfig(dataObject: DataObject, renderEnv : RenderEnv, contentOwner : ContentOwner, report :IReport) {

        const datasets: any[] = [];

        const config: any = renderEnv.DATASETS.find( (t) => dataObject.type === t.template);

        if((config  !== undefined ) && this.checkSlug(config,dataObject.slug)) {

            for (const file of config.files) {

                if (file.query && file.query.length > 0) {

                    try {

                        const options: any = {};
                        options.query = parseQuery(file.query, dataObject);
                        options.query.renderEnvironments =  { "$in" : [renderEnv.RENDER_ENVIRONMENT]};
                        options.sort = {};
                        options.limit =  1000;

                        const items = await this.store.find(options, contentOwner.MONGODB_DB, report);

                        const url = TEMPLATE_FOLDER + renderEnv.RENDER_ENVIRONMENT + "/_custom/" + file.post + ".js";
                        const method: any = new (require(url));
                        const response  = method.init(items);
                        if(response) {
                            datasets.push({
                                path : (file.path === 'inherit') ? getPath(dataObject,renderEnv) : file.path,
                                filename: file.filename,
                                data : response
                            })
                        }
                    }

                    catch(e) {
                        logger.error('failed to get data for dataset in config')
                    }
                }
            }
        }
      //  logger.debug(datasets);
        return datasets;

    }

    async save( dataObject: DataObject, renderEnv: RenderEnv, report: IReport, contentOwner : ContentOwner) {

        const path = getPath(dataObject, renderEnv);
        const inPageDatasets: any = await this.getFromSections(dataObject,renderEnv);
        if(Object.keys(inPageDatasets).length > 0) {
            const result = await this.writeJsonFile(inPageDatasets, path, "dataset.json",renderEnv);
            if(result) { report.add("datasets", path); } else { report.add("errors","dataset for " + path);}
        }
        const extraDatasets: any[] = await this.getFromConfig(dataObject, renderEnv, contentOwner, report);

        for (let dataset of extraDatasets) {

            const result = await this.writeJsonFile(dataset.data, dataset.path, dataset.filename, renderEnv);
            if(result) { report.add("dataset", dataset.filename); } else { report.add("errors","dataset for " + dataset.filename);}
        }
        return;
    }

    async writeJsonFile(datasets: any, path: string, filename: string, renderEnv: RenderEnv) {

        if (path && path !== null) {

            try {
                const location = DIST_FOLDER + renderEnv.RENDER_ENVIRONMENT + "/" + path + filename;

                await fsPromises.writeFile(location, JSON.stringify(datasets));
                return true;
            }
            catch(error) {
                logger.error("failed to write dataset for " + path);
                return false;
            }
        }
    }
}
