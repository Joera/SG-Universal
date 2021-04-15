import bluebird from "bluebird";
import mongodb from "mongodb";
import assert from "assert";
import logger from "../util/logger";
import {MONGODB_URI } from "../util/config";
import {ContentOwner} from "config";

// set database connection object
const MongoClient = mongodb.MongoClient;

// get connection to mongodb
async function getMongoConnection(dbName: string) {

        // const url = test ? MONGODB_URI_TEST : MONGODB_URI;

        // logger.debug(dbName);

        return new Promise( (resolve,reject) => {

            // logger.debug(contentOwner);

            return MongoClient.connect(MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }, function(err, client) {
                if(err) {
                    logger.info("failed to connect to mongo db");
                    reject();
                } else {
                    const database = client.db(dbName);
                    resolve(database);
                }
            });
        });
}

export function getCollection(dbName: string, collection: string) {

        return getMongoConnection(dbName).then((conn: any) => {
            return conn.collection(collection);
        }).catch((err) => {
            logger.debug('failed miserably');
        });

}
