(function() {
  var Command, Uninstall, config, fs, optimist, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require('path');

  config = require('./config');

  optimist = require('optimist');

  Command = require('./command');

  fs = require('./fs');

  module.exports = Uninstall = (function(_super) {
    __extends(Uninstall, _super);

    function Uninstall() {
      return Uninstall.__super__.constructor.apply(this, arguments);
    }

    Uninstall.commandNames = ['uninstall'];

    Uninstall.prototype.parseOptions = function(argv) {
      var options;
      options = optimist(argv);
      options.usage("\nUsage: apm uninstall <package_name>...\n\nDelete the installed package(s) from the ~/.atom/packages directory.");
      options.alias('h', 'help').describe('help', 'Print this usage message');
      options.alias('d', 'dev').boolean('dev').describe('dev', 'Uninstall from ~/.atom/dev/packages');
      return options.boolean('hard').describe('hard', 'Uninstall from ~/.atom/packages and ~/.atom/dev/packages');
    };

    Uninstall.prototype.run = function(options) {
      var callback, devPackagesDirectory, error, packageName, packageNames, packagesDirectory, _i, _len;
      callback = options.callback;
      options = this.parseOptions(options.commandArgs);
      packageNames = this.packageNamesFromArgv(options.argv);
      if (packageNames.length === 0) {
        callback("Must specify a package name to uninstall");
        return;
      }
      packagesDirectory = path.join(config.getAtomDirectory(), 'packages');
      devPackagesDirectory = path.join(config.getAtomDirectory(), 'dev', 'packages');
      for (_i = 0, _len = packageNames.length; _i < _len; _i++) {
        packageName = packageNames[_i];
        process.stdout.write("Uninstalling " + packageName + " ");
        try {
          if (!options.argv.dev) {
            fs.removeSync(path.join(packagesDirectory, packageName));
          }
          if (options.argv.hard || options.argv.dev) {
            fs.removeSync(path.join(devPackagesDirectory, packageName));
          }
          process.stdout.write('\u2713\n'.green);
        } catch (_error) {
          error = _error;
          process.stdout.write('\u2717\n'.red);
          callback("Failed to delete " + packageName + ": " + error.message);
          return;
        }
      }
      return callback();
    };

    return Uninstall;

  })(Command);

}).call(this);
