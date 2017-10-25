'use strict';

const express = require('express');
const contentRoutes = require('./content.route');

//
const router = express.Router();


// mount routes
router.use('/blog', contentRoutes);
// router.use('/content', contentRoutes);

//
module.exports = router;