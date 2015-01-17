var BBPromise = require('bluebird');
var bower = require('bower');
var del = require('del');
var gulp = require('gulp');
var gutil = require('gulp-util');
var header = require('gulp-header');
var mainBowerFiles = require('main-bower-files');
var uglify = require('gulp-uglify');

gulp.task('install', function () {
  return new BBPromise(function (resolve, reject) {
    bower.commands.install().on('log', function (log) {
      gutil.log('bower', log.id.cyan, log.message);
    }).on('end', function (installed) {
      resolve(installed);
    }).on('error', function (err) {
      reject(err);
    });
  });
});

gulp.task('bower', ['install'], function () {
  var destPath = 'public/lib';
  del.sync(destPath);
  return gulp.src(mainBowerFiles(), { base: 'bower_components' })
    .pipe(gulp.dest(destPath));
});

gulp.task('build_js', function () {
  var destPath = 'public/js';
  del.sync(destPath);
  return gulp.src('src/js/**/*.js')
    .pipe(header('var SITE_URL = \'//' + require('./settings/site').url + '/\';\n'))
    .pipe(uglify())
    .pipe(gulp.dest(destPath));
});

gulp.task('build', ['bower', 'build_js']);
gulp.task('default', ['build']);
