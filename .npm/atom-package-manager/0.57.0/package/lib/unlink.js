(function() {
  var CSON, Unlink, config, fs, optimist, path;

  path = require('path');

  CSON = require('season');

  optimist = require('optimist');

  fs = require('./fs');

  config = require('./config');

  module.exports = Unlink = (function() {
    Unlink.commandNames = ['unlink'];

    function Unlink() {
      this.devPackagesPath = path.join(config.getAtomDirectory(), 'dev', 'packages');
      this.packagesPath = path.join(config.getAtomDirectory(), 'packages');
    }

    Unlink.prototype.parseOptions = function(argv) {
      var options;
      options = optimist(argv);
      options.usage("\nUsage: apm unlink [<package_path>]\n\nDelete the symlink in ~/.atom/packages for the package. The package in the\ncurrent working directory is unlinked if no path is given.\n\nRun `apm links` to view all the currently linked packages.");
      options.alias('h', 'help').describe('help', 'Print this usage message');
      options.alias('d', 'dev').boolean('dev').describe('dev', 'Unlink package from ~/.atom/dev/packages');
      options.boolean('hard').describe('hard', 'Unlink package from ~/.atom/packages and ~/.atom/dev/packages');
      return options.alias('a', 'all').boolean('all').describe('all', 'Unlink all packages in ~/.atom/packages and ~/.atom/dev/packages');
    };

    Unlink.prototype.showHelp = function(argv) {
      return this.parseOptions(argv).showHelp();
    };

    Unlink.prototype.getDevPackagePath = function(packageName) {
      return path.join(this.devPackagesPath, packageName);
    };

    Unlink.prototype.getPackagePath = function(packageName) {
      return path.join(this.packagesPath, packageName);
    };

    Unlink.prototype.unlinkPath = function(pathToUnlink) {
      var error;
      try {
        process.stdout.write("Unlinking " + pathToUnlink + " ");
        if (fs.isSymbolicLinkSync(pathToUnlink)) {
          fs.unlinkSync(pathToUnlink);
        }
        return process.stdout.write('\u2713\n'.green);
      } catch (_error) {
        error = _error;
        process.stdout.write('\u2717\n'.red);
        throw error;
      }
    };

    Unlink.prototype.unlinkAll = function(options, callback) {
      var child, error, packagePath, _i, _j, _len, _len1, _ref, _ref1;
      try {
        _ref = fs.list(this.devPackagesPath);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          packagePath = path.join(this.devPackagesPath, child);
          if (fs.isSymbolicLinkSync(packagePath)) {
            this.unlinkPath(packagePath);
          }
        }
        if (!options.argv.dev) {
          _ref1 = fs.list(this.packagesPath);
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            child = _ref1[_j];
            packagePath = path.join(this.packagesPath, child);
            if (fs.isSymbolicLinkSync(packagePath)) {
              this.unlinkPath(packagePath);
            }
          }
        }
        return callback();
      } catch (_error) {
        error = _error;
        return callback(error);
      }
    };

    Unlink.prototype.unlinkPackage = function(options, callback) {
      var error, linkPath, packageName, targetPath, _ref;
      linkPath = path.resolve(process.cwd(), (_ref = options.argv._[0]) != null ? _ref : '.');
      try {
        packageName = CSON.readFileSync(CSON.resolve(path.join(linkPath, 'package'))).name;
      } catch (_error) {}
      if (!packageName) {
        packageName = path.basename(linkPath);
      }
      if (options.argv.hard) {
        try {
          this.unlinkPath(this.getDevPackagePath(packageName));
          this.unlinkPath(this.getPackagePath(packageName));
          return callback();
        } catch (_error) {
          error = _error;
          return callback(error);
        }
      } else {
        if (options.argv.dev) {
          targetPath = this.getDevPackagePath(packageName);
        } else {
          targetPath = this.getPackagePath(packageName);
        }
        try {
          this.unlinkPath(targetPath);
          return callback();
        } catch (_error) {
          error = _error;
          return callback(error);
        }
      }
    };

    Unlink.prototype.run = function(options) {
      var callback;
      callback = options.callback;
      options = this.parseOptions(options.commandArgs);
      if (options.argv.all) {
        return this.unlinkAll(options, callback);
      } else {
        return this.unlinkPackage(options, callback);
      }
    };

    return Unlink;

  })();

}).call(this);
