import {IReport} from "../reports/report";
import {DataObject} from "content";
import {CustomSearchModel} from "./custom-search.model";
import SearchService from "./search.service";
import logger from "../util/logger";
import {ContentOwner, RenderEnv} from "config";

const search = new SearchService();

export class SearchController {

    async updatePost(dataObject: DataObject, contentOwner: ContentOwner, renderEnv: RenderEnv, report: IReport) {

        const searchObject = new CustomSearchModel(dataObject, contentOwner, report);
        searchObject.searchSnippet = await search.createSnippet(searchObject, renderEnv, report);
        // if no template has been assigned in search.model .. the item will not be send to index
        if(searchObject.searchSnippet) {

            await search.updateIndex(searchObject, renderEnv, report);


        }
        return;
    }

    async removePost(dataObject: DataObject, contentOwner: ContentOwner, renderEnvironments: RenderEnv[], report: IReport) {

        const renderEnvironment = renderEnvironments.find( (env) => env.RENDER_ENVIRONMENT );

        const searchObject = new CustomSearchModel(dataObject, contentOwner, report);
        await search.purgeIndex(searchObject, renderEnvironment, report);
    }


}
