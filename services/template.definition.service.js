'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const logger = require('../services/logger.service');
const config = require('../config');
const templateDefinitionsValidator = require('../validators/template.definition.validator');


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

            self._getDefinitions() // get all template definitions
                .then((templateDefinitions) => { return templateDefinitionsValidator.validate(templateDefinitions); }) // validate template definitions
                .then((templateDefinitions) => { // find requested definition
                    // search template definition for type
                    // data.type should match the name property of a template definition
                    let definition = _.find(templateDefinitions, (td) => { return td && td.name === templateName; });

                    if(definition) { // return template definition
                        // logger.info('Found template definition for type: ' + templateName, correlationId);
                        resolve(definition);
                    } else { // no template definition found for data.type
                        const proxiedError = new Error();
                        proxiedError.correlationId = correlationId;
                        proxiedError.message = 'No templates definition found for page type: ' + templateName;
                        reject(proxiedError);
                    }
                });
        })
    }


    /**
     * Get the template definitions
     * Search the templates directory and assume all directories that do not start with _ are templates
     * Return array with all template definitions
     * @private
     */
    _getDefinitions() {
        const self = this;
        return new Promise((resolve, reject) => {
            const templateDir = './pages/templates';
            const dirs = fs.readdirSync(templateDir).filter((f) => fs.statSync(path.join(templateDir, f)).isDirectory() && f.charAt(0) !== '_'); // get all directories that don;t start with _

            // create definitions array
            // find definitions file and template file in templates directories
            const definitions = dirs.map((name) => {
                const definitionFile = fs.readdirSync(templateDir + '/' + name).filter((file) => { return file.indexOf('definition.js') !== -1 })[0]; // get filename of definitions file
                const templateFile = fs.readdirSync(templateDir + '/' + name).filter((file) => { return file.indexOf('.handlebars') !== -1 })[0]; // get file name of handlebars template file
                let definition = null; // define definition that will be returned

                // get definitions from file
                if(definitionFile) { // check if definition file is found
                    definition = require('.' + templateDir + '/' + name + '/' + definitionFile); // get definitions file content
                }

                // set definitions
                // set the template name based on directory name and template file name that is found in the template directory
                // also set default definition values for the ones that are not supplied
                // if(templateFile) { // check if template is found
                    // default definition values
                    const defaultDefinition = {
                        name: null,
                        template: null,
                        searchSnippetTemplate: '', // filename of the handlebars template
                        getSearchSnippetData: (data, correlationId) => { return new Promise((resolve, reject) => { resolve(data); }) },
                        getTemplateData: (data, correlationId) => { return new Promise((resolve, reject) => { resolve(data); }) },
                        getPath: (data, correlationId) => { return new Promise((resolve, reject) => { resolve(''); }) },
                        getDependencies: (data, correlationId) => { return new Promise((resolve, reject) => { resolve(data); }) },
                        getMapping: (data, correlationId) => { return new Promise((resolve, reject) => { resolve(data); }) },
                        preRender: (data, correlationId) => { return new Promise((resolve, reject) => { resolve(data); }) },
                        postRender: (data, correlationId) => { return new Promise((resolve, reject) => { resolve(data); }) },
                        preDelete: (data, correlationId) => { return new Promise((resolve, reject) => { resolve(data); }) },
                        postDelete: (data, correlationId) => { return new Promise((resolve, reject) => { resolve(data); }) }
                    };

                    //
                    if(!definition) { definition = {}; } // make sure definition is an object if no definition file is supplied
                    definition.name = name; // set template definition name. Template definition name is always the same as the directory name
                    definition.template = templateFile; // set template file name
                    definition = _.merge(defaultDefinition, definition); // set default values of definition if not supplied
                // }
                return definition;
            }).filter((d) => { return d !== null }); // filter out null values, null means template file or definitions file is not found
            resolve(definitions);
        })
    }




}

module.exports = TemplateDefinitionService;
