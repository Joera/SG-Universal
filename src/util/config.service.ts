import {Request, Response} from "express";
import {CONFIG_FOLDER} from "./config";
import { FileSystemConnector } from "../connectors/filesystem.connector";
import {ContentOwner, RenderEnv} from "config";
const filesystem = new FileSystemConnector();

export const configService = async (req: Request, res: Response) => {

    let contentOwner: ContentOwner = null;
    const renderEnvironments: any[] = [];

    try {

        if (req.body.contentOwner) {
            let configFile: any = await filesystem.readFile(CONFIG_FOLDER + "/content-owners/" + req.body.contentOwner + ".json");
            contentOwner = JSON.parse(configFile);
        } else {
            res.status(400); // set http status code for response
            res.json({'msg': 'content owner unknown'}); // send response body
        }

        if (req.body.renderEnvironments) {
            for (let renderEnv of req.body.renderEnvironments) {
                let configFile: any = await filesystem.readFile(CONFIG_FOLDER + "/render-environments/" + renderEnv + ".json");
                renderEnvironments.push(JSON.parse(configFile));
            }
        } else {
            res.status(400); // set http status code for response
            res.json({'msg': 'no render environments supplied'}); // send response body
        }

        return { contentOwner, renderEnvironments }

    }

    catch(err) {
        return;
    }
}

export const configServiceForSync = async (owner: string) => {

    let contentOwner: ContentOwner = null;

    try {

        if (owner) {
            let configFile: any = await filesystem.readFile(CONFIG_FOLDER + "/content-owners/" + owner + ".json");
            contentOwner = JSON.parse(configFile);
        }

        return contentOwner;
    }

    catch(err) {
        return;
    }
}

export const configServiceForBulk = async (owner: string, env: string) => {

    let contentOwner: ContentOwner = null;
    let renderEnv: RenderEnv = null;

    try {

        if (owner && env) {
            let ownerFile: any = await filesystem.readFile(CONFIG_FOLDER + "/content-owners/" + owner + ".json");
            contentOwner = JSON.parse(ownerFile);
            let envFile: any = await filesystem.readFile(CONFIG_FOLDER + "/render-environments/" + env + ".json");
            renderEnv = JSON.parse(envFile);
        }

        return { contentOwner, renderEnv }
    }

    catch(err) {
        return;
    }
}
