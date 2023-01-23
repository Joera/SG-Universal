import { Taxonomies } from "content";
import {IReport} from "../reports/report";
import logger from "../util/logger";

export class ContentModel {

    _id: string;
    slug: string;
    type: string;
    depth: number;
    template: string;
    renderEnvironments: string[];
    url: string;
    status: string;
    title: string;
    content: string;
    excerpt: string;
    date: string;
    sortDate: string;
    modified: string;
    contentOwner: string;

    // post
    author: any;
    mainImage: any;
    sections: any[];
    interaction: any;
    taxonomies: Taxonomies;
    language: string;
    parent: number;
    featuredItem: string;
    updates: any[];

    catIds: number[];
    catSlugs: string[];
    tagIds: number[];
    tagSlugs: string[];

    constructor(body: any, report: IReport){

        try {

            this._id = String(body.id);
            this.slug = body.slug;
            this.type = body.type;
            this.template = body.template || body.type;
            this.renderEnvironments = body.renderEnvironments || body["render_environments"];
            this.url = body.relativePath || body.link;
            this.status = body.status;
            this.title = body.title.rendered || body.title;
            this.content = body.content ? body.content.rendered || body.content : "";
            this.excerpt = body.excerpt ? body.excerpt.rendered || body.excerpt : "";
            this.date = body.date;
            this.sortDate = body["sort_date"] || body.date;
            this.modified = body.modified;
            this.language = body.language;
            this.contentOwner = body.contentOwner;

            this.depth = (parseInt(body.parent) > 0) ? 1 : 0;

            switch (body.type) {

                case "post":

                    this.author = body.author;
                    this.mainImage = body.main_image;
                    this.sections = (body.sections !== null) ? body.sections : [];
                    this.interaction = body.interaction;
                    this.taxonomies = body.taxonomies;
                    this.featuredItem = body.featured_item || false;
                    this.updates = body.updates || [];

                    this.mapTaxonomies(body.taxonomies);

                    break;

                case "page":

                    this.mainImage = body.main_image;
                    this.sections = (body.sections !== null) ? body.sections : [];
                    this.interaction = body.interaction;
                    this.taxonomies = body.taxonomies;
                    this.parent = parseInt(body.parent);
                    this.mapTaxonomies(body.taxonomies);
                    break;
            }
        }

        catch (error) {
            report.add("error","failed at modelling " + body.slug);
        }
    }

    mapTaxonomies(taxonomies: Taxonomies) {

        this.catIds = (taxonomies && taxonomies.categories) ? taxonomies.categories.map( c => { return parseInt(c.id); }) : [];
        this.catSlugs = (taxonomies && taxonomies.categories) ? taxonomies.categories.map( c => { return c.slug; }) : [];
        this.tagIds = (taxonomies && taxonomies.tags) ? taxonomies.tags.map( c => { return parseInt(c.id); }) : [];
        this.tagSlugs =  (taxonomies && taxonomies.tags) ? taxonomies.tags.map( c => { return c.slug; }) : [];

    }
}
