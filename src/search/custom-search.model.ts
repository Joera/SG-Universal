import {IReport} from "../reports/report";
import {SearchModel} from "./search.model";
import {ContentOwner} from "config";

export class CustomSearchModel extends SearchModel {

    custom: any;

    constructor(body: any, contentOwner: ContentOwner, report: IReport){

        super(body,report);

        const model: any = contentOwner.CUSTOM_SEARCH_CONTENT.find( (m) => body.type === m.type);

        if((model  !== undefined )) {

            for(const prop of model.properties) {
                // @ts-ignore
                this[prop.key] = (prop.value) ? prop.value : body[prop.prop] || prop.alt;
            }
        }
    }
}
