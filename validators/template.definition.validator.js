'use strict';

/**
 * Validator for template definitions
 */
const joi = require('joi');
const Promise = require('bluebird');
const logger = require('../services/logger.service');

//
const itemsSchema = joi.object().keys({
    name: joi.string().required(),
    template: joi.string().required(),
    searchSnippetTemplate: joi.string().allow('').optional(),
    getDependencies: joi.func().required(),
    getSearchSnippetData: joi.func().required(),
    getTemplateData: joi.func().required(),
    getPath: joi.func().required(),
    getMapping: joi.func().required(),
    preRender: joi.func().required(),
    postRender: joi.func().required(),
    preDelete: joi.func().required(),
    postDelete: joi.func().required(),
});

//
const schema = joi.array().items(itemsSchema).required();


//
module.exports = {
    validate: (definitions) => {
        return new Promise((resolve, reject) => {
            const { error, value } = joi.validate(definitions, schema);
            if (error) { // if invalid
                const proxiedError = new TypeError();
                proxiedError.message = error.message;
                proxiedError.stack = error.stack;
                reject(proxiedError);
            }
            resolve(definitions);
        })
    }
};
