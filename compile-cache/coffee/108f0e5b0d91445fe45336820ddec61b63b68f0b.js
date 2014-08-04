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
      if (this.assignId() !== 1) {
        return;
      }
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
      status = status.trim().replace(/\n/g, "\n# ");
      fs.writeFileSync(this.filePath(), "" + this.amend + "\n# Please enter the commit message for your changes. Lines starting\n# with '#' will be ignored, and an empty message aborts the commit.\n#\n# " + status);
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
            if (_this.amend === '') {
              return _this.cleanup();
            } else {
              return _this.undoAmend();
            }
          });
        };
      })(this));
    };

    GitCommit.prototype.commit = function() {
      var args;
      args = ['commit', '--cleanup=strip', "--file=" + (this.filePath())];
      if (this.amend !== '') {
        args.push('--amend');
      }
      this.amend = '';
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
            if (atom.workspace.getActivePane().getItems().length > 1) {
              atom.workspace.destroyActivePaneItem();
            } else {
              atom.workspace.destroyActivePane();
            }
            if ((_ref = atom.project.getRepo()) != null) {
              _ref.refreshStatus();
            }
            return _this.currentPane.activate();
          };
        })(this)
      });
    };

    GitCommit.prototype.undoAmend = function() {
      return git.cmd({
        args: ['reset', 'HEAD@{1}'],
        stdout: (function(_this) {
          return function() {
            new StatusView({
              type: 'error',
              message: 'Commit amend aborted!'
            });
            return _this.cleanup();
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLFNBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUZMLENBQUE7O0FBQUEsRUFHQyxRQUFTLE9BQUEsQ0FBUSxVQUFSLEVBQVQsS0FIRCxDQUFBOztBQUFBLEVBS0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBTE4sQ0FBQTs7QUFBQSxFQU1BLFVBQUEsR0FBYSxPQUFBLENBQVEsc0JBQVIsQ0FOYixDQUFBOztBQUFBLEVBUUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUVKLGdDQUFBLENBQUE7O0FBQUEsd0JBQUEsSUFBQSxHQUFNLFNBQUEsR0FBQTtBQUVKLE1BQUEsNkJBQUcsSUFBQyxDQUFBLFlBQUQsSUFBQyxDQUFBLFlBQWEsR0FBRyxDQUFDLFlBQUosQ0FBQSxDQUFqQjtlQUNFLGlCQURGO09BQUEsTUFBQTtlQUdFLHNCQUhGO09BRkk7SUFBQSxDQUFOLENBQUE7O0FBQUEsd0JBT0EsR0FBQSxHQUFLLFNBQUEsR0FBQTtBQUVILFVBQUEsV0FBQTtBQUFBLE1BQUEsNkJBQUcsSUFBQyxDQUFBLFlBQUQsSUFBQyxDQUFBLFlBQWEsR0FBRyxDQUFDLFlBQUosQ0FBQSxDQUFqQjtlQUNFLElBQUMsQ0FBQSxTQUFTLENBQUMsT0FBWCxDQUFBLEVBREY7T0FBQSxNQUFBO3lIQUdrRCxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQWIsQ0FBQSxFQUhsRDtPQUZHO0lBQUEsQ0FQTCxDQUFBOztBQUFBLHdCQWNBLFFBQUEsR0FBVSxTQUFBLEdBQUE7YUFBRyxJQUFJLENBQUMs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
//# sourceURL=/Users/daniel/.atom/packages/git-plus/lib/models/git-commit.coffee