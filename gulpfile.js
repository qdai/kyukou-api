'use strict';

const coveralls = require('gulp-coveralls');
const del = require('del');
const eslint = require('gulp-eslint');
const exec = require('child_process').exec;
const gulp = require('gulp');
const istanbul = require('gulp-istanbul');
const mocha = require('gulp-mocha');
const path = require('path');

gulp.task('clean', () => {
  return del(['./coverage', './doc']);
});

gulp.task('lint', () => {
  return gulp.src(['./**/*.js', '!./coverage/**', '!./doc/**', '!./node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test', callback => {
  gulp.src('./lib/**/*.js')
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', () => {
      gulp.src('./test/*.js')
        .pipe(mocha())
        .pipe(istanbul.writeReports({
          dir: './coverage',
          reporters: ['lcov']
        }))
        .on('end', callback);
    });
});

gulp.task('doc', callback => {
  exec(path.join(__dirname, 'node_modules', '.bin', 'jsdoc') + ' lib README.md -r -d doc', (err, stdout, stderr) => {
    if (stdout) {
      console.log(stdout); // eslint-disable-line no-console
    }
    if (stderr) {
      console.log(stderr); // eslint-disable-line no-console
    }
    callback(err);
  });
});

gulp.task('default', ['lint', 'test']);

gulp.task('coveralls', ['test'], () => {
  return gulp.src('./coverage/lcov.info')
    .pipe(coveralls());
});

gulp.task('ci', ['default', 'coveralls']);
