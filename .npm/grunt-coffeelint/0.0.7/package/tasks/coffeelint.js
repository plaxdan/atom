module.exports = function(grunt) {
  var coffeelint = require('coffeelint');

  grunt.registerMultiTask('coffeelint', 'Validate files with CoffeeLint', function() {

    var files = this.filesSrc;
    var options = this.options({
      force: false,
    });
    var errorCount = 0;
    var warnCount = 0;

    files.forEach(function(file) {
      grunt.verbose.writeln('Linting ' + file + '...');

      var errors = coffeelint.lint(grunt.file.read(file), options);

      if (!errors.length) {
        return grunt.verbose.ok();
      }

      errors.forEach(function(error) {
        var status, message;

        message = file + ':' + error.lineNumber + ' ' + error.message +
            ' (' + error.rule + ')';

        if (error.level === 'error') {
          errorCount += 1;
          grunt.log.error("[error]".red + message);
        } else if (error.level === 'warn') {
          warnCount += 1;
          grunt.log.ok("[warn]".yellow + message);
        } else {
          return;
        }

        grunt.event.emit('coffeelint:' + error.level, error.level, message);
        grunt.event.emit('coffeelint:any', error.level, message);
      });
    });

    if (errorCount && !options.force) {
      return false;
    }

    if (!warnCount) {
      grunt.log.ok(files.length + ' file' + (files.length === 1 ? '' : 's') +
          ' lint free.');
    }
  });
};
