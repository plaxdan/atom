(function() {
  var Command, Git, Login, Packages, Publish, config, fs, optimist, path, request,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  path = require('path');

  optimist = require('optimist');

  Git = require('git-utils');

  fs = require('./fs');

  config = require('./config');

  Command = require('./command');

  Login = require('./login');

  Packages = require('./packages');

  request = require('./request');

  module.exports = Publish = (function(_super) {
    __extends(Publish, _super);

    Publish.commandNames = ['publish'];

    function Publish() {
      this.userConfigPath = config.getUserConfigPath();
      this.atomNpmPath = require.resolve('npm/bin/npm-cli');
    }

    Publish.prototype.parseOptions = function(argv) {
      var options;
      options = optimist(argv);
      options.usage("\nUsage: apm publish [<newversion> | major | minor | patch | build]\n       apm publish --tag <tagname>\n\nPublish a new version of the package in the current working directory.\n\nIf a new version or version increment is specified, then a new Git tag is\ncreated and the package.json file is updated with that new version before\nit is published to the apm registry. The HEAD branch and the new tag are\npushed up to the remote repository automatically using this option.\n\nRun `apm featured` to see all the featured packages or\n`apm view <packagename>` to see information about your package after you\nhave published it.");
      options.alias('h', 'help').describe('help', 'Print this usage message');
      return options.alias('t', 'tag').string('tag').describe('tag', 'Specify a tag to publish');
    };

    Publish.prototype.showHelp = function(argv) {
      return this.parseOptions(argv).showHelp();
    };

    Publish.prototype.versionPackage = function(version, callback) {
      var versionArgs;
      process.stdout.write('Preparing and tagging a new version ');
      versionArgs = ['version', version, '-m', 'Prepare %s release'];
      return this.fork(this.atomNpmPath, versionArgs, (function(_this) {
        return function(code, stderr, stdout) {
          if (stderr == null) {
            stderr = '';
          }
          if (stdout == null) {
            stdout = '';
          }
          if (code === 0) {
            _this.logSuccess();
            return callback(null, stdout.trim());
          } else {
            _this.logFailure();
            return callback(("" + stdout + "\n" + stderr).trim());
          }
        };
      })(this));
    };

    Publish.prototype.pushVersion = function(tag, callback) {
      var pushArgs;
      process.stdout.write("Pushing " + tag + " tag ");
      pushArgs = ['push', 'origin', 'HEAD', tag];
      return this.spawn('git', pushArgs, (function(_this) {
        return function() {
          var args;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return _this.logCommandResults.apply(_this, [callback].concat(__slice.call(args)));
        };
      })(this));
    };

    Publish.prototype.waitForTagToBeAvailable = function(pack, tag, callback) {
      var interval, requestSettings, requestTags, retryCount;
      retryCount = 5;
      interval = 1000;
      requestSettings = {
        url: "https://api.github.com/repos/" + (Packages.getRepository(pack)) + "/tags",
        json: true,
        headers: {
          'User-Agent': "AtomApm/" + (require('../package.json').version)
        }
      };
      requestTags = function() {
        return request.get(requestSettings, function(error, response, tags) {
          var index, name, _i, _len;
          if (tags == null) {
            tags = [];
          }
          if (response.statusCode === 200) {
            for (index = _i = 0, _len = tags.length; _i < _len; index = ++_i) {
              name = tags[index].name;
              if (name === tag) {
                return callback();
              }
            }
          }
          if (--retryCount <= 0) {
            return callback();
          } else {
            return setTimeout(requestTags, interval);
          }
        });
      };
      return requestTags();
    };

    Publish.prototype.packageExists = function(packageName, callback) {
      return Login.getTokenOrLogin(function(error, token) {
        var requestSettings;
        if (error != null) {
          return callback(error);
        }
        requestSettings = {
          url: "" + (config.getAtomPackagesUrl()) + "/" + packageName,
          json: true,
          headers: {
            authorization: token
          }
        };
        return request.get(requestSettings, function(error, response, body) {
          if (body == null) {
            body = {};
          }
          if (error != null) {
            return callback(error);
          } else {
            return callback(null, response.statusCode === 200);
          }
        });
      });
    };

    Publish.prototype.registerPackage = function(pack, callback) {
      if (!pack.name) {
        callback('Required name field in package.json not found');
        return;
      }
      return this.packageExists(pack.name, (function(_this) {
        return function(error, exists) {
          var repository;
          if (error != null) {
            return callback(error);
          }
          if (exists) {
            return callback();
          }
          if (!(repository = Packages.getRepository(pack))) {
            callback('Unable to parse repository name/owner from package.json repository field');
            return;
          }
          process.stdout.write("Registering " + pack.name + " ");
          return Login.getTokenOrLogin(function(error, token) {
            var requestSettings;
            if (error != null) {
              _this.logFailure();
              callback(error);
              return;
            }
            requestSettings = {
              url: config.getAtomPackagesUrl(),
              json: true,
              body: {
                repository: repository
              },
              headers: {
                authorization: token
              }
            };
            return request.post(requestSettings, function(error, response, body) {
              var message, _ref, _ref1;
              if (body == null) {
                body = {};
              }
              if (error != null) {
                return callback(error);
              } else if (response.statusCode !== 201) {
                message = (_ref = (_ref1 = body.message) != null ? _ref1 : body.error) != null ? _ref : body;
                _this.logFailure();
                return callback("Registering package in " + repository + " repository failed: " + message);
              } else {
                _this.logSuccess();
                return callback(null, true);
              }
            });
          });
        };
      })(this));
    };

    Publish.prototype.createPackageVersion = function(packageName, tag, callback) {
      return Login.getTokenOrLogin(function(error, token) {
        var requestSettings;
        if (error != null) {
          callback(error);
          return;
        }
        requestSettings = {
          url: "" + (config.getAtomPackagesUrl()) + "/" + packageName + "/versions",
          json: true,
          body: {
            tag: tag
          },
          headers: {
            authorization: token
          }
        };
        return request.post(requestSettings, function(error, response, body) {
          var message, _ref, _ref1;
          if (body == null) {
            body = {};
          }
          if (error != null) {
            return callback(error);
          } else if (response.statusCode !== 201) {
            message = (_ref = (_ref1 = body.message) != null ? _ref1 : body.error) != null ? _ref : body;
            return callback("Creating new version failed: " + message);
          } else {
            return callback();
          }
        });
      });
    };

    Publish.prototype.publishPackage = function(pack, tag, callback) {
      process.stdout.write("Publishing " + pack.name + "@" + tag + " ");
      return this.createPackageVersion(pack.name, tag, (function(_this) {
        return function(error) {
          if (error != null) {
            _this.logFailure();
            return callback(error);
          } else {
            _this.logSuccess();
            return callback();
          }
        };
      })(this));
    };

    Publish.prototype.logFirstTimePublishMessage = function(pack) {
      process.stdout.write('Congrats on publishing a new package!'.rainbow);
      if (process.platform === 'darwin') {
        process.stdout.write(' \uD83D\uDC4D  \uD83D\uDCE6  \uD83C\uDF89');
      }
      return process.stdout.write("\nCheck it out at https://atom.io/packages/" + pack.name + "\n");
    };

    Publish.prototype.loadMetadata = function() {
      var error, metadataPath, pack;
      metadataPath = path.resolve('package.json');
      if (!fs.isFileSync(metadataPath)) {
        throw new Error("No package.json file found at " + (process.cwd()) + "/package.json");
      }
      try {
        return pack = JSON.parse(fs.readFileSync(metadataPath));
      } catch (_error) {
        error = _error;
        throw new Error("Error parsing package.json file: " + error.message);
      }
    };

    Publish.prototype.loadRepository = function() {
      var currentDirectory, repo;
      currentDirectory = process.cwd();
      repo = Git.open(currentDirectory);
      if (!(repo != null ? repo.isWorkingDirectory(currentDirectory) : void 0)) {
        throw new Error('Package must be in a Git repository before publishing: https://help.github.com/articles/create-a-repo');
      }
      if (!repo.getConfigValue('remote.origin.url')) {
        throw new Error('Package must pushed up to GitHub before publishing: https://help.github.com/articles/create-a-repo');
      }
    };

    Publish.prototype.run = function(options) {
      var callback, error, pack, tag, version;
      callback = options.callback;
      options = this.parseOptions(options.commandArgs);
      tag = options.argv.tag;
      version = options.argv._[0];
      try {
        pack = this.loadMetadata();
      } catch (_error) {
        error = _error;
        return callback(error);
      }
      try {
        this.loadRepository();
      } catch (_error) {
        error = _error;
        return callback(error);
      }
      if ((version != null ? version.length : void 0) > 0) {
        return this.registerPackage(pack, (function(_this) {
          return function(error, firstTimePublishing) {
            if (error != null) {
              return callback(error);
            }
            return _this.versionPackage(version, function(error, tag) {
              if (error != null) {
                return callback(error);
              }
              return _this.pushVersion(tag, function(error) {
                if (error != null) {
                  return callback(error);
                }
                return _this.waitForTagToBeAvailable(pack, tag, function() {
                  return _this.publishPackage(pack, tag, function(error) {
                    if (firstTimePublishing && (error == null)) {
                      _this.logFirstTimePublishMessage(pack);
                    }
                    return callback(error);
                  });
                });
              });
            });
          };
        })(this));
      } else if ((tag != null ? tag.length : void 0) > 0) {
        return this.registerPackage(pack, (function(_this) {
          return function(error, firstTimePublishing) {
            if (error != null) {
              return callback(error);
            }
            return _this.publishPackage(pack, tag, function(error) {
              if (firstTimePublishing && (error == null)) {
                _this.logFirstTimePublishMessage(pack);
              }
              return callback(error);
            });
          };
        })(this));
      } else {
        return callback('Missing required tag to publish');
      }
    };

    return Publish;

  })(Command);

}).call(this);
