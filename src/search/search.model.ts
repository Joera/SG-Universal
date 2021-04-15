import { Taxonomies } from "content";
import {IReport} from "../reports/report";
import logger from "../util/logger";

export class SearchModel {

    objectID: string;
    slug: string;
    type: string;
    template: string | boolean;
    renderEnvironments: string[];
    url: string;
    status: string;
    title: string;
    content: string;
    excerpt: string;
    date: string;
    sortDate: string;
    modified: string;

    author: any;
    mainImage: any;
    sections: any[];
    interaction: any;
    taxonomies: Taxonomies;
    language: any[];
    updates: any[];

    catIds: string[];
    catSlugs: string[];
    tagIds: string[];
    tagSlugs: string[];

    searchSnippet: string | boolean;

    constructor(body: any, report: IReport){


        try {

            this.objectID = String(body._id || body.id);
            this.slug = body.slug;
            this.type = body.type;
            this.renderEnvironments = body.render_environments;
            this.url = body.url; // body.link
            this.status = body.status;
            this.title = body.title.rendered || body.title;
            this.content = body.content ? this.trimContent(body.content.rendered || body.content) : "";
            this.excerpt = body.excerpt ? body.excerpt.rendered || body.excerpt : "";
            this.date = body.date;
            this.sortDate = body.sortDate || body.date;
            this.modified = body.modified;
            this.template = false;

            this.searchSnippet = false;

            switch (body.type) {

                case "post":

                    this.sections = this.filterSections(body.sections);
                    this.taxonomies = body.taxonomies;
                    this.language = body.language;
                    this.updates = body.updates || [];
                    this.template = "search-snippet";
                    this.author = body.author;

                    this.mapTaxonomies(body.taxonomies);

                    break;

                case "page":

                    this.sections = this.filterSections(body.sections);
                    this.language = body.language;
                    this.taxonomies = body.taxonomies;
                    this.template = "search-snippet";

                    this.mapTaxonomies(body.taxonomies);

                    break;

            }

        }

        catch (error) {
            report.add("error","failed at modelling " + body.slug);
        }

    }

    mapTaxonomies(taxonomies: Taxonomies) {

        this.catIds = (taxonomies && taxonomies.categories) ? taxonomies.categories.map( c => { return c.id; }) : [];
        this.catSlugs = (taxonomies && taxonomies.categories) ? taxonomies.categories.map( c => { return c.slug; }) : [];
        this.tagIds = (taxonomies && taxonomies.tags) ? taxonomies.tags.map( c => { return c.id; }) : [];
        this.tagSlugs =  (taxonomies && taxonomies.tags) ? taxonomies.tags.map( c => { return c.slug; }) : [];

    }

    filterSections(sections: any[]) {
        return Array.isArray(sections) ? sections.filter( (v: { type: string }) => { return v.type == "paragraph"; }) : [];
    }

    trimContent(content: string) {
        return (content.length > 400) ? content.substring(0,399) : content;
    }
}
