import {DataObject} from "content";
import {TEMPLATE_FOLDER} from "../util/config";
import logger from "../util/logger";
import fs from "fs";
import glob from "glob";
import handlebars from "handlebars";
import moment from "moment"; // needed inside some custom helpers
import { helpers } from "./handlebars-helpers";
// import { customHelpers } from "../custom/handlebars-helpers-custom";
import {RenderEnv} from "config";
import {IReport} from "../reports/report";

declare const customHelpers: any[];


const fsPromises = fs.promises;

export class TemplateController {

    templateService: any;

    async render(name: string, templateName: string, dataObject: DataObject, renderEnv: RenderEnv, report: IReport) {



        if (dataObject === undefined) { return false; }

        const html: string | boolean = "";

        try {



            let source: any = false;

            await this._registerHelpers(renderEnv, report);
            await this._registerPartials(renderEnv, report);

            const dirname: string = renderEnv.RENDER_ENVIRONMENT ? TEMPLATE_FOLDER  + renderEnv.RENDER_ENVIRONMENT : TEMPLATE_FOLDER;
            const extendedTemplateUrl = dirname + "/" + templateName + "-" + dataObject.slug + ".handlebars";

            if (fs.existsSync(extendedTemplateUrl)) {
                source = await fsPromises.readFile(extendedTemplateUrl, "utf-8");
            } else {
                if(fs.existsSync(dirname + "/" + templateName + ".handlebars")) {
                    source = await fsPromises.readFile(dirname + "/" + templateName + ".handlebars", "utf-8");
                } else {
                    logger.error({ payload : "could not find template file for " + templateName + " in " + dirname, processId : report.processId} );
                }
            }

            const templateObject = {
                body: dataObject,
                baseUrl: renderEnv.BASE_URL,
                assetsUrl: renderEnv.ASSETS_URL,
                renderEnv: renderEnv.RENDER_ENVIRONMENT
            };

            const template = handlebars.compile(source);
            const html = template(templateObject);
            //html = await this._minifyRenderedTemplate(html);
            // check for null
            return (!!html) ? html : false;
        }
        catch (error) { // error rendering template
            logger.error({ payload : "failed to create html with template " + templateName + " for " + dataObject.slug, processId : report.processId });
            return false;
        }
    }

    async _registerHelpers(renderEnv: RenderEnv, report: IReport) {

        // register all helpers

        let customHelper: any;
        const dirname = TEMPLATE_FOLDER + renderEnv.RENDER_ENVIRONMENT + "/_helpers";

        if(helpers) {
            helpers.forEach((helper) => {
                try {
                    handlebars.registerHelper(helper.name, helper.helper); // register helper
                }
                catch (error) {
                    logger.error({ payload : "failed to register helper: " + helper.name, processId : report.processId });
                }
            });
        }

        // look for custom helpers !! in run time
        return await new Promise( (resolve,reject) => {

            const patterns = dirname + "/**/*.js";
            glob(patterns, async(error, filepaths) => {

                for (const filepath of filepaths) {

                    const customHelper = new (require(filepath.replace(".js","")));

                    try {
                        handlebars.registerHelper(customHelper.name, customHelper.helper);
                    }
                    catch (error) {
                        logger.error({ payload : "failed to register custom helper: " + customHelper.name, processId : report.processId });
                    }
                }

                resolve(handlebars);
            });
        });
    }

    async _registerPartials(renderEnv: RenderEnv, report: IReport) {

        let source: any;
        const dirname = TEMPLATE_FOLDER + renderEnv.RENDER_ENVIRONMENT + "/_partials";

        return await new Promise( (resolve,reject) => {

            const patterns = dirname + "/**/*.handlebars";

            glob(patterns, async(error, filepaths) => {

                for (const filepath of filepaths) {

                    const parts = filepath.split("/");
                    const last = parts[parts.length - 1];
                    const partialName = last.split(".")[0];

                    source = await fsPromises.readFile(filepath,"utf-8");

                    try {
                        handlebars.registerPartial(partialName, source);
                    }
                    catch (error) {
                        logger.error({ payload : "failed to register partial: " + partialName, processId : report.processId });
                    }
                }

                resolve();
            });
        });
    }
}
