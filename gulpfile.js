var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var del = require('del');
var runSequence = require('run-sequence');

// Development Tasks
// -----------------

// Start browserSync server
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'src'
        }
    })
});

// Copy vendor JS to src/js
gulp.task('vendorJS', function() {
    return gulp.src([
            'node_modules/jquery/dist/jquery.js',
            'node_modules/bootstrap/dist/js/bootstrap.min.js'
        ])
        .pipe(gulp.dest('src/js'))
});

// Copy vendor css to src/css
gulp.task('vendorCSS', function() {
    return gulp.src([
            'node_modules/bootstrap/dist/css/bootstrap.css',
            'node_modules/font-awesome/css/font-awesome.css'
        ])
        .pipe(gulp.dest('src/css'))
});

// Copy vendor fonts to src/fonts
gulp.task('vendorFonts', function(){
	return gulp.src([
		      'node_modules/font-awesome/fonts/*.{ttf,woff,woff2,eot,svg}'
		])
		.pipe(gulp.dest('src/fonts'))
		.pipe(browserSync.reload({
			stream: true
		}))
});

// Compile sass to css
gulp.task('sass', function() {
    //return gulp.src('src/scss/**/*.scss')
    return gulp.src('src/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        //.pipe(autoprefixer())
        .pipe(sourcemaps.write('../maps'))
        .pipe(gulp.dest('src/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});


// Watchers
gulp.task('watch', function() {
    gulp.watch('src/scss/**/*.scss', ['sass']);
    gulp.watch('src/*.html', browserSync.reload);
    gulp.watch('src/js/**/*.js', browserSync.reload);
});

// Optimization Tasks
// ------------------

// Optimize CSS and JS
gulp.task('useref', function() {
    return gulp.src('src/*.html') // Grabs CSS and JS from HTML document
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify())) // Minifies only if it's a js file
        .pipe(gulpIf('*.css', cssnano())) // Minifies only if it's a css file
        .pipe(gulp.dest('dist'))
});

// Optimize Media Images
gulp.task('mediaimages', function() {
    return gulp.src('src/images/**/*.+(png|jpg|gif|svg)')
        .pipe(imagemin({
            interlaced: true
        })) // refer to https://github.com/sindresorhus/gulp-imagemin for optimization options available based on file type.
        .pipe(gulp.dest('dist/images'))
});

// Copy Fonts to dist
gulp.task('fonts', function() {
    return gulp.src('src/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'))
});

// Clean Dist
gulp.task('clean', function() {
    return del.sync('dist').then(function(cb) {
        return cache.clearAll(cb);
    });
})

gulp.task('clean:dist', function() {
    return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});

// Build Sequence
// --------------
gulp.task('default', function(callback) {
    runSequence(['vendorJS', 'vendorCSS', 'vendorFonts', 'sass', 'browserSync'], 'watch',
        callback
    )
});

gulp.task('build', function(callback) {
    runSequence(
        'clean:dist',
        'sass', ['useref', 'mediaimages', 'fonts'],
        callback
    )
});
