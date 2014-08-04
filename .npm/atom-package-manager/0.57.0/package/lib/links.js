(function() {
  var Links, config, fs, optimist, path, tree;

  path = require('path');

  optimist = require('optimist');

  config = require('./config');

  fs = require('./fs');

  tree = require('./tree');

  module.exports = Links = (function() {
    Links.commandNames = ['linked', 'links', 'lns'];

    function Links() {
      this.devPackagesPath = path.join(config.getAtomDirectory(), 'dev', 'packages');
      this.packagesPath = path.join(config.getAtomDirectory(), 'packages');
    }

    Links.prototype.parseOptions = function(argv) {
      var options;
      options = optimist(argv);
      options.usage("\nUsage: apm links\n\nList all of the symlinked atom packages in ~/.atom/packages and\n~/.atom/dev/packages.");
      return options.alias('h', 'help').describe('help', 'Print this usage message');
    };

    Links.prototype.showHelp = function(argv) {
      return this.parseOptions(argv).showHelp();
    };

    Links.prototype.getDevPackagePath = function(packageName) {
      return path.join(this.devPackagesPath, packageName);
    };

    Links.prototype.getPackagePath = function(packageName) {
      return path.join(this.packagesPath, packageName);
    };

    Links.prototype.getSymlinks = function(directoryPath) {
      var directory, symlinkPath, symlinks, _i, _len, _ref;
      symlinks = [];
      _ref = fs.list(directoryPath);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        directory = _ref[_i];
        symlinkPath = path.join(directoryPath, directory);
        if (fs.isSymbolicLinkSync(symlinkPath)) {
          symlinks.push(symlinkPath);
        }
      }
      return symlinks;
    };

    Links.prototype.logLinks = function(directoryPath) {
      var links;
      links = this.getSymlinks(directoryPath);
      console.log("" + directoryPath.cyan + " (" + links.length + ")");
      return tree(links, {
        emptyMessage: '(no links)'
      }, (function(_this) {
        return function(link) {
          var error, realpath;
          try {
            realpath = fs.realpathSync(link);
          } catch (_error) {
            error = _error;
            realpath = '???'.red;
          }
          return "" + (path.basename(link).yellow) + " -> " + realpath;
        };
      })(this));
    };

    Links.prototype.run = function() {
      this.logLinks(this.devPackagesPath);
      return this.logLinks(this.packagesPath);
    };

    return Links;

  })();

}).call(this);
