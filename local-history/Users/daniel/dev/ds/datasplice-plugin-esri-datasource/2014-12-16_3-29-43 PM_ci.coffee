gulp = require 'gulp'

projectPath     = "#{path.resolve __dirname}"
paths =
  solution:    "#{projectPath}/EsriDataSourcePlugin.sln"
  plugin:      "#{projectPath}/EsriDataSourcePlugin/bin/Release/EsriDataSourcePlugin.dll"
  tests:       "#{projectPath}/EsriDataSourcePluginTests/bin/Release/EsriDataSourcePluginTests.dll"
  testResults: "#{projectPath}/tests.trx"
  distBase:    "#{projectPath}/dist/"
  dist:        "#{projectPath}/dist/Server/"

gulp.task 'clean', (cb) ->
  del [paths.testResults, paths.distBase], cb




var del = require('del'),
    fs = require('fs'),
    copy = require('stream-copy-file'),
    mkdirp = require('mkdirp')
    exec = require('child_process').exec;

var paths = {
  solution:    'EsriDataSourcePlugin.sln',
  plugin:      'EsriDataSourcePlugin/bin/Release/EsriDataSourcePlugin.dll',
  tests:       'EsriDataSourcePluginTests/bin/Release/EsriDataSourcePluginTests.dll',
  testResults: 'tests.trx',
  distBase:    'dist/',
  dist:        'dist/Server/'
};

var execute = function(command, cb){
  exec(command, function(error, stdout, stderr) {
    console.log("stderr: " + stderr);
    console.log("stdout: " + stdout);
    cb();
  });
};



var build = function(cb) {
  execute('call msbuild ' + paths.solution + ' /p:Configuration=Release;TargetFrameworkVersion=v3.5 /target:Clean,Build', cb);
};

var dist = function(cb) {
  mkdirp(paths.dist, function(err) {
    if (err) {
      console.error('Error', err);
    } else {
      var src = paths.plugin;
      var dest = paths.dist + paths.plugin;
      copy(src, dest, cb);
    }
  })
};

var spec = function(cb) {
  execute('call mstest /testcontainer:' + paths.tests + ' /resultsfile:' + paths.testResults, cb);
};

var ci = function(cb) {
  clean([paths.testResults, paths.distBase], function() {
    build(function() {
      spec(function() {
        dist(cb);
      })
    })
  })
};

ci(function() {
  console.log('ci.js complete.');
});
