'use strict';

let express = require('express'),
    SocialCtrl = require('../controllers/social.controller');

const router = express.Router();

// init social controller
const socialCtrl = new SocialCtrl(); // create instance of social controller
let get = socialCtrl.handleGetCall.bind(socialCtrl), // bind social controller contect to this in get function
    create = socialCtrl.handleCreateCall.bind(socialCtrl), // bind social controller context to this in create function
    update = socialCtrl.handleUpdateCall.bind(socialCtrl); // bind social controller context to this in update function


// CRUD routes
router.route('/')

    // GET /api/social - get list of social items

    .get(get)

    // POST /api/social - create social item
    .post(create)

    // PUT /api/social - update social item
    .put(update);

module.exports = router;