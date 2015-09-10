'use strict';

const del = require('del');
const eslint = require('gulp-eslint');
const gulp = require('gulp');
const istanbul = require('gulp-istanbul');
const mocha = require('gulp-mocha');

gulp.task('lint:js', () => {
  return gulp.src(['./**/*.js', '!./coverage/**', '!./node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test', callback => {
  const destPath = './coverage';
  del.sync(destPath);
  gulp.src('./lib/**/*.js')
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', () => {
      gulp.src('./test/*.js')
        .pipe(mocha())
        .pipe(istanbul.writeReports({
          dir: destPath,
          reporters: ['lcov']
        }))
        .on('end', callback);
    });
});

gulp.task('lint', ['lint:js']);
gulp.task('default', ['lint', 'test']);
