var fs = require('fs'),
    os = require('os'),
    path = require('path'),
    exec = require('child_process').exec;

var crossPlatformify = function(cmd) {
  var agnosticCmd = cmd;
  if (os.platform() === 'win32') {
    agnosticCmd = 'call ' + agnosticCmd;
  }
  return agnosticCmd;
};

var execute = function(command, callback){
  exec(command, function(error, stdout, stderr) {
    console.log("stderr: " + stderr);
    console.log("stdout: " + stdout);
    callback();
  });
};

var installDependencies = function(cb) {
  var installNpm = crossPlatformify('npm i');
  var installBower = crossPlatformify('node_modules/.bin/bower i');
  console.log("Installing npm dependencies...");
  execute(installNpm, function() {
    console.log("Installing bower dependencies...");
    execute(installBower, cb);
  });
};

var rmdir = function(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  var filename, item, list, stat, _i, _len;
  list = fs.readdirSync(dir);
  for (_i = 0, _len = list.length; _i < _len; _i++) {
    item = list[_i];
    filename = path.join(dir, item);
    stat = fs.statSync(filename);
    if (filename === "." || filename === "..") {
      // Skip
    } else if (stat.isDirectory()) {
      rmdir(filename);
    } else {
      // Delete
      if (fs.existsSync(filename)) {
        fs.unlinkSync(filename);
      }
    }
  }
  return fs.rmdirSync(dir);
};

console.log('Deleting node_modules...');
rmdir('./node_modules/');
console.log('Deleting bower_components...');
rmdir('./bower_components/');
var afterDependencies = function() {
  console.log("Executing CI tasks...");
  var ci = crossPlatformify('./node_modules/.bin/gulp ci --production --nosourcemap');
  execute(ci, function() {
    console.log('ci.js complete.');
  });
};
installDependencies(afterDependencies);
