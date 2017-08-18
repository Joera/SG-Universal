'use strict';

const Promise = require('bluebird');
const logger = require('../services/logger.service');


/**
 * Service for authorization of the incoming api calls
 */
class AuthService {



    isAuthorized(token, correlationId) {
        const self = this;
        return new Promise((resolve, reject) => {
            // check if call is authorized
            if(token === 'rRn8zepZA4YBDccVPm5uDYhG8t:f6UjzYMTNJ7QCkpwdWAs4U9f6V') {
                logger.info('Authentication successful', correlationId);
                resolve({}); // resolve promise
            } else {
                const proxiedError = new Error(); // create new error object
                proxiedError.statusCode = 401; // add custom property statusCode to error object
                proxiedError.correlationId = correlationId; // add custom property correlationId to error object
                proxiedError.message = 'Unauthorized to make this call';
                reject(proxiedError);
            }
        })
    }



}





module.exports = AuthService;