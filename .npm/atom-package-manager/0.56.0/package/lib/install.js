(function() {
  var CSON, Command, Install, async, config, fs, optimist, path, request, temp, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require('path');

  async = require('async');

  _ = require('underscore-plus');

  optimist = require('optimist');

  CSON = require('season');

  temp = require('temp');

  config = require('./config');

  Command = require('./command');

  fs = require('./fs');

  request = require('./request');

  module.exports = Install = (function(_super) {
    __extends(Install, _super);

    Install.commandNames = ['install'];

    function Install() {
      this.installModules = __bind(this.installModules, this);
      this.installNode = __bind(this.installNode, this);
      this.atomDirectory = config.getAtomDirectory();
      this.atomPackagesDirectory = path.join(this.atomDirectory, 'packages');
      this.atomNodeDirectory = path.join(this.atomDirectory, '.node-gyp');
      this.atomNpmPath = require.resolve('npm/bin/npm-cli');
      this.atomNodeGypPath = require.resolve('node-gyp/bin/node-gyp');
    }

    Install.prototype.parseOptions = function(argv) {
      var options;
      options = optimist(argv);
      options.usage("\nUsage: apm install [<package_name>]\n\nInstall the given Atom package to ~/.atom/packages/<package_name>.\n\nIf no package name is given then all the dependencies in the package.json\nfile are installed to the node_modules folder in the current working\ndirectory.");
      options.alias('h', 'help').describe('help', 'Print this usage message');
      options.alias('s', 'silent').boolean('silent').describe('silent', 'Set the npm log level to silent');
      return options.alias('q', 'quiet').boolean('quiet').describe('quiet', 'Set the npm log level to warn');
    };

    Install.prototype.installNode = function(callback) {
      var env, installNodeArgs;
      installNodeArgs = ['install'];
      installNodeArgs.push("--target=" + (config.getNodeVersion()));
      installNodeArgs.push("--dist-url=" + (config.getNodeUrl()));
      installNodeArgs.push("--arch=" + (config.getNodeArch()));
      env = _.extend({}, process.env, {
        HOME: this.atomNodeDirectory
      });
      if (config.isWin32()) {
        env.USERPROFILE = env.HOME;
      }
      fs.makeTreeSync(this.atomDirectory);
      return this.fork(this.atomNodeGypPath, installNodeArgs, {
        env: env,
        cwd: this.atomDirectory
      }, function(code, stderr, stdout) {
        if (stderr == null) {
          stderr = '';
        }
        if (stdout == null) {
          stdout = '';
        }
        if (code === 0) {
          return callback();
        } else {
          return callback("" + stdout + "\n" + stderr);
        }
      });
    };

    Install.prototype.updateWindowsEnv = function(env) {
      var localModuleBins;
      env.USERPROFILE = env.HOME;
      localModuleBins = path.resolve(__dirname, '..', 'node_modules', '.bin');
      if (env.Path) {
        return env.Path += "" + path.delimiter + localModuleBins;
      } else {
        return env.Path = localModuleBins;
      }
    };

    Install.prototype.addNodeBinToEnv = function(env) {
      var nodeBinFolder, pathKey;
      nodeBinFolder = path.resolve(__dirname, '..', 'bin');
      pathKey = config.isWin32() ? 'Path' : 'PATH';
      if (env[pathKey]) {
        return env[pathKey] = "" + nodeBinFolder + path.delimiter + env[pathKey];
      } else {
        return env[pathKey] = nodeBinFolder;
      }
    };

    Install.prototype.installModule = function(options, pack, modulePath, callback) {
      var env, installArgs, installDirectory, installGlobally, installOptions, nodeModulesDirectory, vsArgs, _ref;
      installArgs = ['--globalconfig', config.getGlobalConfigPath(), '--userconfig', config.getUserConfigPath(), 'install'];
      installArgs.push(modulePath);
      installArgs.push("--target=" + (config.getNodeVersion()));
      installArgs.push("--arch=" + (config.getNodeArch()));
      if (options.argv.silent) {
        installArgs.push('--silent');
      }
      if (options.argv.quiet) {
        installArgs.push('--quiet');
      }
      if (vsArgs = this.getVisualStudioFlags()) {
        installArgs.push(vsArgs);
      }
      env = _.extend({}, process.env, {
        HOME: this.atomNodeDirectory
      });
      if (config.isWin32()) {
        this.updateWindowsEnv(env);
      }
      this.addNodeBinToEnv(env);
      installOptions = {
        env: env
      };
      installGlobally = (_ref = options.installGlobally) != null ? _ref : true;
      if (installGlobally) {
        installDirectory = temp.mkdirSync('apm-install-dir-');
        nodeModulesDirectory = path.join(installDirectory, 'node_modules');
        fs.makeTreeSync(nodeModulesDirectory);
        installOptions.cwd = installDirectory;
      }
      return this.fork(this.atomNpmPath, installArgs, installOptions, (function(_this) {
        return function(code, stderr, stdout) {
          var child, destination, source, _i, _len, _ref1;
          if (stderr == null) {
            stderr = '';
          }
          if (stdout == null) {
            stdout = '';
          }
          if (code === 0) {
            if (installGlobally) {
              _ref1 = fs.readdirSync(nodeModulesDirectory);
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                child = _ref1[_i];
                source = path.join(nodeModulesDirectory, child);
                destination = path.join(_this.atomPackagesDirectory, child);
                fs.cp(source, destination, {
                  forceDelete: true
                });
              }
              process.stdout.write('\u2713\n'.green);
            }
            return callback();
          } else {
            if (installGlobally) {
              fs.removeSync(installDirectory);
              process.stdout.write('\u2717\n'.red);
            }
            return callback("" + stdout + "\n" + stderr);
          }
        };
      })(this));
    };

    Install.prototype.getVisualStudioFlags = function() {
      var vsVersion;
      if (!config.isWin32()) {
        return null;
      }
      if (vsVersion = config.getInstalledVisualStudioFlag()) {
        return "--msvs_version=" + vsVersion;
      } else {
        throw new Error('You must have Visual Studio 2010 or 2012 installed');
      }
    };

    Install.prototype.installModules = function(options, callback) {
      process.stdout.write('Installing modules ');
      return this.forkInstallCommand(options, (function(_this) {
        return function(code, stderr, stdout) {
          if (stderr == null) {
            stderr = '';
          }
          if (stdout == null) {
            stdout = '';
          }
          if (code === 0) {
            process.stdout.write('\u2713\n'.green);
            return callback();
          } else {
            process.stdout.write('\u2717\n'.red);
            return callback("" + stdout + "\n" + stderr);
          }
        };
      })(this));
    };

    Install.prototype.forkInstallCommand = function(options, callback) {
      var env, installArgs, installOptions, vsArgs;
      installArgs = ['--globalconfig', config.getGlobalConfigPath(), '--userconfig', config.getUserConfigPath(), 'install'];
      installArgs.push("--target=" + (config.getNodeVersion()));
      installArgs.push("--arch=" + (config.getNodeArch()));
      if (options.argv.silent) {
        installArgs.push('--silent');
      }
      if (options.argv.quiet) {
        installArgs.push('--quiet');
      }
      if (vsArgs = this.getVisualStudioFlags()) {
        installArgs.push(vsArgs);
      }
      env = _.extend({}, process.env, {
        HOME: this.atomNodeDirectory
      });
      if (config.isWin32()) {
        this.updateWindowsEnv(env);
      }
      this.addNodeBinToEnv(env);
      installOptions = {
        env: env
      };
      if (options.cwd) {
        installOptions.cwd = options.cwd;
      }
      return this.fork(this.atomNpmPath, installArgs, installOptions, callback);
    };

    Install.prototype.requestPackage = function(packageName, callback) {
      var requestSettings;
      requestSettings = {
        url: "" + (config.getAtomPackagesUrl()) + "/" + packageName,
        json: true
      };
      return request.get(requestSettings, function(error, response, body) {
        var latestVersion, message, _ref, _ref1;
        if (body == null) {
          body = {};
        }
        if (error != null) {
          return callback("Request for package information failed: " + error.message);
        } else if (response.statusCode !== 200) {
          message = (_ref = (_ref1 = body.message) != null ? _ref1 : body.error) != null ? _ref : body;
          return callback("Request for package information failed: " + message);
        } else {
          if (latestVersion = body.releases.latest) {
            return callback(null, body);
          } else {
            return callback("No releases available for " + packageName);
          }
        }
      });
    };

    Install.prototype.downloadPackage = function(packageUrl, installGlobally, callback) {
      var requestSettings;
      requestSettings = {
        url: packageUrl
      };
      return request.createReadStream(requestSettings, function(readStream) {
        readStream.on('error', function(error) {
          return callback("Unable to download " + packageUrl + ": " + error.message);
        });
        return readStream.on('response', function(response) {
          var chunks, filePath, writeStream;
          if (response.statusCode === 200) {
            filePath = path.join(temp.mkdirSync(), 'package.tgz');
            writeStream = fs.createWriteStream(filePath);
            readStream.pipe(writeStream);
            writeStream.on('error', function(errror) {
              return callback("Unable to download " + packageUrl + ": " + error.message);
            });
            return writeStream.on('close', function() {
              return callback(null, filePath);
            });
          } else {
            chunks = [];
            response.on('data', function(chunk) {
              return chunks.push(chunk);
            });
            return response.on('end', function() {
              var error, message, parseError, _ref, _ref1, _ref2, _ref3;
              try {
                error = JSON.parse(Buffer.concat(chunks));
                message = (_ref = (_ref1 = error.message) != null ? _ref1 : error.error) != null ? _ref : error;
                if (installGlobally) {
                  process.stdout.write('\u2717\n'.red);
                }
                return callback("Unable to download " + packageUrl + ": " + ((_ref2 = response.headers.status) != null ? _ref2 : response.statusCode) + " " + message);
              } catch (_error) {
                parseError = _error;
                if (installGlobally) {
                  process.stdout.write('\u2717\n'.red);
                }
                return callback("Unable to download " + packageUrl + ": " + ((_ref3 = response.headers.status) != null ? _ref3 : response.statusCode));
              }
            });
          }
        });
      });
    };

    Install.prototype.getPackageCachePath = function(packageName, packageVersion) {
      var cacheDir, cachePath;
      cacheDir = config.getPackageCacheDirectory();
      cachePath = path.join(cacheDir, packageName, packageVersion, 'package.tgz');
      if (fs.isFileSync(cachePath)) {
        return cachePath;
      }
    };

    Install.prototype.isPackageInstalled = function(packageName, packageVersion) {
      var error, version, _ref;
      try {
        version = ((_ref = CSON.readFileSync(CSON.resolve(path.join('node_modules', packageName, 'package')))) != null ? _ref : {}).version;
        return packageVersion === version;
      } catch (_error) {
        error = _error;
        return false;
      }
    };

    Install.prototype.installPackage = function(metadata, options, callback) {
      var installGlobally, label, packageName, packageVersion, _ref;
      packageName = metadata.name;
      packageVersion = metadata.version;
      installGlobally = (_ref = options.installGlobally) != null ? _ref : true;
      if (!installGlobally) {
        if (packageVersion && this.isPackageInstalled(packageName, packageVersion)) {
          callback();
          return;
        }
      }
      label = packageName;
      if (packageVersion) {
        label += "@" + packageVersion;
      }
      process.stdout.write("Installing " + label + " ");
      if (installGlobally) {
        process.stdout.write("to " + this.atomPackagesDirectory + " ");
      }
      return this.requestPackage(packageName, (function(_this) {
        return function(error, pack) {
          var commands, installNode, tarball, _ref1, _ref2, _ref3;
          if (error != null) {
            process.stdout.write('\u2717\n'.red);
            return callback(error);
          } else {
            commands = [];
            if (packageVersion == null) {
              packageVersion = pack.releases.latest;
            }
            tarball = ((_ref1 = (_ref2 = pack.versions[packageVersion]) != null ? _ref2.dist : void 0) != null ? _ref1 : {}).tarball;
            if (!tarball) {
              process.stdout.write('\u2717\n'.red);
              callback("Package version: " + packageVersion + " not found");
              return;
            }
            commands.push(function(callback) {
              var packagePath;
              if (packagePath = _this.getPackageCachePath(packageName, packageVersion)) {
                return callback(null, packagePath);
              } else {
                return _this.downloadPackage(tarball, installGlobally, callback);
              }
            });
            installNode = (_ref3 = options.installNode) != null ? _ref3 : true;
            if (installNode) {
              commands.push(function(packagePath, callback) {
                return _this.installNode(function(error) {
                  return callback(error, packagePath);
                });
              });
            }
            commands.push(function(packagePath, callback) {
              return _this.installModule(options, pack, packagePath, callback);
            });
            return async.waterfall(commands, function(error) {
              if (!installGlobally) {
                if (error != null) {
                  process.stdout.write('\u2717\n'.red);
                } else {
                  process.stdout.write('\u2713\n'.green);
                }
              }
              return callback(error);
            });
          }
        };
      })(this));
    };

    Install.prototype.installPackageDependencies = function(options, callback) {
      var commands, name, version, _fn, _ref;
      options = _.extend({}, options, {
        installGlobally: false,
        installNode: false
      });
      commands = [];
      _ref = this.getPackageDependencies();
      _fn = (function(_this) {
        return function(name, version) {
          return commands.push(function(callback) {
            return _this.installPackage({
              name: name,
              version: version
            }, options, callback);
          });
        };
      })(this);
      for (name in _ref) {
        version = _ref[name];
        _fn(name, version);
      }
      return async.waterfall(commands, callback);
    };

    Install.prototype.installDependencies = function(options, callback) {
      var commands;
      options.installGlobally = false;
      commands = [];
      commands.push(this.installNode);
      commands.push((function(_this) {
        return function(callback) {
          return _this.installModules(options, callback);
        };
      })(this));
      commands.push((function(_this) {
        return function(callback) {
          return _this.installPackageDependencies(options, callback);
        };
      })(this));
      return async.waterfall(commands, callback);
    };

    Install.prototype.getPackageDependencies = function() {
      var error, metadata, packageDependencies, _ref;
      try {
        metadata = fs.readFileSync('package.json', 'utf8');
        packageDependencies = ((_ref = JSON.parse(metadata)) != null ? _ref : {}).packageDependencies;
        return packageDependencies != null ? packageDependencies : {};
      } catch (_error) {
        error = _error;
        return {};
      }
    };

    Install.prototype.createAtomDirectories = function() {
      fs.makeTreeSync(this.atomDirectory);
      fs.makeTreeSync(this.atomPackagesDirectory);
      return fs.makeTreeSync(this.atomNodeDirectory);
    };

    Install.prototype.run = function(options) {
      var atIndex, callback, name, version, _ref;
      callback = options.callback;
      options = this.parseOptions(options.commandArgs);
      this.createAtomDirectories();
      name = (_ref = options.argv._[0]) != null ? _ref : '.';
      if (name === '.') {
        return this.installDependencies(options, callback);
      } else {
        atIndex = name.indexOf('@');
        if (atIndex > 0) {
          version = name.substring(atIndex + 1);
          name = name.substring(0, atIndex);
        }
        return this.installPackage({
          name: name,
          version: version
        }, options, callback);
      }
    };

    return Install;

  })(Command);

}).call(this);
