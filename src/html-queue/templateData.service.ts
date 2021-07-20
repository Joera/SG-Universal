import {DataObject} from "content";
import MongoStorePersistence  from "../store/mongostore.persistence";
import { trimRelatedItems } from "../store/trim.service";
import logger from "../util/logger";
import {RenderEnv} from "config";
import {isString} from "util";
import {CONFIG_FOLDER, TEMPLATE_FOLDER} from "../util/config";
import { FileSystemConnector } from "../connectors/filesystem.connector";
import {parseQuery} from "../store/query.service";
import {IReport} from "../reports/report";


export class TemplateDataService {

    store: any;
    filesystem: any;

    constructor() {
        this.store = new MongoStorePersistence();
        this.filesystem = new FileSystemConnector();
    }

    checkSlug(config: any, slug : string) {

        return (config.slug && config.slug !== slug) ? false : true;
    }

    async get(data: DataObject, renderEnv: RenderEnv, dbName: string, template: string, report: IReport) {

        // for ripples ... always get one self with type and slug

        let dataObject = (data.slug) ? await this.getSelf(data.type, data.slug, data.language, dbName, renderEnv, report) : data;

        const config: any = renderEnv.TEMPLATE_DATA.find( (t) => data.type === t.template);

        if((config  !== undefined ) && this.checkSlug(config,data.slug)) {

            for(const prop of config.properties) {

                const items = await this.genericQuery(dbName, renderEnv, dataObject, prop.query, prop.sort, prop.limit, report );

                if(prop.post && prop.post !== undefined) {

                    try {
                        const method: any = new (require(TEMPLATE_FOLDER + renderEnv.RENDER_ENVIRONMENT + "/_custom/" + prop.post + ".js"));
                        const response  = method.init(items,dataObject);
                    //   logger.debug({ payload : prop.key});
                    //    logger.debug( {payload: response.items, processId: report.processId} );
                        if(response.items && (response.items.length > -1 || Object.keys(response.items).length > -1 ) && response.dataObject) {
                            dataObject = response.dataObject;
                            dataObject[prop.key] = response.items;
                        }
                   } catch (err) {
                       logger.error({ payload : "failed to process custom script: " + prop.post, processId : report.processId });
                   }

                } else {


                    dataObject[prop.key] = items;
                }
            }
        }


        return dataObject;
    }

    async getSelf(type: string, slug: string, language: string, dbName: string, renderEnv : RenderEnv, report: IReport) {

        // slug is not home

        const options = {
            query: {
                type: type,
                slug: slug,
                language: language,
                renderEnvironments:  { "$in" : [renderEnv.RENDER_ENVIRONMENT]}
            }
        };

        try {
            const self = await this.store.findOne(options, dbName);
            if (!self || self === null || self === undefined) {
                logger.error({ payload: "failed to get one self for " + slug, processId : report.processId });
            }
            return self;
        }
        catch(error) {
            logger.error({ payload: "failed to get self for " + slug, processId : report.processId });
            return {};
        }
    }

    async genericQuery(dbName: string, renderEnv: RenderEnv, dataObject: DataObject, query: any , sort: any , limit: number, report: IReport) {

        try {

            const options: any = {};
            options.query = parseQuery(query, dataObject);
            options.query.renderEnvironments =  { "$in" : [renderEnv.RENDER_ENVIRONMENT]};
            options.sort = sort;
            options.limit = limit;

            return await (options.limit === 1) ? this.store.findOne(options, dbName) : this.store.find(options, dbName);

        } catch (err) {
            logger.error({ payload: err, processId : report.processId});
            return [];
        }
    }
}
