'use strict';

let express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    routes = require('../routes/index.route');


//
const app = express();


// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(function (error, req, res, next) { // catch bodyParser syntax error and send custom error message
//     if (error instanceof SyntaxError) {
//         res.status(400).send("Invalid json");
//     } else {
//         next();
//     }
// });


/********* DEZE HEADERS STRAKS MOGELIJK VERWIJDEREN *********/
// add headers
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

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



module.exports = app;
