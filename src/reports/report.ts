import {v4 as uuidV4} from "uuid";

export interface IReport {

    primaryId: string;
    processId: string;
    date: Date;
    success: string[];
    warning: string[];
    error: string[];
    queued: string[];
    rendered: string[];
    deleted: string[];
    searchIndex: string[];
    removedFromIndex: string[];
    datasets: string[];
    add: any;
}


export class Report {

    primaryId: string;
    processId: string;
    date: Date;
    success: string[];
    warning: string[];
    error: string[];
    queued: string[];
    rendered: string[];
    deleted: string[];
    searchIndex: string[];
    removedFromIndex: string[];
    datasets: string[];

    constructor(id: string){

        this.primaryId = id;
        this.processId = uuidV4();
        this.date = new Date;
        this.success = [];
        this.warning = [];
        this.error = [];
        this.queued = [];
        this.rendered = [];
        this.deleted = [];
        this.searchIndex = [];
        this.removedFromIndex = [];
        this.datasets = [];
    }

    add(property: keyof IReport,msg: string) {

        switch(property) {

            case "success":
                this.success.push(msg);
                break;
            case "warning":
                this.warning.push(msg);
                break;
            case "error":
                this.error.push(msg);
                break;
            case "queued":
                this.queued.push(msg);
                break;
            case "rendered":
                this.rendered.push(msg);
                break;
            case "deleted":
                this.deleted.push(msg);
                break;
            case "searchIndex":
                this.searchIndex.push(msg);
                break;
            case "removedFromIndex":
                this.removedFromIndex.push(msg);
                break;
            case "datasets":
                this.datasets.push(msg);
                break;
        }
    }
}

