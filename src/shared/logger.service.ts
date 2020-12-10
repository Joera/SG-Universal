"use strict";

const logger = {

    info: function(msg: string, correlationId: string) {
        console.info(msg);
        if(correlationId) console.info(correlationId);
        console.info("------------------------------------------------------------------------------------");
    },

    warn: function(msg: string, correlationId: string) {
        console.warn(msg);
        if(correlationId) console.info(correlationId);
        console.info("------------------------------------------------------------------------------------");
    },

    error: function(error: any) {
        console.error(error.message);
        console.error(error);
        // console.error(error.stack);
        console.info("------------------------------------------------------------------------------------");
    },

};

module.exports = logger;