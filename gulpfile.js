var gulp 		= require('gulp');
var browserify 	= require('browserify');
var babelify 	= require('babelify');
var source 		= require('vinyl-source-stream');
var buffer 		= require('vinyl-buffer');
var gp_uglify 	= require('gulp-uglify');
var sass 		= require('gulp-sass');
var minifycss 	= require('gulp-minify-css');
var concatCss 	= require('gulp-concat-css'); 

var merge 		= require('merge-stream');
var glob 		= require('glob');
var path 		= require('path');

//var nodemon = 	require('gulp-nodemon');

gulp.task('sass', function(){

	return gulp.src('./resources/react/**/*.scss')
	    .pipe(sass()) // Converts Sass to CSS with gulp-sass
	    .pipe(concatCss('main.css'))
	    .pipe(minifycss())
	    .pipe(gulp.dest('public/assets/css/'))

});

gulp.task('build', function () {

    var files = glob.sync('./resources/react/**/*.jsx');

	return merge(files.map(function(file) {

		let newpath = "public/assets/js/" + 
						path.relative('./resources/react/src', path.dirname(file));

		//console.log(newpath);

		return browserify({
			entries: file,
			debug: true
		}).transform(babelify, {presets: ["es2015", "react", "stage-2"]})
		.bundle()
		.pipe(source(path.basename(file, '.jsx') + ".js"))
		.pipe(gulp.dest(newpath))

	}));

});

gulp.task('watch', ['build', 'sass'], function () {
	
	let watcher =  gulp.watch(['./resources/react/scenes/home/*.scss', './resources/react/scenes/home/*.jsx']);

	function runTask(e) {

		console.log(e.path);

		if(e.path.endsWith('.jsx')) {

			return gulp.start('build')

		}
		else if(e.path.endsWith('.scss')) {

			return gulp.start('sass')

		}

	}

	watcher.on('add', 	 (event) => runTask(event))
	watcher.on('unlink', (event) => runTask(event))
	watcher.on('change', (event) => runTask(event))

    return watcher;
});

gulp.task('default', ['watch']);