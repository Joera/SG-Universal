'use strict';

const Promise = require('bluebird');
const fs = require('graceful-fs');
const minify = require('html-minifier').minify;
const handlebars = require('handlebars');
const logger = require('../services/logger.service');
const handlebarsHelpers = require('../pages/templates/handlebars-helpers');
const config = require('../config');


/**
 * Service for rendering handlebars templates
 */
class TemplateService {

    /**
     * Register handle bars helper functions
     * @param correlationId             id for correlation through the process chain
     * @private
     */
    _registerHelpers(correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {

            // register all helpers
            if(handlebarsHelpers) {
                handlebarsHelpers.forEach((helper) => {
                    try {
                        handlebars.registerHelper(helper.name, helper.helper); // register helper
                    }
                    catch (error) {
                        reject(error);
                    }
                });
            }

            // logger.info('Registered helpers', correlationId);
            resolve({});
        })
    }


    /**
     * Register handlebars helpers
     * @param correlationId             id for correlation through the process chain
     * @private
     */
    _registerPartials(correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {
            // set _partials directory
            let dirname = config.root + '/pages/templates/_partials/*';
            
            // read partial directory
            fs.readdir(dirname, (error, filenames) => {
                if (error) {
                    reject(error);
                }

                if (filenames && filenames.length > 0) {
                    // read the files in the partial directory
                    filenames.forEach((filename) => {
                        fs.readFile(dirname + '/' + filename, 'utf-8', (error, source) => {
                            if (error) {
                                reject(error);
                            }

                            // set partial name as filename without the .handlebars extention
                            let partialName = filename.split('.')[0];

                            // register _partials
                            try {
                                handlebars.registerPartial(partialName, source); //
                                // logger.info('Registered _partials', correlationId);
                                resolve({}); // resolve promise
                            }
                            catch (error) {
                                reject(error);
                            }
                        });
                    });
                } else {
                    resolve({}); // resolve promise
                }
            });

        })
    }


    /**
     * Render template
     * @param templateName              name of the template, also directory of the template
     * @param templateFileName          name of the handlebars temlpate file, assume it is in the temlpates root folder
     * @param data                      template data
     * @param correlationId             id for correlation through the process chain
     * @private
     */
    _renderTemplate(templateName, templateFileName, data, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {
            // set directory
            const dirname = config.root + '/pages/templates';

            // read template
            fs.readFile(dirname + '/' + templateName + '/' + templateFileName, 'utf-8', (error, source) => {
                if (error) {
                    reject(error);
                }

                // set template data object
                const templateData = {
                    body: data,
                    baseUrl: config.baseUrl,
                    wordpressUrl: config.wordpressUrl
                };

                // render the template
                try {
                    const template = handlebars.compile(source);
                    const html = template(templateData);
                 //   logger.info('Render template: ' + templateName, correlationId);
                    resolve(html); // resolve promise
                }
                catch (error) { // error rendering template
                    reject(error);
                }
            });
        })
    }


    /**
     * Minify rendered html
     * @param html                      Rendered temlpate
     * @param correlationId
     * @private
     */
    _minifyRenderedTemplate(html, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {

            // render the template
            try {
                // minify html
                // see option paramaters for minification at: https://www.npmjs.com/package/html-minifier
                html = minify(html, {
                    removeAttributeQuotes: true,
                    removeTagWhitespace: true,
                    removeComments: true,
                    collapseWhitespace: true
                });

                // logger.info('Minify template html');
                resolve(html); // resolve promise
            }
            catch (error) { // error rendering template
                reject(error);
            }
        })
    }


    /**
     * Render controller function
     * @param name                      name of the template, also the directory of the template file
     * @param template                  name of the handlebars template file
     * @param data                      template data
     * @param correlationId             id for correlation through the process chain
     */
    render(name, template, data, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {
            self._registerHelpers(correlationId) // register helper functions
                .then(() => { return self._registerPartials(correlationId) }) // register _partials
                .then(() => { return self._renderTemplate(name, template, data, correlationId) }) // render the template
                .then((html) => { return self._minifyRenderedTemplate(html, correlationId) }) // minify the rendered template html
                .then((html) => {
                    resolve(html)
                })
                .catch(error => {
                    error.correlationId = correlationId;
                    reject(error);
                });
        })
    }


}

module.exports = TemplateService;
