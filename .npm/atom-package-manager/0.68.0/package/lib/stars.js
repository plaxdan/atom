(function() {
  var Command, Install, Login, Stars, config, optimist, request, tree, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  optimist = require('optimist');

  Command = require('./command');

  config = require('./config');

  Install = require('./install');

  Login = require('./login');

  request = require('./request');

  tree = require('./tree');

  module.exports = Stars = (function(_super) {
    __extends(Stars, _super);

    function Stars() {
      return Stars.__super__.constructor.apply(this, arguments);
    }

    Stars.commandNames = ['stars', 'starred'];

    Stars.prototype.parseOptions = function(argv) {
      var options;
      options = optimist(argv);
      options.usage("\nUsage: apm stars\n       apm stars --install\n       apm stars --user thedaniel\n       apm stars --themes\n\nList or install starred Atom packages and themes.");
      options.alias('h', 'help').describe('help', 'Print this usage message');
      options.alias('i', 'install').boolean('install').describe('install', 'Install the starred packages');
      options.alias('t', 'themes').boolean('themes').describe('themes', 'Only list themes');
      options.alias('u', 'user').string('user').describe('user', 'GitHub username to show starred packages for');
      return options.boolean('json').describe('json', 'Output packages as a JSON array');
    };

    Stars.prototype.getStarredPackages = function(user, callback) {
      var requestSettings;
      requestSettings = {
        json: true
      };
      if (user) {
        requestSettings.url = "" + (config.getAtomApiUrl()) + "/users/" + user + "/stars";
        return this.requestStarredPackages(requestSettings, callback);
      } else {
        requestSettings.url = "" + (config.getAtomApiUrl()) + "/stars";
        return Login.getTokenOrLogin((function(_this) {
          return function(error, token) {
            if (error != null) {
              return callback(error);
            }
            requestSettings.headers = {
              authorization: token
            };
            return _this.requestStarredPackages(requestSettings, callback);
          };
        })(this));
      }
    };

    Stars.prototype.requestStarredPackages = function(requestSettings, callback) {
      return request.get(requestSettings, function(error, response, body) {
        var message, packages, _ref, _ref1;
        if (body == null) {
          body = {};
        }
        if (error != null) {
          return callback(error);
        } else if (response.statusCode === 200) {
          packages = body.filter(function(pack) {
            var _ref;
            return ((_ref = pack.releases) != null ? _ref.latest : void 0) != null;
          });
          packages = packages.map(function(_arg) {
            var downloads, metadata, readme;
            readme = _arg.readme, metadata = _arg.metadata, downloads = _arg.downloads;
            return _.extend({}, metadata, {
              readme: readme,
              downloads: downloads
            });
          });
          packages = _.sortBy(packages, 'name');
          return callback(null, packages);
        } else {
          message = (_ref = (_ref1 = body.message) != null ? _ref1 : body.error) != null ? _ref : body;
          return callback("Requesting packages failed: " + message);
        }
      });
    };

    Stars.prototype.installPackages = function(packages, callback) {
      var commandArgs;
      if (packages.length === 0) {
        return callback();
      }
      commandArgs = packages.map(function(_arg) {
        var name;
        name = _arg.name;
        return name;
      });
      return new Install().run({
        commandArgs: commandArgs,
        callback: callback
      });
    };

    Stars.prototype.logPackagesAsJson = function(packages, callback) {
      console.log(JSON.stringify(packages));
      return callback();
    };

    Stars.prototype.logPackagesAsText = function(user, packagesAreThemes, packages, callback) {
      var label, userLabel;
      userLabel = user != null ? user : 'you';
      if (packagesAreThemes) {
        label = "Themes starred by " + userLabel;
      } else {
        label = "Packages starred by " + userLabel;
      }
      console.log("" + label.cyan + " (" + packages.length + ")");
      tree(packages, function(_arg) {
        var description, downloads, name, version;
        name = _arg.name, version = _arg.version, description = _arg.description, downloads = _arg.downloads;
        label = name.yellow;
        if (process.platform === 'darwin') {
          label = "\u2B50  " + label;
        }
        if (description) {
          label += " " + (description.replace(/\s+/g, ' '));
        }
        if (downloads >= 0) {
          label += (" (" + (_.pluralize(downloads, 'download')) + ")").grey;
        }
        return label;
      });
      console.log();
      console.log("Use `apm install` to install them or visit " + 'http://atom.io/packages'.underline + " to read more about them.");
      console.log();
      return callback();
    };

    Stars.prototype.run = function(options) {
      var callback, user, _ref;
      callback = options.callback;
      options = this.parseOptions(options.commandArgs);
      user = (_ref = options.argv.user) != null ? _ref.toString().trim() : void 0;
      return this.getStarredPackages(user, (function(_this) {
        return function(error, packages) {
          if (error != null) {
            return callback(error);
          }
          if (options.argv.themes) {
            packages = packages.filter(function(_arg) {
              var theme;
              theme = _arg.theme;
              return theme;
            });
          }
          if (options.argv.install) {
            return _this.installPackages(packages, callback);
          } else if (options.argv.json) {
            return _this.logPackagesAsJson(packages, callback);
          } else {
            return _this.logPackagesAsText(user, options.argv.themes, packages, callback);
          }
        };
      })(this));
    };

    return Stars;

  })(Command);

}).call(this);
