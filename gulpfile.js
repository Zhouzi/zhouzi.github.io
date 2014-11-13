var gulp = require("gulp"),
    sass = require("gulp-ruby-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    minifycss = require("gulp-minify-css");



gulp.task("styles", function () {
    return gulp
        .src("_sass/**/*.scss")
        .pipe(sass({
            style: "nested"
        }))
        .pipe(gulp.dest("css"));
});



gulp.task( "watch", ["styles"], function () {
    gulp.watch("_sass/**/*.scss", ["styles"]);
} );



gulp.task("default", ["styles"]);



gulp.task("build", ["default"], function () {
    gulp
        .src("css")
        .pipe(minifycss())
        .pipe(autoprefixer(
            "last 2 version",
            "safari > 4",
            "ie > 7",
            "opera > 12",
            "ios > 5",
            "android > 3",
            "Firefox > 20" ))
        .pipe(gulp.dest("css"));
});