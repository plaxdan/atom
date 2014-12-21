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
});
