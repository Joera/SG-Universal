import logger from "../util/logger";
import axios from "axios";
import got from "got";
import {response} from "express";
import {ContentOwner} from "config";
export default class CMSConnector {

    getPage(urlBase: string, path: string) {

        let results: any[] = [];

         function loop(urlBase: string, path: string, resolve: any, reject: any) {

           axios(urlBase + path).then( (response) => {
               results = results.concat(Object.values(response.data));
               if (response.data["_links"] && response.data["_links"]["next"]) {
                    loop(urlBase, response.data["_links"]["next"][0]["href"], resolve, reject);
               } else {
                   resolve(results.filter( r => r.title !== undefined));
               }
           }).catch (error => {
                logger.error("failed to get posts from cms");
                reject();
           });
         }

        return new Promise((resolve, reject) => {
            return loop(urlBase, path ,resolve, reject);
        });
    }

    async getPages(type: string, contentOwner: ContentOwner, limit: number, test: boolean) {

        let apiSlug: string;
        const urlBase = test ? "http://localhost:8000" : contentOwner.WP_URL_DOCKER;

        let query = "?";

        // if(renderEnv) { query += 'env=' + renderEnv + '&'; }
        query += (limit) ?  "per_page=" + limit : "page=0";

        switch(type) {

            case 'post':
                apiSlug = 'posts';

                break;

            case 'page':
                apiSlug = 'pages';

                break;

            default:
                apiSlug = type;
        }

        return await this.getPage(urlBase, contentOwner.WP_API_PATH + "/" + apiSlug + query);

    }

    async getDocuments(contentOwner: ContentOwner) {

        return await this.getPage(contentOwner.WP_URL_DOCKER, contentOwner.WP_API_PATH  + "/documents?page=0");
    }
}
