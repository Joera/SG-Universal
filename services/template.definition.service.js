'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const logger = require('../services/logger.service');
const config = require('../config');
const templateDefinitions = require('../templates/definition');


/**
 *
 */
class TemplateDefinitionService {


    /**
     * Find the template definition by matching type property in data to temlpate name
     * @param data
     * @param correlationId
     */
    getDefinition(data, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {
            // search template definition for type
            // data.type should match the name property of a template definition
            let definition = _.find(templateDefinitions.templates, (td) => { return td.name === data.type; });

            if(definition) { // return template definition
                logger.info('Found template definition for type: ' + data.type, correlationId);
                resolve(definition);
            } else { // no template definition found for data.type
                const proxiedError = new Error();
                proxiedError.correlationId = correlationId;
                proxiedError.message = 'No templates definition found for page type: ' + data.type;
                reject(proxiedError);
            }
        })
    }




}

module.exports = TemplateDefinitionService;