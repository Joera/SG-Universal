'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('../routes/index.route');
const logger = require('../services/logger.service');

const app = express();


app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 1000000 }));
app.use(function (error, req, res, next) { // catch bodyParser syntax error and send custom error message
    if (error instanceof SyntaxError) {
        logger.info("received invalid json");
        logger.error("received invalid json");
    } else {
        next();
    }
});

/********* DEZE HEADERS STRAKS MOGELIJK VERWIJDEREN *********/
// add headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'https://wp.eurekarail.net');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});



// enable CORS - Cross Origin Resource Sharing
app.use(cors());


// mount all routes on /api path
app.use('/api', routes);

process.on('unhandledRejection', (reason, p) => {
    logger.info('Unhandled Rejection at:', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
});

module.exports = app;
