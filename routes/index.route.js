'use strict';

const express = require('express');
const pageRoutes = require('./page.route');

//
const router = express.Router();


// mount routes
router.use('/blog', pageRoutes);
// router.use('/page', pageRoutes);

//
module.exports = router;