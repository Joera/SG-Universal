import {Request, Response} from "express";
import {CONFIG_FOLDER, TEMPLATE_FOLDER} from "./config";
import { FileSystemConnector } from "../connectors/filesystem.connector";
import {ContentOwner, RenderEnv} from "config";
import logger from "./logger";
import {IReport} from "../reports/report";
const filesystem = new FileSystemConnector();

export const configService = async (req: Request, res: Response, report: IReport) => {

    let contentOwner: ContentOwner = null;
    const renderEnvironments: any[] = [];

    try {


        if (req.body.contentOwner) {

            const configFile: any = await filesystem.readFile(CONFIG_FOLDER + req.body.contentOwner + ".json");
            contentOwner = JSON.parse(configFile);
        } else {
            logger.error({ payload: "content owner config not found", processId : report.processId});
            res.status(400); // set http status code for response
            res.json({"msg": "content owner unknown"}); // send response body
        }

        if (req.body.renderEnvironments) {
            for (const renderEnv of req.body.renderEnvironments) {
                const configFile: any = await filesystem.readFile(TEMPLATE_FOLDER + renderEnv + "/__" + renderEnv + ".json");
                renderEnvironments.push(JSON.parse(configFile));
            }
        } else {
            logger.error({ payload: "render env config not found", processId : report.processId});
            res.status(400); // set http status code for response
            res.json({"msg": "no render environments supplied"}); // send response body
        }

        return { contentOwner, renderEnvironments };

    }

    catch(err) {
        return;
    }
};

export const configServiceForSync = async (owner: string) => {

    let contentOwner: ContentOwner = null;

    try {

        if (owner) {
            const configFile: any = await filesystem.readFile(CONFIG_FOLDER + owner + ".json");
            contentOwner = JSON.parse(configFile);
        }

        return contentOwner;
    }

    catch(err) {
        return;
    }
};

export const configServiceForBulk = async (owner: string, env: string) => {

    let contentOwner: ContentOwner = null;
    let renderEnv: RenderEnv = null;

    try {

        if (owner && env) {
            const ownerFile: any = await filesystem.readFile(CONFIG_FOLDER + owner + ".json");
            contentOwner = JSON.parse(ownerFile);
            const envFile: any = await filesystem.readFile(TEMPLATE_FOLDER + env + "/__" + env + ".json");
            renderEnv = JSON.parse(envFile);
        }

        return { contentOwner, renderEnv };
    }

    catch(err) {
        return;
    }
};
