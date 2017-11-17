'use strict';

const gulp = require('gulp');
const gulpTaskLoader = require('gulp-task-loader')('./pages/gulp-tasks'); // load tasks from other files. Allows to write each gulp task into a separate file


gulp.task('default', ['scss-compile']);
