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
