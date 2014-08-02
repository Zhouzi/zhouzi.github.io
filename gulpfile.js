var basePath    = '',
    scssPath    = basePath + 'css/scss/**/*.scss',
    jsBasePath  = basePath + 'js/partials/',
    jsPath      = jsBasePath + '**/*.js';

// Load plugins
var gulp          = require( 'gulp' ),
    sass          = require( 'gulp-ruby-sass' ),
    autoprefixer  = require( 'gulp-autoprefixer' ),
    concat        = require( 'gulp-concat' ),
    livereload    = require( 'gulp-livereload' );

// Styles
gulp.task( 'styles', function () {
  return gulp.src( scssPath )
    .pipe( sass( { style : 'compressed' } ) )
    .pipe( autoprefixer( 'last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4' ) )
    .pipe( gulp.dest( basePath + 'css' ) );
});

// Scripts
gulp.task( 'scripts', function () {
  return gulp.src( [ 
      jsBasePath + 'type.js',
      jsBasePath + 'chattybar.js',
      jsBasePath + 'main.js'
    ] )
    .pipe( concat( 'scripts.js' ) )
    .pipe( gulp.dest( basePath + 'js' ) );
});

// Default task
gulp.task( 'default', function() {
    gulp.start( 'styles', 'scripts' );
} );

// Watch
gulp.task( 'watch', function () {
  // Watch .scss files
  gulp.watch( scssPath, [ 'styles' ] );
  
  // Watch .js files
  gulp.watch( jsPath, [ 'scripts' ] );
  
  // Watch any files and reload on change
  var server = livereload();
  gulp.watch( 'app/**' ).on( 'change', function ( file ) {
    server.changed( file.path );
  } );
});