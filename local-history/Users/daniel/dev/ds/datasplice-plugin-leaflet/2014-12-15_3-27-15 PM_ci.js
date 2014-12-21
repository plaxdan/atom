var fs = require('fs'),
    os = require('os'),
    path = require('path'),
    exec = require('child_process').exec;

var installDependencies = function(afterDependencies) {
  var execute = function(command, callback){
    exec(command, function(error, stdout, stderr) {
      console.log("stderr: " + stderr);
      console.log("stdout: " + stdout);
      callback();
    });
  };

  var installNpm = 'npm i';
  var installBower = 'node_modules/.bin/bower i';
  var agnosticInstallBower = installBower;
  if (os.platform() === 'win32') {
    agnosticInstallBower = 'call ' + agnosticInstallBower;
  }
  var ci = './node_modules/.bin/gulp ci --production';

  console.log("Installing npm dependencies...");
  execute(installNpm, function() {
    console.log("Installing bower dependencies...");
    execute(agnosticInstallBower, afterDependencies())
  });
}

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
var afterDepencencies = function() {
  console.log("Executing CI tasks...");
  execute(ci, function() {
    console.log('ci.js complete.');
  })
};
installDependencies(afterDependencies)
