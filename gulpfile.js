var gulp = require('gulp');
var concat = require('gulp-concat');
var gzip = require('gulp-gzip');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var del = require('del');
var tar = require('gulp-tar');
var util = require('gulp-util');
var pkg = require('./package');

var distDir = './dist/';
var buildDir = './src/styles/';
var destinationDir = distDir + pkg.name + '-' + pkg.version;

gulp.task('clean', function(cb) {
    del(distDir, cb);
});

gulp.task('copy-images-to-dist', ['clean'], function() {
    return gulp.src([
            './src/img/**',
            './src/styles/**'
            ], {
            base: 'src/'
        })
        .pipe(gulp.dest(destinationDir));
});

gulp.task('build-so-css', ['copy-images-to-dist'], function() {
    return gulp.src([
            buildDir + '/core/core.css',
            buildDir + '/components/components.css'
        ])
        .pipe(minifyCSS({
            keepBreaks: true,
            processImport: true,
            debug: false
        }))
        .pipe(concat('spaden.css'))
        .pipe(gulp.dest(destinationDir + '/styles/'))
        .pipe(minifyCSS({
            keepBreaks: false,
            processImport: true,
            debug: true
        }))
        .pipe(concat('spaden.min.css'))
        .pipe(gulp.dest(destinationDir + '/styles/'))
});

gulp.task('build-ie-css', ['copy-images-to-dist'], function(){
    gulp.src(buildDir + '/ie*.*')
        .pipe(minifyCSS({
            keepBreaks: false,
            processImport: true,
            debug: false
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(destinationDir + '/styles/'))
})
gulp.task('build-legacy-css', ['copy-images-to-dist'], function() {
    gulp.src(buildDir + '/legacy/**')
        .pipe(concat('legacy.css'))
        .pipe(gulp.dest(destinationDir + '/styles/'))
        .pipe(minifyCSS({
            keepBreaks: false,
            processImport: true,
            debug: false
        }))
        .pipe(concat('legacy.min.css'))
        .pipe(gulp.dest(destinationDir + '/styles/'))
});

gulp.task('copy-bundles', ['replace-imgpaths'], function(){
    return gulp.src([
            destinationDir + '/styles/spaden*.css',
            destinationDir + '/styles/legac*.css',
            destinationDir + '/styles/ie*.css',
            destinationDir + '/styles/print*.css'
        ])
        .pipe(gulp.dest(destinationDir));
});

gulp.task('package', ['copy-bundles'], function() {
    var artifactVersion = pkg.version;
    if (util.env.versionOverride) {
        artifactVersion = util.env.versionOverride;
        console.log('version overrrid', artifactVersion);
    }
    return gulp.src([
            distDir + '/' + pkg.name + '-' + pkg.version + '/**',
            distDir + '/' + pkg.name + '-' + pkg.version + '/.css'
        ], {
            base: distDir + '/' + pkg.name + '-' + pkg.version + '/'
        })
        .pipe(tar(pkg.name + '-' + artifactVersion + '.tar'))
        .pipe(gzip())
        .pipe(gulp.dest('./dist'));
});

gulp.task('replace-imgpaths', ['build-so-css', 'build-legacy-css'], function() {
    return gulp.src(destinationDir + '/**/*.css')
        .pipe(replace(/\.\.\/\.\.\/img\//g, 'img/'))
        .pipe(replace(/\/img\//g, 'img/'))
        .pipe(gulp.dest(destinationDir));
});


gulp.on('err', function(e) {
    console.log(e.err.stack);
});

gulp.task('default', [
    'copy-images-to-dist',
    'replace-imgpaths',
    'build-so-css',
    'build-legacy-css',
    'build-ie-css',
    'package'
]);
