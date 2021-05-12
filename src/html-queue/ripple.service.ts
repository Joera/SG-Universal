import {DataObject} from "content";
import {RippleObject} from "renderer";
import logger from "../util/logger";
import {ContentOwner, RenderEnv} from "config";
import {parseQuery} from "../store/query.service";
import {getPath} from "./path.service";
import MongoStorePersistence from "../store/mongostore.persistence";

export class RippleService {

    store: any;

    constructor() {
        this.store = new MongoStorePersistence();
    }

    async get(dataObject: DataObject, renderEnv: RenderEnv, contentOwner: ContentOwner) {

        const ripples: RippleObject[] = [];

        for (const ripple of renderEnv.RIPPLES.filter( (r) => r.types.indexOf(dataObject.type) > -1)) {

                if (!ripple.condition) { // or if condition is met  {


                    if (ripple.objects) {

                        for (const object of ripple.objects) {

                            ripples.push(
                                {
                                    type: object.type,
                                    slug: object.slug,
                                    path: object.path,
                                    language: dataObject.language,
                                    renderEnvironments: [renderEnv.RENDER_ENVIRONMENT]
                                }
                            );
                        }
                    }

                    if (ripple.query) {

                        let items = [];
                        const options: any = {};
                        options.query = parseQuery(ripple.query.query, dataObject);
                        options.query.renderEnvironments =  { "$in" : [renderEnv.RENDER_ENVIRONMENT]};
                        options.sort = ripple.query.sort;
                        options.limit = ripple.query.limit;

                        try {
                            items = await this.store.find(options, contentOwner.MONGODB_DB);
                        }
                        catch(err) {
                            logger.error("failed to query ripples");
                        }

                        for (const item of items) {

                            ripples.push(
                                {
                                    type: item.type,
                                    slug: item.slug,
                                    path: getPath(item, renderEnv),
                                    language: item.language,
                                    renderEnvironments: [renderEnv.RENDER_ENVIRONMENT]
                                }
                            );
                        }
                    }
                }
        }

        return ripples;
    }
}
