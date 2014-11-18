(function() {
  var GitCommit, StatusView, fs, git, os, path;

  fs = require('fs-plus');

  path = require('path');

  os = require('os');

  git = require('../git');

  StatusView = require('../views/status-view');

  module.exports = GitCommit = (function() {
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
          _this.subscriptions = [];
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdDQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFFQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FGTCxDQUFBOztBQUFBLEVBSUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBSk4sQ0FBQTs7QUFBQSxFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsc0JBQVIsQ0FMYixDQUFBOztBQUFBLEVBT0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUdKLHdCQUFBLGNBQUEsR0FBZ0IsU0FBQyxJQUFELEdBQUE7QUFDZCxNQUFBLElBQUcsSUFBQSxLQUFRLEVBQVg7QUFBbUIsUUFBQSxJQUFBLEdBQU8sR0FBUCxDQUFuQjtPQUFBO2FBQ0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxLQUZEO0lBQUEsQ0FBaEIsQ0FBQTs7QUFBQSx3QkFRQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBRUosTUFBQSw2QkFBRyxJQUFDLENBQUEsWUFBRCxJQUFDLENBQUEsWUFBYSxHQUFHLENBQUMsWUFBSixDQUFBLENBQWpCO2VBQ0UsaUJBREY7T0FBQSxNQUFBO2VBR0Usc0JBSEY7T0FGSTtJQUFBLENBUk4sQ0FBQTs7QUFBQSx3QkFrQkEsR0FBQSxHQUFLLFNBQUEsR0FBQTtBQUVILFVBQUEsV0FBQTtBQUFBLE1BQUEsNkJBQUcsSUFBQyxDQUFBLFlBQUQsSUFBQyxDQUFBLFlBQWEsR0FBRyxDQUFDLFlBQUosQ0FBQSxDQUFqQjtlQUNFLElBQUMsQ0FBQSxTQUFTLENBQUMsT0FBWCxDQUFBLEVBREY7T0FBQSxNQUFBO3lIQUdrRCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQWIs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
//# sourceURL=/Users/daniel/.atom/packages/git-plus/lib/models/git-commit.coffee