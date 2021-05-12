import {DataObject} from "content";

export const trimRelatedItems =  (dataObjects: DataObject[]): any[] => {

    for (const o of dataObjects) {
        delete o.content;
        delete o.sections;

        if(o.interaction && o.interaction.nestedComments) {
            o.interaction.nestedComments = o.interaction.nestedComments.slice(0,1);
        }
    }

    return dataObjects;
};
