import {ContentModel} from "./content.model";
import {IReport} from "../reports/report";
import {ContentOwner} from "config";
import logger from "../util/logger";

export class CustomContentModel extends ContentModel {

    custom: any;

    constructor(body: any, contentOwner: ContentOwner, report: IReport){

        super(body,report);

        const model: any = contentOwner.CUSTOM_CONTENT.find( (m) => body.type === m.type);

        if((model  !== undefined )) {

            for(const prop of model.properties) {
                // @ts-ignore
                this[prop.key] = body[prop.prop] || prop.alt;
            }
        }
    }
}
