'use strict';

const eslint = require('gulp-eslint');
const gulp = require('gulp');

gulp.task('lint:js', () => {
  return gulp.src(['./**/*.js', '!./node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('lint', ['lint:js']);
gulp.task('default', ['lint']);
