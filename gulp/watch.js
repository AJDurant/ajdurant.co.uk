'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

function isOnlyChange(event) {
    return event.type === 'changed';
}

gulp.task('watch', ['inject', 'images'], function () {

    gulp.watch([
        path.join(conf.paths.src, '/templates/*.html'),
        path.join(conf.paths.src, '/content/**/*.md'),
        'bower.json'
    ], ['inject-reload']
    );

    gulp.watch([
        path.join(conf.paths.src, '/assets/styles/*.css'),
        path.join(conf.paths.src, '/assets/styles/*.scss')
    ], function(event) {
        if(isOnlyChange(event)) {
            gulp.start('styles-reload');
        } else {
            gulp.start('inject-reload');
        }
    });

    gulp.watch(path.join(conf.paths.src, '/assets/js/*.js'), function(event) {
        if(isOnlyChange(event)) {
            gulp.start('scripts-reload');
        } else {
            gulp.start('inject-reload');
        }
    });

});
