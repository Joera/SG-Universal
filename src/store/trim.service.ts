import {DataObject} from "content";

export const trimRelatedItems =  (dataObjects: DataObject[]) : any[] => {

    for (let o of dataObjects) {
        delete o.content;
        delete o.sections;

        if(o.interaction && o.interaction.nested_comments) {
            o.interaction.nested_comments = o.interaction.nested_comments.slice(0,1);
        }
    }

    return dataObjects;
}
