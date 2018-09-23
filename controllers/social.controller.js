'use strict';

// let Q = require('q'),
//     logger = require('../config/winston'),
//     appConfig = require('../config/env'),
//     HomeController = require('./home.controller'),
//

    const Promise = require('bluebird');
    const uuidv4 = require('uuid/v4');
    const logger = require('../services/logger.service');
    const SocialPersistence = require('../persistence/social.persistence');
    const AuthService = require('../services/auth.service');



/**
 * Blog controller
 *
 */
class SocialController {

    constructor () {
        //
        const socialPersistence = new SocialPersistence();
        this.getSocial = socialPersistence.find.bind(socialPersistence);
        this.updateSocial = socialPersistence.save.bind(socialPersistence);
        this.createSocial = socialPersistence.save.bind(socialPersistence);

        // init home controller
        // const homeController = new HomeController();
        // this.updateHome = homeController.update.bind(homeController);

        // init authorization service
        this.authService = new AuthService();
    }



    /***********************************************************************************************
     * CRUD handlers
     ***********************************************************************************************/

    /**
     * Handles api get call
     * @param req
     * @param res
     * @param next
     */
    handleGetCall(req, res, next) {
        const self = this;
        const correlationId = uuidv4();

        let getItems = self.getItems.bind(self), // bind social controller context to this of the update function
            setFilters = self._setFilters.bind(self);

        self.authService.isAuthorized(req.headers.authorization, correlationId)
            .then(setFilters(req.query))
            .then((config) => { return new Promise((resolve, reject) => { let query = config; resolve({}); }) })
            .then(() => { return getItems(query)})
            .then(self._sendResponse(res))
            .catch(error => {
                logger.error(error);
                res.status(error.status).send(error.message);
            })
            .done();
    }


    /**
     * Handles api post call
     * @param req
     * @param res
     * @param next
     */
    handleCreateCall(req, res, next) {
        const self = this;
        let create = self.create.bind(self); // bind social controller context to this of the create function

        self.isAuthorized(req, res) // check if authorized to make call
            .then(self._sendResponse)
            .then(create) // create social procedure
            .catch(error => {
                logger.error(error);
                res.status(error.status).send(error.message);
            })
            .done();
    }


    /**
     * Handles api put call
     * @param req
     * @param res
     * @param next
     */
    handleUpdateCall(req, res, next) {
        const self = this;
        let update = self.update.bind(self); // bind social controller context to this of the update function

        self.isAuthorized(req, res) // check if authorized to make call
            .then(self._sendResponse)
            .then(update) // update social procedure
            .catch(error => {
                logger.error(error);
                res.status(error.status).send(error.message);
            })
            .done();
    }



    /***********************************************************************************************
     *
     ***********************************************************************************************/

    /**
     * Set filters for retreving data from database
     * @param config                {req: express request object, res: express response object}
     * @returns {*|Constructor|promise|e}
     */
    _setFilters(query) {
        // req.params
        let self = this;

        logger.info(query);

        return new Promise((resolve, reject) => {

            // set filters
            let config = {}
            config.filter = {};
            if (query.source) {
                config.filter.source = query.source;
            } // filter source property
            if (query.published && query.published === 'true') {
                config.filter.publishDate = {$ne: null};
            } // filter on only published items
            if (query.published && query.published === 'false') {
                config.filter.publishDate = null;
            } //  filter on not published items
            // if(config.req.query.q) { config.filter.$text = { $search : config.req.query.q }; } //
            if (query.q) {
                config.filter.text = {$regex: query.q, $options: "i"};
            } // search text

            // set limit
            if (query.limit) {
                config.limit = parseInt(query.limit);
            }
            // set page and skip
            if (query.page) {
                config.skip = (parseInt(query.page) * parseInt(query.limit)) - parseInt(query.limit); // set number of records to skip to get the records for the requested page
                config.page = parseInt(query.page); // set page number
            }

            // resolve promise
            resolve(config);

        })
    }



    /**
     * Get social procedure
     * @param config                {req: express request object, res: express response object}
     * @returns {*|Constructor|promise|e}
     */
    getItems(config) {
        let self = this;

        return new Promise((resolve, reject) => {

            logger.info(config);

            self.getSocial(config) // get social items in mongodb
                .then(c => {
                    resolve(c)
                }) // resolve promise
                .catch(error => {
                    reject(error);
                });

        })
    }



    /**
     * Create social procedure
     * Save to local mongodb, render homepage
     * @param config                {req: express request object, res: express response object}
     * @returns {*|Constructor|promise|e}
     */
    create(config) {
        let self = this;

        return new Promise((resolve, reject) => {

            self.createSocial(config) // create social item in mongodb
                .then(self.updateHome) // update homepage
                .then(c => {
                    resolve(c)
                }) // resolve promise
                .catch(error => {
                    reject(error);
                });
            })
    }



    /**
     * Update social procedure
     * Save to local mongodb, render homepage
     * @param config                {req: express request object, res: express response object}
     * @returns {*|Constructor|promise|e}
     */
    update(config) {
        let self = this;

        return new Promise((resolve, reject) => {

            self.updateSocial(config) // update social item in mongodb
            //  .then(self.updateHome) // update homepage
                .then(c => {
                    resolve(c)
                })
                .catch(error => {
                    reject(error);
                });
        })
    }



    /**
     * Send response to client
     * @param config                Config object {res: express response object, path: path of the template file, response: resonse data that will be send to client, html: rendered template html, data: {type: page type, body: saved blog post data, navigation: null}}
     * @returns {*|promise}
     * @private
     */
    _sendResponse(res) {
        let self = this;
        return new Promise((resolve, reject) => {

            res.json('hoi');
           // config.res.json(config.response);
            resolve();
        });
    }




}





module.exports = SocialController;
