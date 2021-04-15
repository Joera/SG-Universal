import express from "express";
import logger from "./util/logger";
import compression from "compression";  // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import lusca from "lusca";
import flash from "express-flash";
import passport from "passport";
import * as mainController from "./main.controller";
import { PORT } from "./util/config";

// Create Express server
const app = express();

// Express configuration
app.set("port", PORT || 3713);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(session({
//     resave: true,
//     saveUninitialized: true,
//     secret: SESSION_SECRET,
//     store: new MongoStore({
//         url: mongoUrl,
//         autoReconnect: true
//     })
// }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.post("/api/preview", mainController.preview);
app.post("/api/content", mainController.create);
app.delete("/api/content", mainController.remove);


export default app;
