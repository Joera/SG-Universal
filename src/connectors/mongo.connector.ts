import bluebird from "bluebird";
import mongodb from "mongodb";
import assert from "assert";
import logger from "../util/logger";
import {MONGODB_URI } from "../util/config";
import {ContentOwner} from "config";
import {IReport} from "../reports/report";

// set database connection object
const MongoClient = mongodb.MongoClient;

// get connection to mongodb
async function getMongoConnection(dbName: string, report: IReport) {

        return new Promise( (resolve,reject) => {

            return MongoClient.connect(MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }, function(err, client) {
                if(err) {
                    logger.error({ payload : "failed to connect to" + MONGODB_URI, processId : report.processId});
                    reject();
                } else {
                    const database = client.db(dbName);
                    resolve(database);
                }
            });
        });
}

export function getCollection(dbName: string, collection: string, report: IReport) {

        return getMongoConnection(dbName,report).then((conn: any) => {
            return conn.collection(collection);
        }).catch((err) => {
         //   logger.debug({ payload : "failed miserably", processId : report.processId});
        });

}
