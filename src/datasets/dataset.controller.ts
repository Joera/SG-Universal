import {DataObject} from "content";
import {IReport} from "../reports/report";
import {getPath} from "../html-queue/path.service";
import logger from "../util/logger";
import {DIST_FOLDER} from "../util/config";
import * as fs from "fs";

const fsPromises = fs.promises;

export class DatasetController {

    async get(dataObject: DataObject) {

        const datasets: any = {};

        if (!dataObject.sections || dataObject.sections.length < 1) { return datasets; }

        for (let i = 0; i < dataObject.sections.length; i++) {

            if (["dataset","datavismap","datavisplanning"].indexOf(dataObject.sections[i].type) > -1) {
                datasets["datasetSection" + i] = dataObject.sections[i].dataset;
            }
        }

        return datasets;
    }

    async save( dataObject: DataObject, report: IReport) {

        for (const renderEnv of dataObject.renderEnvironments) {
            const path = getPath(dataObject, renderEnv);
            const datasets: any[] = await this.get(dataObject);
            if(Object.values(datasets).length > 0) {
                const result = await this.writeJsonFile(datasets, path, "dataset.json");
                if(result) { report.add("datasets", path); } else { report.add("errors","dataset for " + path);}
            }
        }

        return;
    }

    async writeJsonFile(datasets: any, path: string, filename: string) {

        if (path && path !== null) {

            try {
                await fsPromises.writeFile(DIST_FOLDER + path + "/" + filename, JSON.stringify(datasets));
                return true;
            }
            catch(error) {
                logger.error("failed to write dataset for " + path);
                return false;
            }
        }
    }
}
