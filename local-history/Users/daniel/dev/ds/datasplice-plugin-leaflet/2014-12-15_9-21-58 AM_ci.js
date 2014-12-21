var del = require('del'),
    os = require('os'),
    exec = require('child_process').exec;

var installDependencies = function() {
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
    execute(agnosticInstallBower, function() {
      console.log("Executing CI tasks...");
      execute(ci, function() {
        console.log('ci.js complete.');
      })
    })
  });
}

var rmdir = function(dir) {
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
      fs.unlinkSync(filename);
    }
  }
  return fs.rmdirSync(dir);
};

console.log('Deleting dependencies...');
del(['./node_modules', './bower_components'], installDependencies);
