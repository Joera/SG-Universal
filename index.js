'use strict';

//
const Promise = require('bluebird');
const logger = require('./services/logger.service');
const templateDefinitionsValidator = require('./validators/template.definition.validator');
const app = require('./config/express');
const config = require('./config');
// const templateDefinitions = require('./templates/definition');


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

// validate template definition
// templateDefinitionsValidator.validate(templateDefinitions);

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
    // listen on port appConfig.port
    app.listen(config.port, () => {
        // debug(`server started on port ${appConfig.port} (${appConfig.env})`);
        logger.info('server started on port ' + config.port + ' (' + config.env + ')');
});
}