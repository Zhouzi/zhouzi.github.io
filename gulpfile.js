var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('styles', function () {
    return gulp
        .src('_src/scss/**/*.scss')
        .pipe($.sass({ outputStyle: 'compressed' }))
        .pipe($.autoprefixer('last 3 versions'))
        .pipe(gulp.dest('dist'));
});

gulp.task("watch", ["default"], function () {
    gulp.watch('_src/scss/**/*.scss', ["styles"]);
});

gulp.task("default", ["styles"]);