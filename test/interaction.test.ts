// @ts-ignore
import request from "supertest";
import app from "../src/app";
import axios from "axios";

import logger from "../src/util/logger";
import MongoStorePersistence from "../src/store/mongostore.persistence";
import CMSConnector from "../src/connectors/cms.connector";

import { configServiceForBulk } from "../src/util/config.service"

// test is lokaal .. dus niet via docker dev_net
const wpApi = request(WP_URL_BROWSER + WP_API_PATH);

const mongoStore = new MongoStorePersistence();
const cms = new CMSConnector();

// submit comment

const author = "testauthor";
const email = "test@joeramulders.com";
const content = "testje";
const commentParent = "null";

async () => {

    const {contentOwner, renderEnvironments}: any = await configServiceForBulk


    describe("post comment", () => {
        it("submit comment should return 200 status", (done) => {
            expect.assertions(1);
            return wpApi.get("/posts?per_page=1")
                .end((err, res) => {
                    const pages = JSON.parse(res.text);
                    return wpApi.post("/submit_comment?post_id=" + pages[0].id + "&name=" + encodeURIComponent(author) + "&email=" + email + "&message=" + encodeURIComponent(content) + "&comment_parent=" + commentParent)
                        .end((err, res) => {
                            expect(res.status).toBe(200);
                            done();
                        });
                });
        });
    });

    const subscriber = {
        name: "-",
        email: "test@joeramulders.com",
        subscriptions: ["notifications_heerlen_landgraaf"]
    };

    const token = "5ff6eead5761f5ff6eead576215ff6eead57622";

    describe("subscribe to mails", () => {
        it("submit subscription should return 200 status", (done) => {
            expect.assertions(2);
            return wpApi.post("/subscriber/")
                .send(subscriber)
                .end((err, res) => {
                    const result = JSON.parse(res.text);
                    expect(res.status).toBe(200);
                    expect(result.message).toMatch(/(This email is already subscribed|Your subscription has been submitted)/i);
                    done();
                });
        });
    });

    describe("update subscription", () => {
        it("should return 200 status", (done) => {
            expect.assertions(2);
            return wpApi.post("/subscriber/")
                .send(subscriber)
                .end((err, res) => {
                    const result = JSON.parse(res.text);
                    expect(res.status).toBe(200);
                    expect(result.message).toBe("This email is already subscribed");
                    done();
                });
        });
    });

    describe("get subscription", () => {
        it("should return object", (done) => {
            expect.assertions(3);
            return wpApi.get("/subscriber?newsletter-token=" + token)
                .end((err, res) => {
                    expect(res.status).toBe(200);
                    const result = JSON.parse(res.text);
                    expect(result.info.email).toBe(subscriber.email);
                    expect(result.subscriptions).toStrictEqual(subscriber.subscriptions);
                    done();
                });
        });
    });

    describe("unsubscribe from mails", () => {
        it("should return positive message", (done) => {
            expect.assertions(2);
            return wpApi.delete("/subscriber?newsletter-token=" + token)
                .end((err, res) => {
                    expect(res.status).toBe(200);
                    const result = JSON.parse(res.text);
                    expect(result.message).toBe("All your data have been deleted");
                    done();
                });
        });
    });
}
