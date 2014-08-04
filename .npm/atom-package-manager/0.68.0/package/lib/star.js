(function() {
  var Command, Login, Star, async, config, optimist, request,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  async = require('async');

  optimist = require('optimist');

  config = require('./config');

  Command = require('./command');

  Login = require('./login');

  request = require('./request');

  module.exports = Star = (function(_super) {
    __extends(Star, _super);

    function Star() {
      return Star.__super__.constructor.apply(this, arguments);
    }

    Star.commandNames = ['star'];

    Star.prototype.parseOptions = function(argv) {
      var options;
      options = optimist(argv);
      options.usage("\nUsage: apm star <package_name>...\n\nStar the given packages on https://atom.io\n\nRun `apm stars` to see all your starred packages.");
      return options.alias('h', 'help').describe('help', 'Print this usage message');
    };

    Star.prototype.starPackage = function(packageName, token, callback) {
      var requestSettings;
      if (process.platform === 'darwin') {
        process.stdout.write('\u2B50  ');
      }
      process.stdout.write("Starring " + packageName + " ");
      requestSettings = {
        json: true,
        url: "" + (config.getAtomPackagesUrl()) + "/" + packageName + "/star",
        headers: {
          authorization: token
        }
      };
      return request.post(requestSettings, (function(_this) {
        return function(error, response, body) {
          var message, _ref, _ref1;
          if (body == null) {
            body = {};
          }
          if (error != null) {
            _this.logFailure();
            return callback(error);
          } else if (response.statusCode !== 200) {
            _this.logFailure();
            message = (_ref = (_ref1 = body.message) != null ? _ref1 : body.error) != null ? _ref : body;
            return callback("Starring package failed: " + message);
          } else {
            _this.logSuccess();
            return callback();
          }
        };
      })(this));
    };

    Star.prototype.run = function(options) {
      var callback, packageNames;
      callback = options.callback;
      options = this.parseOptions(options.commandArgs);
      packageNames = this.packageNamesFromArgv(options.argv);
      if (packageNames.length === 0) {
        callback("Must specify a package name to star");
        return;
      }
      return Login.getTokenOrLogin((function(_this) {
        return function(error, token) {
          var commands;
          if (error != null) {
            return callback(error);
          }
          commands = packageNames.map(function(packageName) {
            return function(callback) {
              return _this.starPackage(packageName, token, callback);
            };
          });
          return async.waterfall(commands, callback);
        };
      })(this));
    };

    return Star;

  })(Command);

}).call(this);
