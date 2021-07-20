
import fs from "fs";
import algoliasearch from "algoliasearch";
import logger  from "../util/logger";

const ALGOLIA_APP_ID = "RLZJT7BFZT";
const ALGOLIA_INDEX_NAME_PREFIX = "AVL-archief";
const ALGOLIA_API_KEY = "f0dc506dd42b55db93e55d28c3e667b5";

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
const index = client.initIndex(ALGOLIA_INDEX_NAME_PREFIX);

let hits: any[] = [];

index
    .browseObjects({
        batch: (objects) => (hits = hits.concat(objects)),
    })
    .then(() => {
        fs.writeFile(
            "/opt/index_" + ALGOLIA_INDEX_NAME_PREFIX + ".json",
            JSON.stringify(hits, null, 2),
            "utf-8",
            (err) => {
                if (err) throw err;
                logger.info("Your index was successfully exported!");
            }
        );
    });
