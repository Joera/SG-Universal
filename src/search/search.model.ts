import { Taxonomies } from "content";
import {IReport} from "../reports/report";
import logger from "../util/logger";
import slugify from "slugify";

export class SearchModel {

    objectID: string;
    slug: string;
    type: string;
    template: string | boolean;
    renderEnvironments: string[];
    render_environments: string[];
    url: string;
    status: string;
    title: string;
    content: string;
    excerpt: string;
    date: string | number;
    sortDate: string;
    modified: string;

    author: any;
    mainImage: any;
    sections: any[];
    interaction: any;
    taxonomies: Taxonomies;
    language: any;
    updates: any[];

    postID: string;
    replyCount: number;
    isEditor: boolean;
    comments: any[];


    catIds: string[];
    catSlugs: string[];
    tagIds: string[];
    tagSlugs: string[];

    searchSnippet: string | boolean;

    constructor(body: any, report: IReport){

        try {


            this.type = body.type;
            this.searchSnippet = false;
            this.objectID = String(body._id || body.id) || '';

            switch (body.type) {

                case "post":
                case "page":
                case "vacature":


                    this.slug = body.slug;
                    this.url = body.url; // body.link
                    this.status = body.status;
                    this.title = body.title.rendered || body.title;
                    this.content = body.content ? this.trimContent(body.content.rendered || body.content) : "";
                    this.excerpt = body.excerpt ? body.excerpt.rendered || body.excerpt : "";
                    this.date = new Date(body.date.replace("T", " ")).getTime();
                    this.sortDate = body.sortDate || body.date;
                    this.modified = body.modified;
                    this.mainImage = body.mainImage || body.main_image;
                    this.template = false;
                    this.sections = this.filterSections(body.sections);
                    this.taxonomies = body.taxonomies;
                    this.updates = body.updates || [];
                    this.template = "search-snippet";
                    this.author = body.author;
                    this.language = body.language;
                    this.renderEnvironments = body.renderEnvironments;
                    this.render_environments = body.renderEnvironments;

                    this.mapTaxonomies(body.taxonomies);

                    break;

                case "comment":


                    this.template = "comment-snippet";
                    this.objectID = String(body.comment.id);
                    this.date = new Date(body.comment.date.replace("T", " ")).getTime();
                    this.title = body.comment.content.slice(0,120).replace(/<(?:.|\n)*?>/gm, "");
                    this.slug = slugify(body.comment.content.slice(0,40).replace(/<(?:.|\n)*?>/gm, ""));
                    this.content = body.comment.content.replace(/<(?:.|\n)*?>/gm, "");
                    this.author = body.comment.name;
                    this.isEditor = this.boolean(body.comment["is_editor"]);
                    this.comments = body.thread.filter( (t: any) => { t.id != body.id; });
                    this.replyCount = body.thread.filter( (t: any) => { t.id != body.id; }).length;
                    this.postID = body._id;
                    this.url = (body.link && body.post.link !== "") ? body.link + "#dialoog" : body.post.url + "#" + body.thread[0].id;
                    this.language = body.post.language;
                    this.renderEnvironments = body.post.renderEnvironments;
                    this.render_environments = body.post.renderEnvironments;

                    break;

                case "document":

                    this.template = "document-snippet";
                    this.objectID = String(body.document.file_id);
                    this.title = body.document.file_name;
                    this.slug = slugify(body.document.file_name);
                    this.date = body.post.date;
                    this.url = body.document.file_cdn_url;
                    this.renderEnvironments = body.post.renderEnvironments;
                    this.render_environments = body.post.renderEnvironments;
                    this.language  = body.post.language;

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
        let filteredSections =  Array.isArray(sections) ? sections.filter( (v: { type: string }) => { return v.type == "paragraph"; }).slice(0,2) : [];

        for (let s of filteredSections) {
            s.text = (s.text.length > 200) ? s.text.substring(0,200) : s.text;
        }

        return filteredSections;
    }

    trimContent(content: string) {
        return (content.length > 400) ? content.substring(0,399) : content;
    }

    trimExcerpt(content: string) {
        return (content.length > 400) ? content.substring(0,399) : content;
    }

    boolean(value: any) {

        if (value === true || value === false) {
            return value;
        } else if(value === 0 || value === "0") {
            return false;
        } else if (value === 1 || value === "1") {
            return true;
        }
    }
}
