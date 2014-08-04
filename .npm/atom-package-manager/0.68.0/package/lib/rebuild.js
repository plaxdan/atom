(function() {
  var Command, Install, Rebuild, config, optimist, path, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require('path');

  _ = require('underscore-plus');

  optimist = require('optimist');

  config = require('./config');

  Command = require('./command');

  Install = require('./install');

  module.exports = Rebuild = (function(_super) {
    __extends(Rebuild, _super);

    Rebuild.commandNames = ['rebuild'];

    function Rebuild() {
      this.atomNodeDirectory = path.join(config.getAtomDirectory(), '.node-gyp');
      this.atomNpmPath = require.resolve('npm/bin/npm-cli');
    }

    Rebuild.prototype.parseOptions = function(argv) {
      var options;
      options = optimist(argv);
      options.usage("\nUsage: apm rebuild\n\nRebuild all the modules currently installed in the node_modules folder\nin the current working directory.");
      return options.alias('h', 'help').describe('help', 'Print this usage message');
    };

    Rebuild.prototype.showHelp = function(argv) {
      return this.parseOptions(argv).showHelp();
    };

    Rebuild.prototype.run = function(_arg) {
      var callback;
      callback = _arg.callback;
      return new Install().installNode((function(_this) {
        return function(error) {
          var env, rebuildArgs;
          if (error != null) {
            return callback(error);
          } else {
            process.stdout.write('Rebuilding modules ');
            rebuildArgs = ['rebuild'];
            rebuildArgs.push("--target=" + (config.getNodeVersion()));
            rebuildArgs.push("--arch=" + (config.getNodeArch()));
            env = _.extend({}, process.env, {
              HOME: _this.atomNodeDirectory
            });
            if (config.isWin32()) {
              env.USERPROFILE = env.HOME;
            }
            return _this.fork(_this.atomNpmPath, rebuildArgs, {
              env: env
            }, function(code, stderr) {
              if (stderr == null) {
                stderr = '';
              }
              if (code === 0) {
                _this.logSuccess();
                return callback();
              } else {
                _this.logFailure();
                return callback(stderr);
              }
            });
          }
        };
      })(this));
    };

    return Rebuild;

  })(Command);

}).call(this);
