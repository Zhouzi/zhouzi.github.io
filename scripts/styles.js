var fs = require('fs');
var q = require('q');
var sass = require('node-sass');
var autoprefixer = require('autoprefixer');
var postcss = require('postcss');

sassify().then(autoprefix).then(writeFile);

function sassify () {
  var deferred = q.defer();

  sass.render({
    file: 'scss/styles.scss',
    outputStyle: 'compressed'
  }, function (err, result) {
    if (err) return deferred.reject(err);
    return deferred.resolve(result.css);
  });

  return deferred.promise;
}

function autoprefix (css) {
  var deferred = q.defer();

  postcss([ autoprefixer ])
    .process(css)
    .then(function (result) {
      result.warnings().forEach(function (warn) {
        console.warn(warn.toString());
      });

      return deferred.resolve(result.css);
    })
    .catch(deferred.reject)
  ;

  return deferred.promise;
}

function writeFile (css) {
  var deferred = q.defer();

  fs.writeFile('css/styles.css', css, function (err) {
    if (err) return deferred.reject(err);
    return deferred.resolve();
  });

  return deferred.promise;
}
