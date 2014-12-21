var exec = require('child_process').exec;

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

console.log('Installing node dependencies...');
execute('call npm i', function() {
  execute('call ./node_modules/.bin/gulp ci')
});
