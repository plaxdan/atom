var del = require('del'),
    fs = require('fs'),
    mkdirp = require('mkdirp');

var execute = function(command, callback){
  exec(command, function(error, stdout, stderr) {
    console.log("stderr: " + stderr);
    console.log("stdout: " + stdout);
    callback();
  });
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

// Delete dist & tests
del ['tests.trx', 'dist']
