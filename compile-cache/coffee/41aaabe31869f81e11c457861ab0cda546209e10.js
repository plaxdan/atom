(function() {
  var BufferedProcess, GitBridge, GitCmd, GitNotFoundError, fs, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BufferedProcess = require('atom').BufferedProcess;

  fs = require('fs');

  path = require('path');

  GitNotFoundError = (function(_super) {
    __extends(GitNotFoundError, _super);

    function GitNotFoundError(message) {
      this.name = 'GitNotFoundError';
      GitNotFoundError.__super__.constructor.call(this, message);
    }

    return GitNotFoundError;

  })(Error);

  GitCmd = null;

  GitBridge = (function() {
    GitBridge.process = function(args) {
      return new BufferedProcess(args);
    };

    function GitBridge() {}

    GitBridge.locateGitAnd = function(callback) {
      var exitHandler, possiblePath, search;
      possiblePath = atom.config.get('merge-conflicts.gitPath');
      if (possiblePath) {
        GitCmd = possiblePath;
        callback(null);
        return;
      }
      search = ['git', '/usr/local/bin/git', 'C:\\Program Files (x86)\\Git\\bin\\git'];
      possiblePath = search.shift();
      exitHandler = (function(_this) {
        return function(code) {
          if (code === 0) {
            GitCmd = possiblePath;
            callback(null);
            return;
          }
          possiblePath = search.shift();
          if (possiblePath == null) {
            callback(new GitNotFoundError("Please set the 'Git Path' correctly in the Atom settings ", "for the Merge Conflicts package."));
            return;
          }
          return _this.process({
            command: possiblePath,
            args: ['--version'],
            exit: exitHandler
          });
        };
      })(this);
      return this.process({
        command: possiblePath,
        args: ['--version'],
        exit: exitHandler
      });
    };

    GitBridge._repoWorkDir = function() {
      return atom.project.getRepositories()[0].getWorkingDirectory();
    };

    GitBridge._repoGitDir = function() {
      return atom.project.getRepositories()[0].getPath();
    };

    GitBridge._statusCodesFrom = function(chunk, handler) {
      var indexCode, line, m, p, workCode, __, _i, _len, _ref, _results;
      _ref = chunk.split("\n");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        m = line.match(/^(.)(.) (.+)$/);
        if (m) {
          __ = m[0], indexCode = m[1], workCode = m[2], p = m[3];
          _results.push(handler(indexCode, workCode, p));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    GitBridge.withConflicts = function(handler) {
      var conflicts, errMessage, exitHandler, proc, stderrHandler, stdoutHandler;
      conflicts = [];
      errMessage = [];
      stdoutHandler = (function(_this) {
        return function(chunk) {
          return _this._statusCodesFrom(chunk, function(index, work, p) {
            if (index === 'U' && work === 'U') {
              conflicts.push({
                path: p,
                message: 'both modified'
              });
            }
            if (index === 'A' && work === 'A') {
              return conflicts.push({
                path: p,
                message: 'both added'
              });
            }
          });
        };
      })(this);
      stderrHandler = function(line) {
        return errMessage.push(line);
      };
      exitHandler = function(code) {
        if (code === 0) {
          return handler(null, conflicts);
        } else {
          return handler(new Error(("abnormal git exit: " + code + "\n") + errMessage.join("\n")), null);
        }
      };
      proc = this.process({
        command: GitCmd,
        args: ['status', '--porcelain'],
        options: {
          cwd: this._repoWorkDir()
        },
        stdout: stdoutHandler,
        stderr: stderrHandler,
        exit: exitHandler
      });
      return proc.process.on('error', function(err) {
        return handler(new GitNotFoundError(errMessage.join("\n")), null);
      });
    };

    GitBridge.isStaged = function(filepath, handler) {
      var exitHandler, proc, staged, stderrHandler, stdoutHandler;
      staged = true;
      stdoutHandler = (function(_this) {
        return function(chunk) {
          return _this._statusCodesFrom(chunk, function(index, work, p) {
            if (p === filepath) {
              return staged = index === 'M' && work === ' ';
            }
          });
        };
      })(this);
      stderrHandler = function(chunk) {
        return console.log("git status error: " + chunk);
      };
      exitHandler = function(code) {
        if (code === 0) {
          return handler(null, staged);
        } else {
          return handler(new Error("git status exit: " + code), null);
        }
      };
      proc = this.process({
        command: GitCmd,
        args: ['status', '--porcelain', filepath],
        options: {
          cwd: this._repoWorkDir()
        },
        stdout: stdoutHandler,
        stderr: stderrHandler,
        exit: exitHandler
      });
      return proc.process.on('error', function(err) {
        return handler(new GitNotFoundError, null);
      });
    };

    GitBridge.checkoutSide = function(sideName, filepath, callback) {
      var proc;
      proc = this.process({
        command: GitCmd,
        args: ['checkout', "--" + sideName, filepath],
        options: {
          cwd: this._repoWorkDir()
        },
        stdout: function(line) {
          return console.log(line);
        },
        stderr: function(line) {
          return console.log(line);
        },
        exit: function(code) {
          if (code === 0) {
            return callback(null);
          } else {
            return callback(new Error("git checkout exit: " + code));
          }
        }
      });
      return proc.process.on('error', function(err) {
        return callback(new GitNotFoundError);
      });
    };

    GitBridge.add = function(filepath, callback) {
      return this.process({
        command: GitCmd,
        args: ['add', filepath],
        options: {
          cwd: this._repoWorkDir()
        },
        stdout: function(line) {
          return console.log(line);
        },
        stderr: function(line) {
          return console.log(line);
        },
        exit: function(code) {
          if (code === 0) {
            return callback();
          } else {
            return callback(new Error("git add failed: exit code " + code));
          }
        }
      });
    };

    GitBridge.isRebasing = function() {
      var irebaseDir, irebaseStat, rebaseDir, rebaseStat, root;
      root = this._repoGitDir();
      if (root == null) {
        return false;
      }
      rebaseDir = path.join(root, 'rebase-apply');
      rebaseStat = fs.statSyncNoException(rebaseDir);
      if (rebaseStat && rebaseStat.isDirectory()) {
        return true;
      }
      irebaseDir = path.join(root, 'rebase-merge');
      irebaseStat = fs.statSyncNoException(irebaseDir);
      return irebaseStat && irebaseStat.isDirectory();
    };

    return GitBridge;

  })();

  module.exports = {
    GitBridge: GitBridge,
    GitNotFoundError: GitNotFoundError
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhEQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxrQkFBbUIsT0FBQSxDQUFRLE1BQVIsRUFBbkIsZUFBRCxDQUFBOztBQUFBLEVBQ0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBREwsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUZQLENBQUE7O0FBQUEsRUFJTTtBQUVKLHVDQUFBLENBQUE7O0FBQWEsSUFBQSwwQkFBQyxPQUFELEdBQUE7QUFDWCxNQUFBLElBQUMsQ0FBQSxJQUFELEdBQVEsa0JBQVIsQ0FBQTtBQUFBLE1BQ0Esa0RBQU0sT0FBTixDQURBLENBRFc7SUFBQSxDQUFiOzs0QkFBQTs7S0FGNkIsTUFKL0IsQ0FBQTs7QUFBQSxFQVdBLE1BQUEsR0FBUyxJQVhULENBQUE7O0FBQUEsRUFjTTtBQUdKLElBQUEsU0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLElBQUQsR0FBQTthQUFjLElBQUEsZUFBQSxDQUFnQixJQUFoQixFQUFkO0lBQUEsQ0FBVixDQUFBOztBQUVhLElBQUEsbUJBQUEsR0FBQSxDQUZiOztBQUFBLElBSUEsU0FBQyxDQUFBLFlBQUQsR0FBZSxTQUFDLFFBQUQsR0FBQTtBQUViLFVBQUEsaUNBQUE7QUFBQSxNQUFBLFlBQUEsR0FBZSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IseUJBQWhCLENBQWYsQ0FBQTtBQUNBLE1BQUEsSUFBRyxZQUFIO0FBQ0UsUUFBQSxNQUFBLEdBQVMsWUFBVCxDQUFBO0FBQUEsUUFDQSxRQUFBLENBQVMsSUFBVCxDQURBLENBQUE7QUFFQSxjQUFBLENBSEY7T0FEQTtBQUFBLE1BTUEsTUFBQSxHQUFTLENBQ1AsS0FETyxFQUVQLG9CQUZPLEVBR1Asd0NBSE8sQ0FOVCxDQUFB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
//# sourceURL=/Users/daniel/.atom/packages/merge-conflicts/lib/git-bridge.coffee