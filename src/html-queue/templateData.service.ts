import {DataObject} from "content";
import MongoStorePersistence  from "../store/mongostore.persistence";
import { trimRelatedItems } from "../store/trim.service"
import logger from "../util/logger";
import {RenderEnv} from "config";
import {isString} from "util";
import {CONFIG_FOLDER, TEMPLATE_FOLDER} from "../util/config";
import { FileSystemConnector } from "../connectors/filesystem.connector";
import {parseQuery} from "../store/query.service";


export class TemplateDataService {

    store: any;
    filesystem: any;

    constructor() {
        this.store = new MongoStorePersistence();
        this.filesystem = new FileSystemConnector();
    }

    async get(data: DataObject, renderEnv: RenderEnv, dbName: string, template: string) {

        // for ripples ... always get one self with type and slug
        // unless slug on rippleObject is set to false
        let dataObject: DataObject = (data.slug) ? await this.getSelf(data.type, data.slug,data.language,dbName) : data;

        let config : any = renderEnv.TEMPLATE_DATA.find( (t) => data.type === t.template);

        if((config  !== undefined )) {

            for(let prop of config.properties) {

                let items = await this.genericQuery(dbName, renderEnv, data, prop.query, prop.sort, prop.limit );

                if(prop.post && prop.post !== undefined) {
                   try {
                        let method: any = new (require(TEMPLATE_FOLDER + "/_custom/" + prop.post + ".js"));
                        const response  = method.init(items,dataObject);
                        if(response.items && response.items.length > -1 && response.dataObject) {
                            dataObject = response.dataObject;
                            dataObject[prop.key] = response.items;
                        }
                   } catch (err) {
                       logger.error('failed to process custom script');
                   }

                } else {
                    dataObject[prop.key] = items;
                }
            }
        }

        return dataObject;
    }

    async getSelf(type: string, slug: string, language: string, dbName: string) {

        const options = {
            query: {
                type: type,
                slug: slug,
                language: language
            }
        };

        try {
            return await this.store.findOne(options, dbName);
        }
        catch(error) {
            logger.error("failed to get self");
            return {};
        }
    }



    async genericQuery(dbName: string, renderEnv: RenderEnv, dataObject: DataObject, query : any , sort: any , limit: number) {

        try {

            const options : any = {};
            options.query = parseQuery(query, dataObject)
            options.query.renderEnvironments =  { "$in" : [renderEnv.RENDER_ENVIRONMENT]};
            options.sort = sort;
            options.limit = limit;

            return await (options.limit === 1) ? this.store.findOne(options, dbName) : this.store.find(options, dbName);

        } catch (err) {
            logger.error(err);
            return [];
        }
    }
}
