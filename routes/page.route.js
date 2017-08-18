'use strict';

const express = require('express');
const PageCtrl = require('../controllers/page.controller');


//
const router = express.Router();


// init blog post controller
const pageCtrl = new PageCtrl(); // create instance of blog controller
let create = pageCtrl.handleCreateCall.bind(pageCtrl), // bind blog controller context to this in create function
    update = pageCtrl.handleUpdateCall.bind(pageCtrl), // bind blog controller context to this in update function
    del = pageCtrl.handleDeleteCall.bind(pageCtrl), // bind blog controller context to this in update function
    preview = pageCtrl.handlePreviewCall.bind(pageCtrl); // bind blog controller context to this in preview function


// CRUD routes
router.route('/')
    // GET /api/blog - get list of blog posts
    // .get(blogCtrl.list)

    // POST /api/blog - create new blog post
    .post(create)

    // PUT /api/blog - update blog post
    .put(update)

    // DELETE /api/blog - delete blog post
    .delete(del);


// preview route
router.route('/preview')
    // POST /api/blog/preview - render preview for posted data
    .post(preview);



module.exports = router;