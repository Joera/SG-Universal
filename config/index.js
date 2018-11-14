'use strict';

const path = require('path');

const env = process.env.NODE_ENV || 'development';
const config = require(`./${env}`); // eslint-disable-line import/no-dynamic-require

const defaults = {
    root: path.join(__dirname, '/..')
};

module.exports = Object.assign(defaults, config);
