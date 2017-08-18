'use strict';

//
let mongoose = require('mongoose'),
    Q = require('q'),
    logger = require('./config/winston'),
    app = require('./config/express'),
    appConfig = require('./config/env');


/**
 * Set string replace all prototype
 * @param search
 * @param replacement
 * @returns {string}
 */
String.prototype.replaceAll = function (search, replacement) {
    let target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};


// plugin Q promise in mongoose
mongoose.Promise = Q.Promise;


// connect to mongo db
mongoose.connect(appConfig.db, {server: {socketOptions: {keepAlive: 1}}});
mongoose.connection.on('error', () => {
    throw new Error(`unable to connect to database: ${appConfig.db}`);
});


// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
    // listen on port appConfig.port
    app.listen(appConfig.port, () => {
        // debug(`server started on port ${appConfig.port} (${appConfig.env})`);
        logger.info('server started on port ' + appConfig.port + ' (' + appConfig.env + ')');
});
}