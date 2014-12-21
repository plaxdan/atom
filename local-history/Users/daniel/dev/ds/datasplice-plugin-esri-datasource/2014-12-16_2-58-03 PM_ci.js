var del = require('del'),
    fs = require('fs'),
    copy = require('stream-copy-file'),
    mkdirp = require('mkdirp');

var execute = function(command, callback){
  exec(command, function(error, stdout, stderr) {
    console.log("stderr: " + stderr);
    console.log("stdout: " + stdout);
    callback();
  });
};

var clean = function(files, cb) {
  del(['tests.trx', 'dist'], cb);
};

var build = function(cb) {
  execute('msbuild EsriDataSourcePlugin.sln /p:Configuration=Release;TargetFrameworkVersion=v3.5 /target:Clean,Build', cb);
};

var dist = function() {
  mkdirp('dist/', function(err) {
    if (err) {
      console.error('Error', err);
    } else {
      // Copy .dll to dist
    }
  })
};

var test = function(cb) {
  execute('mstest /testcontainer:EsriDataSourcePluginTests\bin\Release\EsriDataSourcePluginTests.dll /resultsfile:tests.trx', cb);
};

var ci = function() {

};

ci();
