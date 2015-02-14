var apidoc = require('apidoc');
var BBPromise = require('bluebird');
var bower = require('bower');
var del = require('del');
var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var header = require('gulp-header');
var mainBowerFiles = require('main-bower-files');
var uglify = require('gulp-uglify');

function apiList (apiData) {
  var list = {};
  apiData.forEach(function (el) {
    if (!list[el.group]) {
      list[el.group] = [];
    }
    list[el.group].push(el.title);
  });
  return list;
}

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

gulp.task('apidoc', function () {
  var chunk = apidoc.createDoc({
    src: 'api/',
    parse: true,
  });
  chunk.data = JSON.parse(chunk.data);
  chunk.project = JSON.parse(chunk.project);
  chunk.list = apiList(chunk.data);
  fs.writeFileSync('api/doc.json', JSON.stringify(chunk));
  if (typeof chunk === 'object') {
    gutil.log('apidoc:', gutil.colors.green('Apidoc created... [ ' + chunk.project.name + ' ] '));
    return BBPromise.resolve(chunk);
  } else {
    return BBPromise.reject(new Error('Execution terminated (set "debug: true" for details. '));
  }
});

gulp.task('build', ['bower', 'build_js', 'apidoc']);
gulp.task('default', ['build']);
