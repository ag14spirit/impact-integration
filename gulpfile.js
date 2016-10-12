/**
 * Created by achepey on 10/11/16.
 */
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    del = require('del'),
    util = require('gulp-util');

var browserSync = require('browser-sync');

gulp.task('sass', function() {
    log('Compiling Sass...');

    return gulp.src('app/styles/styles.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('app/styles/css'))
        .pipe(browserSync.stream());
        // .pipe(notify({ message: 'Styles task complete' }));
});

gulp.task('serve', ['sass'], function () {
    browserSync.init({
        server: "./app"
    });

    // watch for changes within the scss files and then re-call the sass task
    gulp.watch('app/styles/*.scss', ['sass']);
    gulp.watch('app/**/*.html').on('change', browserSync.reload);
    gulp.watch('app/**/*.js').on('change', browserSync.reload);
});


gulp.task('default', ['serve']);

function log(msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                util.log(util.colors.blue(msg[item]));
            }
        }
    } else {
        util.log(util.colors.blue(msg));
    }
}