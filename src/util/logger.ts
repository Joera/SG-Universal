import { createLogger, format, transports } from "winston";
import ecsFormat from "@elastic/ecs-winston-format";

const logFormat = format.printf(info => `${info.level} : ${JSON.stringify(info.message)}`);

const levelFilter = (level: string): any => {
    return format ((info: any, opts: any ): any => {
        if(info.level !== level ) { return false; }
        // info.message.payload = JSON.stringify(info.message.payload);
        return info;
    })();
};

const logger = createLogger({
    level: "error",
    exitOnError: false,
    transports: [
        new transports.Console({
            level: "debug",
            format: format.combine(
                format.colorize(),
                logFormat
            )
        }),
        new transports.File({
            filename: "./logs/error.json",
            level: "error",
            format: format.combine(
                levelFilter("error"),
                ecsFormat(),
                format.json()
            ),
            handleExceptions: true
        }),
        new transports.File({
            filename: "./logs/info.json",
            level: "info",
            format: format.combine(
                levelFilter("info"),
                ecsFormat(),
                format.json()
            ),
            handleExceptions: true
        }),
        new transports.File({
            filename: "./logs/debug.json",
            level: "debug",
            format: format.combine(
                levelFilter("debug"),
                ecsFormat(),
                format.json()
            ),
            handleExceptions: true
        }),
    ]
});



export default logger;

