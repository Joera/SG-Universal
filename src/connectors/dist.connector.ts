
import {RenderEnv} from "config";
import {DIST_FOLDER} from "../util/config";

import logger from "../util/logger";
import Rsync from "rsync";

export class DistConnector {

    async sync(renderEnv: RenderEnv) {

        const rsync = new Rsync();
        rsync.shell("ssh");
        rsync.flags("avz");
        rsync.set("delete");
        rsync.source(DIST_FOLDER + renderEnv.RENDER_ENVIRONMENT + "/");
        rsync.destination(renderEnv.REMOTE_HOST + ":" + renderEnv.REMOTE_PATH);

        return new Promise ((resolve,reject) => {
            try {
                let logData = "";
                rsync.execute(
                    (error, code, cmd) => {
                        resolve({error, code, cmd, data: logData});
                    },
                    (data) => {
                        logData += data;
                    },
                    (err) => {
                        logData += err;
                    }
                );
            } catch (error) {
                reject(error);
            }
        });
    }
}
