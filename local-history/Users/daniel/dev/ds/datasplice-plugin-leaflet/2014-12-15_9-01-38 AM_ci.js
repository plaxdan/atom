var fs = require('fs'),
    os = require('os'),
    exec = require('child_process').exec,
    child

deleteFolderRecursive = function(path) {
  var files = [];
  if( fs.existsSync(path) ) {
    files = fs.readdirSync(path);
    files.forEach(function(file,index) {
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

// Synchronously delete dependencies
console.log("Deleting npm dependencies...");
deleteFolderRecursive('./node_modules');
console.log("Deleting bower dependencies...");
deleteFolderRecursive('./bower_components');


var installDependencies = function() {}
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
