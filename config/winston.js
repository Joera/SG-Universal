'use strict';

const path = require ('path');
const winston = require('winston'); // async logging
winston.transports.DailyRotateFile = require('winston-daily-rotate-file'); // rotate log file daily



const logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            json: true,
            timestamp: true,
            colorize: true
        }),
        new (winston.transports.DailyRotateFile)({ // log to file
            name: 'info-file',
            datePattern: '.yyyy-MM-dd',
            filename: path.join('logs', 'call.log'),
            timestamp: true,
            level: 'info'
        }),
        new (winston.transports.DailyRotateFile)({ // log to file
            name: 'error-file',
            datePattern: '.yyyy-MM-dd',
            filename: path.join('logs', 'error.log'),
            timestamp: true,
            level: 'error'
        })
    ]
});



module.exports = logger;