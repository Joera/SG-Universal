import moment from "moment";
import {isObject} from "util";

export const helpers =  [{
        name: "ifEquals",
        helper: (a: string, b: string, options: any) => {
            if (a === b) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        }
    },
    {
        name: "ifCond",
        helper: (v1: string, operator: string, v2: string, options: any) => {
            switch (operator) {
                case "==":
                    return (v1 == v2) ? options.fn(this) : options.inverse(this);
                case "===":
                    return (v1 === v2) ? options.fn(this) : options.inverse(this);
                case "!=":
                    return (v1 != v2) ? options.fn(this) : options.inverse(this);
                case "!==":
                    return (v1 !== v2) ? options.fn(this) : options.inverse(this);
                case "<":
                    return (v1 < v2) ? options.fn(this) : options.inverse(this);
                case "<=":
                    return (v1 <= v2) ? options.fn(this) : options.inverse(this);
                case ">":
                    return (v1 > v2) ? options.fn(this) : options.inverse(this);
                case ">=":
                    return (v1 >= v2) ? options.fn(this) : options.inverse(this);
                case "&&":
                    return (v1 && v2) ? options.fn(this) : options.inverse(this);
                case "||":
                    return (v1 !== null || v2 !== null) ? options.fn(this) : options.inverse(this);
                default:
                    return options.inverse(this);
            }
        }
    },
    {
        name: "isUndefined",
        helper: (value: string, options: any) => {
            if (typeof value === "undefined") {
                options.inverse(this);
            } else {
                options.fn(this);
            }
        }
    },
    {
        name: "or",
        helper: (first: string, second: string) => {
            return first || second;
        }
    },
    {
        name: "ifIn",
        helper: (elem: string, list: string[], options: any) => {
            if (list.indexOf(elem) > -1) {
                return options.fn(this);
            }
            return options.inverse(this);
        }
    },
    {
        name: "unlessIn",
        helper: (elem: string, list: string[], options: any) => {
            if (list.indexOf(elem) > -1) {
                return options.inverse(this);
            }
            return options.fn(this);
        }
    },
    {
        name: "limit",
        helper: (arr: any[], limit: number) => {
            if (arr && arr.constructor === Array) {
                return arr.slice(0, limit);
            } else {
                return;
            }
        }
    },
    {
        name: "ifMoreThan",
        helper: (a: string, b: number, options: any) => {
            if (parseInt(a) > b) {
                return options.fn(this);
            } else {
                return options.inverse(this);
            }
        }
    },
    {
        name: "stripHTML",
        helper: (content: string) => {
            if (content !== null && content !== undefined) {
                const strippedFromHtml = content.toString().replace(/(&nbsp;|<([^>]+)>)/ig, "");
                return strippedFromHtml;
            } else {
                return "";
            }
        }
    },
    {
        name: "stripFromHashTags",
        helper: (content: string) => {
            if (content !== null && content !== undefined) {
                const strippedFromHashTags = content.replace(/^(\s*#\w+\s*)+$/gm, "");
                return strippedFromHashTags;
            } else {
                return "";
            }
        }
    },
    {
        name: "explode",
        helper: (array: any[]) => {
            if (array && array.length > 0) {
                const mappedArray = array.map(object => {
                    return object.slug;
                });
                return mappedArray.join(" ");
            } else {
                return "";
            }
        }
    },
    {
        name: "lowercase",
        helper: (words: string) => {
            if (words !== undefined && words !== null && typeof words !== "object") {
                return words.toLowerCase();
            } else {
                return "";
            }
        }
    },
    {
        name: "sluggify",
        helper: (words: string) => {
            if (words !== undefined && words !== null && typeof words !== "object") {
                return words.toLowerCase().replace(/[^a-zA-Z ]/g, "").trim().split(" ").join("-");
            } else {
                return "fout in naam";
            }
        }
    },
    {
        name: "anchorify",
        helper: (words: string) => {
            if (words !== undefined && words !== null && typeof words !== "object") {
                return words.toString().replace(/(&nbsp;|<([^>]+)>)/ig, "").toLowerCase().replace(/[^a-zA-Z ]/g, "").trim().split(" ").slice(0, 3).join("-");
            } else {
                return "fout-in-anchor";
            }
        }
    },
    {
        name: "index_of",
        helper: (context: any[], index: number) => {
            return context[index];
        }
    },
    {
        name: "log",
        helper: (data: string) => {
            return "<script>console.log(" + data + ");</script>";
            // return '<script></script>';
        }
    },
    {
        name: "json",
        helper: (context: string) => {
            return JSON.stringify(context);
        }
    },
    {
        name: "concat",
        helper: (string1: string, string2: string) => {
            return string1 + string2;
        }
    },
    {
        name: "noObject",
        helper: (content: any) => {

            return (content instanceof Object) ? "" : content;
        }
    }
];

