'use strict';

const apidoc = require('apidoc');
const bower = require('bower');
const config = require('config');
const del = require('del');
const eslint = require('gulp-eslint');
const fs = require('fs');
const gulp = require('gulp');
const header = require('gulp-header');
const less = require('gulp-less');
const mainBowerFiles = require('main-bower-files');
const minify = require('gulp-minify-css');
const uglify = require('gulp-uglify');

const srcPathBase = './src';
const destPathBase = './public';
const apiList = function (apiData) {
  const list = {};
  apiData.forEach(function (el) {
    if (!list[el.group]) {
      list[el.group] = [];
    }
    list[el.group].push(el.title);
  });
  return list;
};

gulp.task('clean', function (callback) {
  del(destPathBase, callback);
});

gulp.task('bower:install', function (callback) {
  bower.commands.install().on('end', function () {
    callback();
  }).on('error', function (err) {
    callback(err);
  });
});

gulp.task('bower', ['bower:install'], function () {
  const destPath = srcPathBase + '/static/lib';
  return gulp.src(mainBowerFiles(), { base: 'bower_components' })
    .pipe(gulp.dest(destPath));
});

gulp.task('lint:js', function () {
  return gulp.src(['./**/*.js', '!./node_modules/**', '!./bower_components/**', '!./public/**', '!./src/static/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('build:js', function () {
  const destPath = destPathBase + '/js';
  return gulp.src(srcPathBase + '/js/**/*.js')
    .pipe(header('var SITE_URL = \'//' + config.get('site.url') + '/\';\n'))
    .pipe(uglify())
    .pipe(gulp.dest(destPath));
});

gulp.task('build:css', function () {
  const destPath = destPathBase + '/css';
  return gulp.src(srcPathBase + '/less/**/*.less')
    .pipe(less())
    .pipe(minify())
    .pipe(gulp.dest(destPath));
});

gulp.task('build:static', ['bower'], function () {
  return gulp.src(srcPathBase + '/static/**')
    .pipe(gulp.dest(destPathBase));
});

gulp.task('apidoc', function (callback) {
  const chunk = apidoc.createDoc({
    src: 'api/',
    parse: true,
    debug: false
  });
  if (chunk.data && chunk.project) {
    chunk.data = JSON.parse(chunk.data);
    chunk.project = JSON.parse(chunk.project);
    chunk.list = apiList(chunk.data);
    fs.writeFileSync('api/doc.json', JSON.stringify(chunk));
    callback();
  } else {
    callback(new Error('apiDoc execution terminated (set "debug: true" for details).'));
  }
});

gulp.task('lint', ['lint:js']);
gulp.task('build', ['build:js', 'build:css', 'build:static', 'apidoc']);
gulp.task('default', ['lint', 'build']);
gulp.task('ci', ['default']);
