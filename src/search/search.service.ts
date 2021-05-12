import logger from "../util/logger";
import {DataObject} from "content";
import {IReport} from "../reports/report";
import { TemplateController } from "../html-template/template.controller";
import AlgoliaConnector from "../connectors/algolia.connector";
import {RenderEnv} from "config";

const templates = new TemplateController();
const algolia = new AlgoliaConnector();

export default class SearchService {

    async createSnippet(searchObject: DataObject, renderEnvironment: RenderEnv, report: IReport): Promise<string|boolean> {

        logger.debug({ payload : searchObject});

        if (searchObject.template && searchObject.template !== "") {



            return await templates.render("search-snippet",  searchObject.template, searchObject, renderEnvironment, report);
        }  else {
            return false;
        }
    }

    async updateIndex(searchObject: DataObject, renderEnv: RenderEnv, report: IReport) {

        if(searchObject.searchSnippet && searchObject.searchSnippet !== "") {

            try {
                const algoliaResponse = await algolia.addPage(searchObject,renderEnv);
                if(algoliaResponse) {
                    logger.info({ payload : "searchIndex updated for " + searchObject.slug, processId: report.processId });
                    report.add("searchIndex", searchObject.type + ": " + searchObject.slug);
                } else {
                    report.add("error", "failed to update searchIndex for " + searchObject.slug);
                }
            }
            catch(error) {
                logger.error({ payload: error, processId: report.processId });
            }
        }
        return false;
    }

    async purgeIndex(searchObject: DataObject, renderEnv: RenderEnv, report: IReport) {

        try {
            const algoliaResponse = await algolia.deletePage(searchObject.objectID,renderEnv);
            if(algoliaResponse) {
                logger.info({ payload : searchObject.slug + " is removed from searchIndex", processId: report.processId });
                report.add("removedFromIndex", searchObject.type + ": " + searchObject.slug);
            } else {
                report.add("error", "failed to purge searchIndex for " + searchObject.slug);
            }
        }
        catch(error) {
            logger.error({ payload: error, processId: report.processId });
        }
    }
}
