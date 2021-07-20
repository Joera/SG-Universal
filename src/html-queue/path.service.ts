import slugify from "slugify";
import logger from "../util/logger";
import {RenderEnv} from "config";

export function getPath(dataObject: any, renderEnv: RenderEnv)  {

        // remove base_url
        let path = dataObject.url; //.split("/").slice((renderEnv.BASE_URL.split("/").length),dataObject.url.split("/").length).join("/");
        const customPath = renderEnv.CUSTOM_PATHS.find( (r) => dataObject.type === r.type);

         if((customPath  !== undefined )) {
             path = customPath.path;
         }


         return path;

}
