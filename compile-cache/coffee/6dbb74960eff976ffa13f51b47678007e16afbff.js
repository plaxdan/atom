(function() {
  var GitCommit, StatusView, fs, git, os, path;

  fs = require('fs-plus');

  path = require('path');

  os = require('os');

  git = require('../git');

  StatusView = require('../views/status-view');

  module.exports = GitCommit = (function() {
    GitCommit.prototype.subscriptions = [];

    GitCommit.prototype.setCommentChar = function(char) {
      if (char === '') {
        char = '#';
      }
      return this.commentchar = char;
    };

    GitCommit.prototype.file = function() {
      if (this.submodule != null ? this.submodule : this.submodule = git.getSubmodule()) {
        return 'COMMIT_EDITMSG';
      } else {
        return '.git/COMMIT_EDITMSG';
      }
    };

    GitCommit.prototype.dir = function() {
      var _ref, _ref1;
      if (this.submodule != null ? this.submodule : this.submodule = git.getSubmodule()) {
        return this.submodule.getPath();
      } else {
        return (_ref = (_ref1 = atom.project.getRepo()) != null ? _ref1.getWorkingDirectory() : void 0) != null ? _ref : atom.project.getPath();
      }
    };

    GitCommit.prototype.filePath = function() {
      return path.join(this.dir(), this.file());
    };

    GitCommit.prototype.currentPane = atom.workspace.getActivePane();

    function GitCommit(amend) {
      this.amend = amend != null ? amend : '';
      this.isAmending = this.amend.length > 0;
      git.cmd({
        args: ['config', '--get', 'core.commentchar'],
        stdout: (function(_this) {
          return function(data) {
            return _this.setCommentChar(data.trim());
          };
        })(this),
        stderr: (function(_this) {
          return function() {
            return _this.setCommentChar('#');
          };
        })(this)
      });
      git.stagedFiles((function(_this) {
        return function(files) {
          if (_this.amend !== '' || files.length >= 1) {
            return git.cmd({
              args: ['status'],
              stdout: function(data) {
                return _this.prepFile(data);
              }
            });
          } else {
            _this.cleanup();
            return new StatusView({
              type: 'error',
              message: 'Nothing to commit.'
            });
          }
        };
      })(this));
    }

    GitCommit.prototype.prepFile = function(status) {
      status = status.replace(/\s*\(.*\)\n/g, '');
      status = status.trim().replace(/\n/g, "\n" + this.commentchar + " ");
      fs.writeFileSync(this.filePath(), "" + this.amend + "\n" + this.commentchar + " Please enter the commit message for your changes. Lines starting\n" + this.commentchar + " with '" + this.commentchar + "' will be ignored, and an empty message aborts the commit.\n" + this.commentchar + "\n" + this.commentchar + " " + status);
      return this.showFile();
    };

    GitCommit.prototype.showFile = function() {
      var split;
      split = atom.config.get('git-plus.openInPane') ? atom.config.get('git-plus.splitPane') : void 0;
      return atom.workspace.open(this.filePath(), {
        split: split,
        activatePane: true,
        searchAllPanes: true
      }).done((function(_this) {
        return function(_arg) {
          var buffer;
          buffer = _arg.buffer;
          _this.subscriptions.push(buffer.onDidSave(function() {
            return _this.commit();
          }));
          return _this.subscriptions.push(buffer.onDidDestroy(function() {
            if (_this.isAmending) {
              return _this.undoAmend();
            } else {
              return _this.cleanup();
            }
          }));
        };
      })(this));
    };

    GitCommit.prototype.commit = function() {
      var args;
      args = ['commit', '--cleanup=strip', "--file=" + (this.filePath())];
      return git.cmd({
        args: args,
        options: {
          cwd: this.dir()
        },
        stdout: (function(_this) {
          return function(data) {
            var _ref;
            new StatusView({
              type: 'success',
              message: data
            });
            _this.isAmending = false;
            _this.destroyActiveEditorView();
            if ((_ref = atom.project.getRepo()) != null) {
              _ref.refreshStatus();
            }
            _this.currentPane.activate();
            return git.refresh();
          };
        })(this),
        stderr: (function(_this) {
          return function(err) {
            return _this.destroyActiveEditorView();
          };
        })(this)
      });
    };

    GitCommit.prototype.destroyActiveEditorView = function() {
      if (atom.workspace.getActivePane().getItems().length > 1) {
        return atom.workspace.destroyActivePaneItem();
      } else {
        return atom.workspace.destroyActivePane();
      }
    };

    GitCommit.prototype.undoAmend = function(err) {
      if (err == null) {
        err = '';
      }
      return git.cmd({
        args: ['reset', 'ORIG_HEAD'],
        stdout: function() {
          return new StatusView({
            type: 'error',
            message: "" + (err + ': ') + "Commit amend aborted!"
          });
        },
        stderr: function() {
          return new StatusView({
            type: 'error',
            message: 'ERROR! Undoing the amend failed! Please fix your repository manually!'
          });
        },
        exit: (function(_this) {
          return function() {
            _this.isAmending = false;
            return _this.destroyActiveEditorView();
          };
        })(this)
      });
    };

    GitCommit.prototype.cleanup = function() {
      var s, _i, _len, _ref;
      this.currentPane.activate();
      _ref = this.subscriptions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        s = _ref[_i];
        s.dispose();
      }
      try {
        return fs.unlinkSync(this.filePath());
      } catch (_error) {}
    };

    return GitCommit;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdDQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFFQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FGTCxDQUFBOztBQUFBLEVBSUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBSk4sQ0FBQTs7QUFBQSxFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsc0JBQVIsQ0FMYixDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHdCQUFBLGFBQUEsR0FBZSxFQUFmLENBQUE7O0FBQUEsd0JBSUEsY0FBQSxHQUFnQixTQUFDLElBQUQsR0FBQTtBQUNkLE1BQUEsSUFBRyxJQUFBLEtBQVEsRUFBWDtBQUFtQixRQUFBLElBQUEsR0FBTyxHQUFQLENBQW5CO09BQUE7YUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlLEtBRkQ7SUFBQSxDQUpoQixDQUFBOztBQUFBLHdCQVlBLElBQUEsR0FBTSxTQUFBLEdBQUE7QUFFSixNQUFBLDZCQUFHLElBQUMsQ0FBQSxZQUFELElBQUMsQ0FBQSxZQUFhLEdBQUcsQ0FBQyxZQUFKLENBQUEsQ0FBakI7ZUFDRSxpQkFERjtPQUFBLE1BQUE7ZUFHRSxzQkFIRjtPQUZJO0lBQUEsQ0FaTixDQUFBOztBQUFBLHdCQXNCQSxHQUFBLEdBQUssU0FBQSxHQUFBO0FBRUgsVUFBQSxXQUFBO0FBQUEsTUFBQSw2QkFBRyxJQUFDLENBQUEsWUFBRCxJQUFDLENBQUEsWUFBYSxHQUFHLENBQUMsWUFBSixDQUFBLENBQWpCO2VBQ0UsSUFBQyxDQUFBLFNBQVMsQ0FBQyxPQUFYLENBQUEsRUFERjtPQUFBLE1BQUE7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
//# sourceURL=/Users/daniel/.atom/packages/git-plus/lib/models/git-commit.coffee