import {ContentModel} from "./content.model";
import {IReport} from "../reports/report";
import {ContentOwner} from "config";
import logger from "../util/logger";
import {TEMPLATE_FOLDER} from "../util/config";

export class CustomContentModel extends ContentModel {

    custom: any;

    constructor(body: any, contentOwner: ContentOwner, report: IReport){

        super(body,report);

        const model: any = contentOwner.CUSTOM_CONTENT.find( (m) => body.type === m.type);

        if((model  !== undefined )) {

            for(const prop of model.properties) {

                let propArray: any[] = [];
                let propData = false;

                if (prop.prop.indexOf(".") > -1) {
                    propArray = prop.prop.split(".");
                }

                switch(propArray.length) {

                    case 0:
                    case 1:
                        propData = body[prop.prop];
                    break;

                    case 2:
                        propData = body[propArray[0]][propArray[1]];
                    break;

                    case 3:
                        propData = body[propArray[0]][propArray[1]][propArray[2]];
                    break;
                }

                if (prop.post && prop.post !== undefined) {

                    try {
                        const method: any = new (require(contentOwner["CUSTOM_SCRIPTS_FOLDER"] + prop.post + ".js"));

                        const response = method.init(propData || prop.alt, body);
                        // // logger.debug( {payload: JSON.stringify(response.items), processId: report.processId} );
                        if (response.items && response.dataObject) {
                            // @ts-ignore
                            this[prop.key] = response.items;
                        }
                    } catch (err) {
                        logger.error({
                            payload: "failed to process custom script: " + prop.post,
                            processId: report.processId
                        });
                    }

                } else if (prop.parseInt && prop.isArray) {
                    // @ts-ignore
                    this[prop.key] =  [parseInt(propData)] || [];

                } else if (prop.parseInt) {
                    // @ts-ignore
                    this[prop.key] =  parseInt(propData) || prop.alt;
                } else {
                    // @ts-ignore
                    this[prop.key] =  propData || prop.alt;
                }
            }
        }
    }
}
