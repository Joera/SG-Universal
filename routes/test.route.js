'use strict';

const express = require('express');//
const router = express.Router();

const config = require('../config');

// CRUD routes
router.route('/')
    // POST /api/blog - save new blog post
    .get(function(req, res){
        res.status(200); // set http status code for response
        res.json({message: config.baseUrl + ':' + config.port + '/api is up, test succeeded.'}); // send response body
    })
    

module.exports = router;
