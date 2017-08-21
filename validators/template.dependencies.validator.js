'use strict';

/**
 * Validator for template dependencies
 */
const joi = require('joi');
const Promise = require('bluebird');
const logger = require('../services/logger.service');


//
const dependencySchema = joi.object().keys({
    template: joi.string().required(),
    data: joi.any().required()
});

//
const schema = joi.array().items(dependencySchema).required();

//
module.exports = {
    validate: (dependencies) => {
        return new Promise((resolve, reject) => {
            const { error, value } = joi.validate(dependencies, schema);
            if (error) { // if invalid
                const proxiedError = new TypeError();
                proxiedError.message = error.message;
                proxiedError.stack = error.stack;
                reject(proxiedError);
            }
            resolve(dependencies);
        })
    }
};

