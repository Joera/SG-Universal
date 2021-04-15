import logger from "./logger";
import dotenv from "dotenv";
import fs from "fs";

if (fs.existsSync(".env")) {
  //  logger.info("Using .env file to supply config environment variables");
    dotenv.config({ path: ".env" });
}

export const ENV = process.env["ENV"];
export const APPLICATION_NAME = process.env["APPLICATION_NAME"];
export const PORT = process.env["PORT"];
export const DATADOG_API_KEY = process.env["DATADOG_API_KEY"];
export const CONFIG_FOLDER = process.env["CONFIG_FOLDER"];
export const DIST_FOLDER = process.env["DIST_FOLDER"];
export const TEMPLATE_FOLDER = process.env["TEMPLATE_FOLDER"];
export const MONGODB_URI = process.env["MONGODB_URI"];

// deze langzaam verwijderen
// export const RENDER_TASKS = ["searchposts","searchComments"];
// export const RENDER_TYPES = ["homepage","post","page","vacature","ambassador","vacatures","theme"];
//
