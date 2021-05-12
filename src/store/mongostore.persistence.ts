import logger from "../util/logger";
import { getCollection }  from "../connectors/mongo.connector";
import {DataObject} from "content";
import {IReport} from "../reports/report";


/**
 * Class takes care of all database operations for the page
 */
export default class MongoStorePersistence {

    async find(options: any, dbName: string, report: IReport) {

        if (typeof options.limit === "undefined") {
            options.limit = 0;
        }

        const collection = await getCollection(dbName,"page", report);// get page collection
        return await collection.find(options.query).sort(options.sort).limit(options.limit).toArray();  // execute find query
    }


    async findOne(options: any, dbName: string, report: IReport) {

        const collection = await getCollection(dbName,"page", report);
        return await collection.findOne(options.query); // execute find query
    }

    async save(data: DataObject, dbName: string, report: IReport) {

        let update: boolean;
        let result: boolean;

        try {
            const collection = await getCollection(dbName, "page", report); // get page collection
            const exists = await collection.findOne({ _id: data._id});

            if (exists !== null) {
                update = true;
                result = await collection.replaceOne({ _id: data._id},data,{ upsert : true}); // execute save
            } else {
                update = false;
                result = await collection.insertOne(data); // execute save
            }
            return { result, update };
        }

        catch (error) {
            logger.error("failed to save item to mongo");
            update = false;
            result = false;
            return { result, update };
        }
    }

    async remove(id: string, dbName: string, report: IReport) {

        try {
            const collection = await getCollection(dbName,"page", report);
            await collection.remove({"_id": id});
            logger.info("removed item from mongo");
            return true;
        }
        catch (error) {
            logger.error("failed to remove item from mongo");
            return false;
        }
    }
}
