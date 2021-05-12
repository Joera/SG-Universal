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

    async get(data: DataObject, renderEnv: RenderEnv, dbName: string, template: string, report: IReport) {

        // for ripples ... always get one self with type and slug

        let dataObject = (data.slug) ? await this.getSelf(data.type, data.slug, data.language, dbName, report) : data;


        const config: any = renderEnv.TEMPLATE_DATA.find( (t) => data.type === t.template);

        if((config  !== undefined )) {

            for(const prop of config.properties) {

                const items = await this.genericQuery(dbName, renderEnv, data, prop.query, prop.sort, prop.limit, report );

                // if(prop.limit === 1) {
                //     // logger.debug(items);
                // }

                if(prop.post && prop.post !== undefined) {

                  //  logger.debug( {payload: prop.post, processId: report.processId} );

                    try {
                        const method: any = new (require(TEMPLATE_FOLDER + renderEnv.RENDER_ENVIRONMENT + "/_custom/" + prop.post + ".js"));
                        const response  = method.init(items,dataObject);
                        // logger.debug( {payload: JSON.stringify(response.items), processId: report.processId} );
                        if(response.items && response.items.length > -1 && response.dataObject) {
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

    async getSelf(type: string, slug: string, language: string, dbName: string, report: IReport) {

        const options = {
            query: {
                type: type,
                slug: slug,
                language: language
            }
        };

        try {
            const self = await this.store.findOne(options, dbName);
            if (!self || self === null || self === undefined) {
                logger.debug({ payload: "failed to get one self for " + slug, processId : report.processId });
                logger.debug({ payload: options.query, processId : report.processId });
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

            // logger.debug(options.query);

            return await (options.limit === 1) ? this.store.findOne(options, dbName) : this.store.find(options, dbName);

        } catch (err) {
            logger.error({ payload: err, processId : report.processId});
            return [];
        }
    }
}
