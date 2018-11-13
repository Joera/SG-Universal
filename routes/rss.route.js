'use strict';

const express = require('express');//
const router = express.Router();
const RssCtrl = require('../controllers/rss.controller');

// init blog post controller
const rssCtrl = new RssCtrl(); // save instance of blog controller
let getFeed = rssCtrl.get.bind(rssCtrl);

// CRUD routes
router.route('/')
    .get(getFeed);

module.exports = router;