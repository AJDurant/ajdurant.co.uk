/**
 *  The gulp tasks are split into several files in the gulp directory
 *  because putting all here was really too long
 */

'use strict';

var gulp = require('gulp');
var fs = require('fs-extra');

/**
 *  This will load all js files in the gulp directory
 *  in order to load all gulp tasks
 */
fs.walkSync('./gulp').filter(function(file) {
    return (/\.js$/i).test(file);
}).map(function(file) {
    require('./' + file);
});

/**
 *  Default task clean temporary directories and launch the
 *  main build task
 */
gulp.task('default', ['clean'], function() {
    gulp.start('build');
});
