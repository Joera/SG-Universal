import { Request, Response } from "express";
import logger from "../util/logger";
import { CustomContentModel } from "./custom-content.model";
import MongoStorePersistence from "./mongostore.persistence";
import {DataObject} from "content";
import {IReport} from "../reports/report";
import {ContentOwner} from "config";

const mongoStore = new MongoStorePersistence();


export const save = async (dataObject: DataObject, dbName: string, report: IReport) => {

    const { result, update } = await mongoStore.save(dataObject, dbName, report);

    if(result) {
        update ? report.add("success", "updated item in mongo") : report.add("success", "saved item in mongo");
    } else {
        logger.error({ payload: "failed to save item in mongo", processId : report.processId});
        report.add("error","failed to save item in mongo");
    }

    return;
};

export const remove = async (dataObject: DataObject, dbName: string, report: IReport) => {

    const result = await mongoStore.remove(dataObject._id, dbName, report);
    result ? report.add("success","removed item from mongo") : report.add("error","failed to remove item from mongo");

    return report;
};
