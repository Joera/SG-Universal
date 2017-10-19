'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const fs = require('fs')
const path = require('path')
const logger = require('../services/logger.service');
const config = require('../config');
// const templateDefinitions = require('../templates/definition');


/**
 *
 */
class TemplateDefinitionService {


    /**
     * Find the template definition
     * @param templateName                      name of the template to search for
     * @param correlationId
     */
    getDefinition(templateName, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {
            // logger.info('Get template definition: ' + templateName, correlationId);

            const templateDefinitions = self._getDefinitions();

            // search template definition for type
            // data.type should match the name property of a template definition
            let definition = _.find(templateDefinitions, (td) => { return td && td.name === templateName; });
            // let definition = _.find(templateDefinitions.templates, (td) => { return td.name === templateName; });

            if(definition) { // return template definition
                // logger.info('Found template definition for type: ' + data.type, correlationId);
                resolve(definition);
            } else { // no template definition found for data.type
                const proxiedError = new Error();
                proxiedError.correlationId = correlationId;
                proxiedError.message = 'No templates definition found for page type: ' + templateName;
                reject(proxiedError);
            }
        })
    }


    /**
     * Get the template definitions
     * Search the templates directory and assume all directories that do not start with _ are templates
     * @private
     */
    _getDefinitions() {
        const templateDir = './pages/templates';
        const dirs = fs.readdirSync(templateDir).filter((f) => fs.statSync(path.join(templateDir, f)).isDirectory() && f.charAt(0) !== '_'); // get all directories that don;t start with _

        // create definitions array
        // find definitions file and template file in templates directories
        const definitions = dirs.map((name) => {
            const definitionFile = fs.readdirSync(templateDir + '/' + name).filter((file) => { return file.indexOf('definition.js') !== -1 })[0]; // get filename of definitions file
            const templateFile = fs.readdirSync(templateDir + '/' + name).filter((file) => { return file.indexOf('.handlebars') !== -1 })[0]; // get file name of handlebars template file
            let definition = null; // define definition that will be returned
            if(definitionFile && templateFile) { // check if definition file and template are found
                definition = require('.' + templateDir + '/' + name + '/' + definitionFile); // get definitions file
                definition.name = name; // set template definition name. Template definition name is always the same as the directory name
                definition.template = templateFile; // set template file name
            }
            return definition;
        }).filter((d) => { return d !== null }); // filter out null values, null means template file or definitions file is not found
        return definitions;
    }




}

module.exports = TemplateDefinitionService;