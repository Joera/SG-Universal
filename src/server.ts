import errorHandler from "errorhandler";
import app from "./app";
import logger from "./util/logger";
import {APPLICATION_NAME, ENV} from "./util/config";

/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
const server = app.listen(app.get("port"), () => {
    logger.info(
        {
            payload: APPLICATION_NAME + " is running at http://localhost:" + app.get("port") + " in " + ENV + " mode"
        } );
});

export { server };
