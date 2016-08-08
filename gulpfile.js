var gulp = require('gulp');
var sass = require('gulp-sass');
var del = require('del');

gulp.task('clean', function () {
    return del(["Content/App.css"]);
});

gulp.task('build', ['clean'], function () {
    gulp.src(["Content/App.scss"])
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('Content/.'));
});

gulp.task('sass:watch', function () {
    gulp.watch(["Content/*.scss"], ['build']);
});