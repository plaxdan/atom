(function() {
  var BufferedProcess, GitBridge, fs, path;

  BufferedProcess = require('atom').BufferedProcess;

  fs = require('fs');

  path = require('path');

  module.exports = GitBridge = (function() {
    GitBridge.process = function(args) {
      return new BufferedProcess(args);
    };

    function GitBridge() {}

    GitBridge._gitCommand = function() {
      return atom.config.get('merge-conflicts.gitPath');
    };

    GitBridge._repoWorkDir = function() {
      var _ref;
      return (_ref = atom.project.getRepo()) != null ? _ref.getWorkingDirectory() : void 0;
    };

    GitBridge._repoGitDir = function() {
      var _ref;
      return (_ref = atom.project.getRepo()) != null ? _ref.getPath() : void 0;
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
      var conflicts, exitHandler, stderrHandler, stdoutHandler;
      conflicts = [];
      stdoutHandler = (function(_this) {
        return function(chunk) {
          return _this._statusCodesFrom(chunk, function(index, work, p) {
            if (index === 'U' && work === 'U') {
              return conflicts.push(p);
            }
          });
        };
      })(this);
      stderrHandler = function(line) {
        return console.log("git status error: " + line);
      };
      exitHandler = function(code) {
        if (code !== 0) {
          throw new Error("git status exit: " + code);
        }
        return handler(conflicts);
      };
      return this.process({
        command: this._gitCommand(),
        args: ['status', '--porcelain'],
        options: {
          cwd: this._repoWorkDir()
        },
        stdout: stdoutHandler,
        stderr: stderrHandler,
        exit: exitHandler
      });
    };

    GitBridge.isStaged = function(filepath, handler) {
      var exitHandler, staged, stderrHandler, stdoutHandler;
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
        if (code !== 0) {
          throw Error("git status exit: " + code);
        }
        return handler(staged);
      };
      return this.process({
        command: this._gitCommand(),
        args: ['status', '--porcelain', filepath],
        options: {
          cwd: this._repoWorkDir()
        },
        stdout: stdoutHandler,
        stderr: stderrHandler,
        exit: exitHandler
      });
    };

    GitBridge.checkoutSide = function(sideName, filepath, callback) {
      return this.process({
        command: this._gitCommand(),
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
          if (code !== 0) {
            throw Error("git checkout exit: " + code);
          }
          return callback();
        }
      });
    };

    GitBridge.add = function(filepath, callback) {
      return this.process({
        command: this._gitCommand(),
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
            throw Error("git add failed: exit code " + code);
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

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9DQUFBOztBQUFBLEVBQUMsa0JBQW1CLE9BQUEsQ0FBUSxNQUFSLEVBQW5CLGVBQUQsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQURMLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUdKLElBQUEsU0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLElBQUQsR0FBQTthQUFjLElBQUEsZUFBQSxDQUFnQixJQUFoQixFQUFkO0lBQUEsQ0FBVixDQUFBOztBQUVhLElBQUEsbUJBQUEsR0FBQSxDQUZiOztBQUFBLElBSUEsU0FBQyxDQUFBLFdBQUQsR0FBYyxTQUFBLEdBQUE7YUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IseUJBQWhCLEVBQUg7SUFBQSxDQUpkLENBQUE7O0FBQUEsSUFNQSxTQUFDLENBQUEsWUFBRCxHQUFlLFNBQUEsR0FBQTtBQUFHLFVBQUEsSUFBQTsyREFBc0IsQ0FBRSxtQkFBeEIsQ0FBQSxXQUFIO0lBQUEsQ0FOZixDQUFBOztBQUFBLElBUUEsU0FBQyxDQUFBLFdBQUQsR0FBYyxTQUFBLEdBQUE7QUFBRyxVQUFBLElBQUE7MkRBQXNCLENBQUUsT0FBeEIsQ0FBQSxXQUFIO0lBQUEsQ0FSZCxDQUFBOztBQUFBLElBVUEsU0FBQyxDQUFBLGdCQUFELEdBQW1CLFNBQUMsS0FBRCxFQUFRLE9BQVIsR0FBQTtBQUNqQixVQUFBLDZEQUFBO0FBQUE7QUFBQTtXQUFBLDJDQUFBO3dCQUFBO0FBQ0UsUUFBQSxDQUFBLEdBQUksSUFBSSxDQUFDLEtBQUwsQ0FBVyxlQUFYLENBQUosQ0FBQTtBQUNBLFFBQUEsSUFBRyxDQUFI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
//# sourceURL=/Users/daniel/.atom/packages/merge-conflicts/lib/git-bridge.coffee