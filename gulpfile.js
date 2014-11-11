var gulp = require("gulp"),
    sass = require("gulp-ruby-sass"),
    autoprefixer = require("gulp-autoprefixer");

gulp.task("styles", function () {
    return gulp
        .src("_sass/**/*.scss")
        .pipe(sass({
            style: "nested"
        }))
        .pipe(gulp.dest("css"));
});


gulp.task( 'watch', function () {
    gulp.watch("_sass/**/*.scss", ["styles"]);
} );


gulp.task("default", function () {
    gulp.run(["styles"]);
});


gulp.task("build", function () {
    gulp
        .src("_sass/**/*.scss")
        .pipe(sass({
            style: "compressed"
        }))
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