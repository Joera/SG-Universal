// @ts-ignore

import request from "supertest";
import app from "../src/app";
import axios from "axios";
import {PREVIEW_AUTH_KEY, WP_API_PATH, WP_URL_BROWSER} from "../src/util/config";
import logger from "../src/util/logger";
import MongoStorePersistence from "../src/store/mongostore.persistence";
import CMSConnector from "../src/connectors/cms.connector";

// test is lokaal .. dus niet via docker dev_net
const wpApi = request(WP_URL_BROWSER);
const mongoStore = new MongoStorePersistence();
const cms = new CMSConnector();


describe("preview", () => {
    it("preview should return html", (done) => {
        expect.assertions(4);
        return wpApi.get(WP_API_PATH + "/posts?per_page=1")
            .end((err, res) => {

                const pages = JSON.parse(res.text);
                console.log(pages[0].id);
                return wpApi.get("/wp-content/plugins/wph-core/preview/preview.php?id=" + pages[0].id + "&key=" + PREVIEW_AUTH_KEY)
                    .end((err, res) => {
                        expect(res.status).toBe(200);
                        expect(res.text).not.toBe("Not available");
                        expect(res.text).toContain("</html>");
                        expect(res.text).toContain(pages[0].title.rendered.toLowerCase());
                        done();
                    });
            });
    });
});
