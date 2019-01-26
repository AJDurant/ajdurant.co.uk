'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var swig = require('swig-templates');
var through = require('through2');

var $ = require('gulp-load-plugins')();

var site  = require('../site.json');
site.time = new Date();

var rePostName = /(\d{4})-(\d{1,2})-(\d{1,2})-(.*)/;

swig.setDefaults({
    loader: swig.loaders.fs(conf.paths.src + '/templates'),
    cache: false
});

gulp.task('media', function () {
    return gulp.src(path.join(conf.paths.src, 'content/media/**/*'))
        .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/media')));
});

gulp.task('pages', function () {
    return gulp.src(path.join(conf.paths.src, 'content/pages/*.md'))
        .pipe($.frontMatter({property: 'page', remove: true}))
        .pipe($.marked())
        .pipe(applyTemplate('page.html'))
        .pipe($.rename({extname: '.html'}))
        .pipe(gulp.dest(path.join(conf.paths.tmp, '/build')));
});

gulp.task('posts', function () {
    return gulp.src(path.join(conf.paths.src, 'content/posts/*.md'))
        .pipe($.frontMatter({property: 'page', remove: true}))
        .pipe($.marked())
        .pipe(summarise('<!--more-->'))
        .pipe(filename2date())
        .pipe(collectPosts())
        .pipe(applyTemplate('post.html'))
        .pipe($.rename(function (path) {
            path.extname = '.html';
            var match = rePostName.exec(path.basename);
            if (match)
            {
                var year = match[1];
                var month = match[2];
                var day = match[3];

                path.dirname = year + '/' + month + '/' + day;
                path.basename = match[4];
            }
        }))
        .pipe(gulp.dest(path.join(conf.paths.tmp, '/build')));
});

gulp.task('tags', ['posts'], function () {
    return tags()
        .pipe(applyTemplate('tag.html'))
        .pipe(gulp.dest(path.join(conf.paths.tmp, '/build/tag')));
});

gulp.task('blog', ['posts'], function () {
    return posts('blog', 5)
        .pipe(applyTemplate('blog.html'))
        .pipe(gulp.dest(path.join(conf.paths.tmp, '/build')));
});

gulp.task('templates', ['pages', 'media', 'posts', 'tags', 'blog']);

function collectPosts() {
    var posts = [];
    var tags = [];
    return through.obj(function (file, enc, cb) {
        posts.push(file.page);
        posts[posts.length - 1].content = file.contents.toString();

        if (file.page.tags) {
            file.page.tags.forEach(function (tag) {
                if (tags.indexOf(tag) == -1) {
                    tags.push(tag);
                }
            });
        }

        this.push(file);
        cb();
    },
    function (cb) {
        posts.sort(function (a, b) {
            return b.date - a.date;
        });
        site.posts = posts;
        site.tags = tags;
        cb();
    });
}

function filename2date() {
    return through.obj(function (file, enc, cb) {
        var basename = path.basename(file.path, '.md');
        var match = rePostName.exec(basename);
        if (match)
        {
            var year     = match[1];
            var month    = match[2];
            var day      = match[3];
            basename = match[4];
            file.page.date = new Date(year + '-' + month + '-' + day);
            file.page.url  = '/' + year + '/' + month + '/' + day + '/' + basename;
        }

        this.push(file);
        cb();
    });
}

function summarise(marker) {
    return through.obj(function (file, enc, cb) {
        var summary = file.contents.toString().split(marker)[0];
        file.page.summary = summary;
        this.push(file);
        cb();
    });
}

function applyTemplate(templateFile) {
    var tpl = swig.compileFile(templateFile);

    return through.obj(function (file, enc, cb) {
        var data = {
            site: site,
            page: file.page,
            content: file.contents.toString()
        };
        file.contents = new Buffer(tpl(data), 'utf8');
        this.push(file);
        cb();
    });
}

function posts(basename, count) {
    var stream = through.obj(function(file, enc, cb) {
        this.push(file);
        cb();
    });

    if (site.posts) {
        var c     = 0;
        var page  = 0;
        var posts = [];
        site.posts.forEach(function (post) {
            posts.push(post);
            c++;
            if (c == count) {
                var file = new $.util.File({
                    path: basename + (page == 0 ? '' : page) + '.html',
                    contents: new Buffer('')
                });
                file.page = {
                    posts: posts,
                    prevPage: page != 0 ? basename + ((page-1) == 0 ? '' : page-1) + '.html' : null,
                    nextPage: (page+1) * count < site.posts.length ? basename + (page+1) + '.html' : null
                };
                stream.write(file);

                c = 0;
                posts = [];
                page++;
            }
        });

        if (posts.length != 0) {
            var file = new $.util.File({
                path: basename + (page == 0 ? '' : page) + '.html',
                contents: new Buffer('')
            });
            file.page = {
                posts: posts,
                prevPage: page != 0 ? basename + ((page-1) == 0 ? '' : page-1) + '.html' : null,
                nextPage: null
            };
            stream.write(file);
        }
    }

    stream.end();
    stream.emit('end');

    return stream;
}

function tags() {
    var stream = through.obj(function(file, enc, cb) {
        this.push(file);
        cb();
    });

    if (site.tags)
  {
        site.tags.forEach(function (tag) {
            var file = new $.util.File({
                path: tag + '.html',
                contents: new Buffer('')
            });
            file.page = {title: tag, tag: tag};

            stream.write(file);
        });
    }

    stream.end();
    stream.emit('end');

    return stream;
}

function dummy(file) {
    var stream = through.obj(function(file, enc, cb) {
        this.push(file);
        cb();
    });

    if (site) {
        file = new $.util.File({
            path: file,
            contents: new Buffer('')
        });
        file.page = {};
        stream.write(file);
    }

    stream.end();
    stream.emit('end');

    return stream;
}
