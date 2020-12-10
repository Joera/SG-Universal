import logger from "./logger";
import dotenv from "dotenv";
import fs from "fs";

if (fs.existsSync(".env")) {
    logger.debug("Using .env file to supply config environment variables");
    dotenv.config({ path: ".env" });
}

export const SESSION_SECRET = process.env["SESSION_SECRET"];

export const DIST_FOLDER = process.env["DIST_FOLDER"];
export const TEMPLATE_FOLDER = process.env["TEMPLATE_FOLDER"];
export const MONGODB_URI = process.env["MONGODB_URI"];
export const PORT = process.env["PORT"];
export const WP_URL = process.env["WP_URL"];
export const WP_API_PATH = process.env["WP_API_PATH"];
export const WP_DB_HOST = process.env["WP_DB_HOST"];
export const WP_DB_NAME = process.env["WP_DB_NAME"];
export const WP_DB_USER = process.env["WP_DB_USER"];
export const WP_DB_PASSWORD = process.env["WP_DB_PASSWORD"];
export const ALGOLIA_INDEX_NAME_PREFIX = process.env["ALGOLIA_INDEX_NAME_PREFIX"];
export const ALGOLIA_APP_ID = process.env["ALGOLIA_APP_ID"];
export const ALGOLIA_API_KEY = process.env["ALGOLIA_API_KEY"];
export const BASE_URL = process.env["BASE_URL"];
export const TEMPLATE_NAME_KEY = process.env["TEMPLATE_NAME_KEY"];
export const RENDER_TASKS = process.env["RENDER_TASKS"].split(" ") || [];
export const RENDER_TYPES = process.env["RENDER_TYPES"].split(" ") || [];
export const RENDER_ENIVRONMENTS = process.env["RENDER_ENIVRONMENTS"].split(" ") || [];