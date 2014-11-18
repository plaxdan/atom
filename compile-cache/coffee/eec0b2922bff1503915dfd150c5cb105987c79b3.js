(function() {
  var GitCommit, Model, StatusView, fs, git, os, path,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  fs = require('fs-plus');

  path = require('path');

  os = require('os');

  Model = require('theorist').Model;

  git = require('../git');

  StatusView = require('../views/status-view');

  module.exports = GitCommit = (function(_super) {
    __extends(GitCommit, _super);

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
      GitCommit.__super__.constructor.apply(this, arguments);

      /* TODO: Remove theorist dependency.
       *     Highly redundant. atom won't open another editor
       *     if 'searchAllPanes' is true in line 98
       */
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
          _this.subscribe(buffer, 'saved', function() {
            return _this.commit();
          });
          return _this.subscribe(buffer, 'destroyed', function() {
            if (_this.isAmending) {
              return _this.undoAmend();
            } else {
              return _this.cleanup();
            }
          });
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
      Model.resetNextInstanceId();
      this.destroy();
      this.currentPane.activate();
      try {
        return fs.unlinkSync(this.filePath());
      } catch (_error) {}
    };

    return GitCommit;

  })(Model);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUZMLENBQUE7O0FBQUEsRUFHQyxRQUFTLE9BQUEsQ0FBUSxVQUFSLEVBQVQsS0FIRCxDQUFBOztBQUFBLEVBS0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBTE4sQ0FBQTs7QUFBQSxFQU1BLFVBQUEsR0FBYSxPQUFBLENBQVEsc0JBQVIsQ0FOYixDQUFBOztBQUFBLEVBUUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUdKLGdDQUFBLENBQUE7O0FBQUEsd0JBQUEsY0FBQSxHQUFnQixTQUFDLElBQUQsR0FBQTtBQUNkLE1BQUEsSUFBRyxJQUFBLEtBQVEsRUFBWDtBQUNFLFFBQUEsSUFBQSxHQUFPLEdBQVAsQ0FERjtPQUFBO2FBRUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxLQUhEO0lBQUEsQ0FBaEIsQ0FBQTs7QUFBQSx3QkFTQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBRUosTUFBQSw2QkFBRyxJQUFDLENBQUEsWUFBRCxJQUFDLENBQUEsWUFBYSxHQUFHLENBQUMsWUFBSixDQUFBLENBQWpCO2VBQ0UsaUJBREY7T0FBQSxNQUFBO2VBR0Usc0JBSEY7T0FGSTtJQUFBLENBVE4sQ0FBQTs7QUFBQSx3QkFtQkEsR0FBQSxHQUFLLFNBQUEsR0FBQTtBQUVILFVBQUEsV0FBQTtBQUFBLE1BQUEsNkJBQUcsSUFBQyxDQUFBLFlBQUQsSUFBQyxDQUFBLFlBQWEsR0FBRyxDQUFDLFlBQUosQ0FBQSxDQUFqQjtlQUNFLElBQUMs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
//# sourceURL=/Users/daniel/.atom/packages/git-plus/lib/models/git-commit.coffee