import slugify from "slugify";
import logger from "../util/logger";
import {RenderEnv} from "config";

export function getPath(dataObject: any, renderEnv: RenderEnv)  {

        // remove base_url
        let path = dataObject.url; //.split("/").slice((renderEnv.BASE_URL.split("/").length),dataObject.url.split("/").length).join("/");
        let custom_path = renderEnv.CUSTOM_PATHS.find( (r) => dataObject.type === r.type);

         if((custom_path  !== undefined )) {
             path = custom_path.path;
         }

       return path;

}
