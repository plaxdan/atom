var exec = require('child_process').exec;

console.log('Installing node dependencies...');


exec('call npm i', function(error, stdout, stderr) {
  if (error !=== null) {
    console.error('Error installing node dependencies', error);
  } else {
    console.log('Finished installing node dependencies');
  }
});
