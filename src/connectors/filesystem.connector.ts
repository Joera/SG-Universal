import logger  from "../util/logger";
import mkdirp from "mkdirp";
import rmrf from "rmrf";
import fs from "fs";
import { DIST_FOLDER } from "../util/config";
import {IReport, Report} from "../reports/report";
import { getPath } from "../html-queue/path.service";
import {DataObject} from "content";
import {RenderEnv} from "config";

const fsPromises = fs.promises;

export class FileSystemConnector {

    async createDirectory(path: string) {

            if (path && path !== null && path !== "") {
                const dir = await mkdirp(DIST_FOLDER + "/" + path, {});
            }

            return;
    }

    async deleteDirectory(dataObject: DataObject, renderEnv: RenderEnv, report: IReport) {

                    const path = getPath(dataObject, renderEnv);

                    if (path && path !== null && path !== "") {

                        try {
                            const files = fsPromises.readdir(DIST_FOLDER  + renderEnv.RENDER_ENVIRONMENT + "/" + path);
                            if(files) {
                                const result: any = await rmrf(DIST_FOLDER  + renderEnv.RENDER_ENVIRONMENT + "/" + path);
                                report.add("deleted",path);
                            }
                        }

                        catch (error) {
                            logger.info( { payload : "failed to delete html", processId : report.processId });

                        }
                    }


                return;
    }

    async writeTemplateFile(path: string, html: string) {

            if (path !== null) {
                const result = await fsPromises.writeFile(DIST_FOLDER + "/" + path + "/index.html", html);
            }

            return;
    }

    async readFile(path: string): Promise<Buffer> {

        return new Promise( async(resolve, reject) => {

            try {
                const data = await fsPromises.readFile(path, "binary");
                resolve(Buffer.from(data));
            }
            catch(err) {
                logger.error("Error occured while reading file!", err);
                reject();
            }
        });

    }
}
