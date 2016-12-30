'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var $ = require('gulp-load-plugins')();

gulp.task('images', ['favicon'], function() {
    return gulp.src(path.join(conf.paths.src, '/assets/images/**/*'))
        .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/assets/images')));
})

gulp.task('favicon', function() {
    return gulp.src(path.join(conf.paths.src, 'assets/favicon.ico'))
        .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/')));
})
