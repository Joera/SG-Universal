import winston from "winston";
import DatadogWinston from "datadog-winston";
import { APPLICATION_NAME, DATADOG_API_KEY} from "./config";


const options: winston.LoggerOptions = {
    level: "error",
    exitOnError: false,
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({
            level: process.env.NODE_ENV === "production" ? "error" : "debug"
        }),
        new winston.transports.File({
            filename: "debug.log",
            level: "debug"
        })
    ]
};

const logger = winston.createLogger(options);

// if (process.env.NODE_ENV !== "production") {
//     logger.debug("Logging initialized at debug level");
// }

// logger.add(
//     new DatadogWinston({
//         apiKey: DATADOG_API_KEY,
//         hostname: "http-intake.logs.datadoghq.com",
//         service: APPLICATION_NAME,
//         ddsource: "nodejs",
//         ddtags: "foo:bar,boo:baz",
//         intakeRegion: "eu"
//     })
// );


export default logger;

