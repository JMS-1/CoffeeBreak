/// <binding BeforeBuild='sass' />
"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");

var paths = { webroot: "./" };

paths.sassSource = paths.webroot + "Content/**/*.scss";

paths.cssOutput = paths.webroot + "Content";

gulp.task('sass', function () {
    gulp.src(paths.sassSource)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(paths.cssOutput));
});

gulp.task('sass:watch', function () {
    gulp.watch(paths.sassSource, ['sass']);
});
