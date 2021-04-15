export interface QueueItem {
    _id?: string,
    name: string | boolean, // name of the template, also directory of the template file
    template: string, // filename of template
    renderEnvironment: string;
    path: string, // path to render the template to
    data: object // template data
}

export interface MongoQuery {
    [key: string]: any;
}

export interface RippleObject {
    type: string,
    slug: string | boolean,
    path: string,
    language: string,
    renderEnvironments: string[];
}

