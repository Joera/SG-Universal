// @ts-ignore

import request from "supertest";
import app from "../src/app";
import axios from "axios";

import logger from "../src/util/logger";
import MongoStorePersistence from "../src/store/mongostore.persistence";
import CMSConnector from "../src/connectors/cms.connector";

// test is lokaal .. dus niet via docker dev_net
const wpApi = request('http://localhost:8000/wp-json/wp/v2');
const mongoStore = new MongoStorePersistence();
const cms = new CMSConnector();

// preview posts

// remove latest 3 items for araay [post-types]

// publish latest 3 posts for araay [post-types]

const types = ["posts"];


for (const type of types) {

    describe("publish latest 3 " + type, () => {
        it("should return report with success notifications", (done) => {
            expect.assertions((3 * 1));
            return wpApi.get("/" + type + "?per_page=3")
                .end(async (err, res) => {
                    for (const page of JSON.parse(res.text)) {
                      //  console.log(page.title)
                        const result = await request(app).post("/api/content?test=true").send(page).set("Accept", "application/json");
                        expect(result.status).toBe(201);
                        // const report = JSON.parse(result.text);
                        // logger.debug(report);
                        // // @ts-ignore
                        // expect(report.success).toIncludeAnyMembers(["updated item in mongo", "saved item in mongo"]);
                        // expect(report.queued.length).toBeGreaterThan(0);
                        // expect(report.rendered.length).toBeGreaterThan(0);
                        // expect(report.searchIndex.length).toBeGreaterThan(0);
                        // expect(report.warning.length).toBeLessThan(1);
                        // expect(report.error.length).toBeLessThan(1);

                    }
                    done();
                });
        });
    });

    // describe("remove latest 3 " + type, () => {
    //     it("should return report with success notifications", (done) => {
    //         expect.assertions(15);
    //         return wpApi.get("/" + type + "?per_page=3")
    //             .end(async (err, res) => {
    //                 for (const page of JSON.parse(res.text)) {
    //                     const result = await request(app).delete("/api/content?test=true").send(page).set("Accept", "application/json");
    //                     expect(result.status).toBe(201);
    //                     const report = JSON.parse(result.text);
    //                     expect(report.success).toContain("removed item from mongo");
    //                     expect(report.removedFromIndex.length).toBeGreaterThan(0);
    //                     expect(report.warning.length).toBeLessThan(1);
    //                     expect(report.error.length).toBeLessThan(1);
    //                 }
    //                 done();
    //             });
    //     });
    // });

}


