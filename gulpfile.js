const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');

gulp.task('styles', function() {
  return gulp
    .src('scss/**/*.scss')
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(cssnano())
    .pipe(gulp.dest('css'));
});

gulp.task('watch:styles', ['styles'], function() {
  gulp.watch('scss/**/*.scss', ['styles']);
});

gulp.task('default', ['styles']);
