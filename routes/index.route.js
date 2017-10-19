'use strict';

const express = require('express');
const contentRoutes = require('./content.route');

//
const router = express.Router();


// mount routes
router.use('/blog', contentRoutes);
// router.use('/page', contentRoutes);

//
module.exports = router;