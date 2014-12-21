var exec = require('child_process').exec;

var execute = function(command, callback){
  exec(command, function(error, stdout, stderr) {
    console.log("stderr: " + stderr);
    console.log("stdout: " + stdout);
    callback();
  });
};

console.log('Installing node dependencies...');
execute('call npm i', function() {
  console.log('Node dependencies installed.');
  console.log("Executing CI tasks...");
  execute('call =node_modules/.bin/gulp ci', function() {
    console.log('ci.js complete.');
  });
});
