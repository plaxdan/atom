var del = require('del'),
    fs = require('fs'),
    copy = require('stream-copy-file'),
    mkdirp = require('mkdirp')
    exec = require('child_process').exec;

var execute = function(command, cb){
  exec(command, function(error, stdout, stderr) {
    console.log("stderr: " + stderr);
    console.log("stdout: " + stdout);
    cb();
  });
};

var clean = function(files, cb) {
  del(['tests.trx', 'dist'], cb);
};

var build = function(cb) {
  execute('call msbuild EsriDataSourcePlugin.sln /p:Configuration=Release;TargetFrameworkVersion=v3.5 /target:Clean,Build', cb);
};

var dist = function(cb) {
  mkdirp('dist/', function(err) {
    if (err) {
      console.error('Error', err);
    } else {
      // Copy .dll to dist
      var src = '';
      var dest = '';
      copy(src, dest, cb);
    }
  })
};

var spec = function(cb) {
  execute('call mstest /testcontainer:EsriDataSourcePluginTests\bin\Release\EsriDataSourcePluginTests.dll /resultsfile:tests.trx', cb);
};

var ci = function(cb) {
  clean(['tests.trx', 'dist'], function() {
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
