var OUTPUT_DIR = "blur-monitor";
var PUBLIC_FILE_EXTENSIONS = [
    "js",
    "html",
    "htm",
    "css",
    "svg",
    "jpg",
    "png",
    "gif",
    "woff",
    "woff2",
    "ttf"
].join(',');
var ANGULAR_ROUTES = [
    "/",
    "/monitor",
    "/login",
    "/edit",
    "/profile"
];

var gulp = require('gulp');
var browserSync = require('browser-sync').create();

gulp.task('build', function() {

    // copy bower sources
    gulp.src('bower_components/**/*.{' + PUBLIC_FILE_EXTENSIONS + '}').pipe(gulp.dest(OUTPUT_DIR + "/bower_components"));

    // copy app sources
    gulp.src('src/public/**/*.{' + PUBLIC_FILE_EXTENSIONS + '}').pipe(gulp.dest(OUTPUT_DIR));

    // generate index pages
    for (var i = 0; i < ANGULAR_ROUTES.length; i++) {
        var route = ANGULAR_ROUTES[i];
        gulp.src('src/html/index.html').pipe(gulp.dest(OUTPUT_DIR + route));
    }

});

gulp.task('watch', function() {

    // on each change of any files under /src dir, rebuild
    gulp.watch('./src/**/*.{' + PUBLIC_FILE_EXTENSIONS + '}', ['build']);

});

gulp.task('serve', ['build', 'watch'], function() {
    browserSync.init({
        server: {baseDir: "./"}
    });
});