import {DataObject} from "content";

const isString = (prop: any)  => {
    return (typeof prop  === 'string' || prop  instanceof String) ? true : false;
}

const isPositiveInteger = (n: any) => {
    return n >>> 0 === parseFloat(n);
}

export const parseQuery =  (query: string, dataObject: DataObject) : any => {

    let queryObject: any = {};

    for (let q of query) {

        if (isString(Object.values(q)[0])) {

            queryObject[Object.keys(q)[0]] = Object.values(q)[0];

        } else if (typeof Object.values(q)[0] === 'object' || Object.values(q)[0] !== null) {


            let o: any = {};
            // @ts-ignore
            if (Object.values(q)[0].operator && isString(Object.values(q)[0].property)) {
                // @ts-ignore
                o[Object.values(q)[0].operator] = dataObject[Object.values(q)[0].property];
                // @ts-ignore
            } else if (Object.values(q)[0].operator && Object.values(q)[0].value) {
                // @ts-ignore
                o[Object.values(q)[0].operator] = Object.values(q)[0].value;
                // @ts-ignore
            } else if (Array.isArray(Object.values(q)[0].property)) {
                // @ts-ignore
                let val = dataObject[Object.values(q)[0].property[0]][Object.values(q)[0].property[1]];
                // @ts-ignore
                if (Object.values(q)[0].parseInt) {
                    val = parseInt(val);
                }
                // @ts-ignore
                if (Object.values(q)[0].operator === "$in" && !Array.isArray(val)) {
                    val = [val];
                }
                // @ts-ignore
                o[Object.values(q)[0].operator] = val;

                // @ts-ignore
            } else if (isString(Object.values(q)[0].property)) {
                // @ts-ignore
                o = dataObject[Object.values(q)[0].property];
            }

            queryObject[Object.keys(q)[0]] = o;
        }

    }

    return queryObject;
}
