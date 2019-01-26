'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('html', ['inject'], function () {
    var htmlFilter = $.filter('**/*.html', { restore: true });
    var jsFilter = $.filter('**/*.js', { restore: true });
    var cssFilter = $.filter('**/*.css', { restore: true });

    return gulp.src(path.join(conf.paths.tmp, '/serve/**/*.html'))
    .pipe($.debug({title: 'debug:'}))
    .pipe($.useref({
        searchPath: ['.tmp/serve', './bower_components'],
        transformPath: function(filePath) {
            return filePath.replace(/(\.\.\/)+bower_components\//,'');
        }
    }))
    .pipe($.debug({title: 'useref:'}))
    .pipe(jsFilter)
    .pipe($.debug({title: 'js-filter:'}))
    .pipe($.sourcemaps.init())
    .pipe($.uglify({ preserveComments: $.uglifySaveLicense })).on('error', conf.errorHandler('Uglify'))
    .pipe($.rev())
    .pipe($.sourcemaps.write('maps'))
    .pipe(jsFilter.restore)
    .pipe(cssFilter)
    .pipe($.debug({title: 'css-filter:'}))
    .pipe($.sourcemaps.init())
    .pipe($.replace('../../../bower_components/material-design-icons/iconfont/', '/assets/fonts/'))
    .pipe($.cleanCss({ processImport: false }))
    .pipe($.rev())
    .pipe($.sourcemaps.write('maps'))
    .pipe(cssFilter.restore)
    .pipe($.revReplace())
    .pipe(htmlFilter)
    .pipe($.minifyHtml({
        empty: true,
        spare: true,
        quotes: true,
        conditionals: true
    }))
    .pipe(htmlFilter.restore)
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')))
    .pipe($.size({ title: path.join(conf.paths.dist, '/'), showFiles: true }));
});

// Only applies for fonts from bower dependencies
// Custom fonts are handled by the "other" task
gulp.task('fonts', function () {
    return gulp.src($.mainBowerFiles())
    .pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
    .pipe($.flatten())
    .pipe(gulp.dest(path.join(conf.paths.dist, 'assets/fonts/')));
});

gulp.task('other', ['images'], function () {
    var fileFilter = $.filter(function (file) {
        return file.stat.isFile();
    });

    return gulp.src([
        path.join(conf.paths.tmp, '/serve/**/*'),
        path.join('!' + conf.paths.tmp, '/**/*.{html,css,js,scss}')
    ])
    .pipe(fileFilter)
    .pipe(gulp.dest(path.join(conf.paths.dist, '/')));
});

gulp.task('clean', function () {
    return $.del([path.join(conf.paths.dist, '/'), path.join(conf.paths.tmp, '/')]);
});

gulp.task('build', ['html', 'fonts', 'other']);
