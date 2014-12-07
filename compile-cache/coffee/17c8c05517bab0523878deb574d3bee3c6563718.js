(function() {
  var BranchList, CommitList, CurrentBranch, ErrorView, FileList, Model, OutputView, Promise, Repo, fs, git, path, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  fs = require('fs');

  path = require('path');

  Model = require('backbone').Model;

  ErrorView = require('../views/error-view');

  OutputView = require('../views/output-view');

  Promise = (git = require('../git')).Promise;

  FileList = require('./files').FileList;

  _ref = require('./branches'), CurrentBranch = _ref.CurrentBranch, BranchList = _ref.BranchList;

  CommitList = require('./commits').CommitList;

  Repo = (function(_super) {
    __extends(Repo, _super);

    function Repo() {
      this.push = __bind(this.push, this);
      this.initiateGitCommand = __bind(this.initiateGitCommand, this);
      this.initiateCreateBranch = __bind(this.initiateCreateBranch, this);
      this.completeCommit = __bind(this.completeCommit, this);
      this.cleanupCommitMessageFile = __bind(this.cleanupCommitMessageFile, this);
      this.commitMessage = __bind(this.commitMessage, this);
      this.initiateCommit = __bind(this.initiateCommit, this);
      this.leaf = __bind(this.leaf, this);
      this.selection = __bind(this.selection, this);
      this.reload = __bind(this.reload, this);
      return Repo.__super__.constructor.apply(this, arguments);
    }

    Repo.prototype.initialize = function() {
      this.fileList = new FileList([]);
      this.branchList = new BranchList([]);
      this.commitList = new CommitList([]);
      this.currentBranch = new CurrentBranch(this.headRefsCount() > 0);
      return this.branchList.on('repaint', (function(_this) {
        return function() {
          _this.commitList.reload();
          return _this.currentBranch.reload();
        };
      })(this));
    };

    Repo.prototype.reload = function() {
      var promises;
      promises = [this.fileList.reload()];
      if (this.headRefsCount() > 0) {
        promises.push(this.branchList.reload());
        promises.push(this.commitList.reload());
        promises.push(this.currentBranch.reload());
      }
      return Promise.all(promises);
    };

    Repo.prototype.selection = function() {
      return this.activeList.selection();
    };

    Repo.prototype.leaf = function() {
      return this.activeList.leaf();
    };

    Repo.prototype.commitMessagePath = function() {
      var _ref1;
      return path.join((_ref1 = atom.project.getRepo()) != null ? _ref1.getWorkingDirectory() : void 0, '/.git/COMMIT_EDITMSG_ATOMATIGIT');
    };

    Repo.prototype.headRefsCount = function() {
      var _ref1, _ref2, _ref3, _ref4;
      return (_ref1 = (_ref2 = atom.project.getRepo()) != null ? (_ref3 = _ref2.getReferences()) != null ? (_ref4 = _ref3.heads) != null ? _ref4.length : void 0 : void 0 : void 0) != null ? _ref1 : 0;
    };

    Repo.prototype.fetch = function() {
      return git.cmd('fetch')["catch"](function(error) {
        return new ErrorView(error);
      });
    };

    Repo.prototype.stash = function() {
      return git.cmd('stash')["catch"](function(error) {
        return new ErrorView(error);
      });
    };

    Repo.prototype.stashPop = function() {
      return git.cmd('stash pop')["catch"](function(error) {
        return new ErrorView(error);
      });
    };

    Repo.prototype.initiateCommit = function() {
      var editorPromise, preCommitHook;
      preCommitHook = atom.config.get('atomatigit.pre_commit_hook');
      if ((preCommitHook != null ? preCommitHook.length : void 0) > 0) {
        atom.workspaceView.trigger(preCommitHook);
      }
      fs.writeFileSync(this.commitMessagePath(), this.commitMessage());
      editorPromise = atom.workspace.open(this.commitMessagePath(), {
        changeFocus: true
      });
      return editorPromise.then((function(_this) {
        return function(editor) {
          editor.setGrammar(atom.syntax.grammarForScopeName('text.git-commit'));
          editor.setCursorBufferPosition([0, 0]);
          return editor.buffer.on('saved', _this.completeCommit);
        };
      })(this));
    };

    Repo.prototype.commitMessage = function() {
      var filesStaged, filesUnstaged, filesUntracked, message;
      message = '\n' + ("# Please enter the commit message for your changes. Lines starting\n# with '#' will be ignored, and an empty message aborts the commit.\n# On branch " + (this.currentBranch.localName()) + "\n");
      filesStaged = this.fileList.staged();
      filesUnstaged = this.fileList.unstaged();
      filesUntracked = this.fileList.untracked();
      if (filesStaged.length >= 1) {
        message += '#\n# Changes to be committed:\n';
      }
      _.each(filesStaged, function(file) {
        return message += file.commitMessage();
      });
      if (filesUnstaged.length >= 1) {
        message += '#\n# Changes not staged for commit:\n';
      }
      _.each(filesUnstaged, function(file) {
        return message += file.commitMessage();
      });
      if (filesUntracked.length >= 1) {
        message += '#\n# Untracked files:\n';
      }
      _.each(filesUntracked, function(file) {
        return message += file.commitMessage();
      });
      return message;
    };

    Repo.prototype.cleanupCommitMessageFile = function() {
      if (atom.workspace.getActivePane().getItems().length > 1) {
        atom.workspace.destroyActivePaneItem();
      } else {
        atom.workspace.destroyActivePane();
      }
      try {
        return fs.unlinkSync(this.commitMessagePath());
      } catch (_error) {}
    };

    Repo.prototype.completeCommit = function() {
      return git.commit(this.commitMessagePath()).then(this.reload)["catch"](function(error) {
        return new ErrorView(error);
      })["finally"](this.cleanupCommitMessageFile);
    };

    Repo.prototype.initiateCreateBranch = function() {
      return this.trigger('needInput', {
        message: 'Branch name',
        callback: function(name) {
          return git.cmd("checkout -b " + name)["catch"](function(error) {
            return new ErrorView(error);
          });
        }
      });
    };

    Repo.prototype.initiateGitCommand = function() {
      return this.trigger('needInput', {
        message: 'Git command',
        callback: function(command) {
          return git.cmd(command).then(function(output) {
            return new OutputView(output);
          })["catch"](function(error) {
            return new ErrorView(error);
          });
        }
      });
    };

    Repo.prototype.push = function() {
      return this.currentBranch.push();
    };

    return Repo;

  })(Model);

  module.exports = Repo;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9IQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFVLE9BQUEsQ0FBUSxRQUFSLENBQVYsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBVSxPQUFBLENBQVEsSUFBUixDQURWLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQVUsT0FBQSxDQUFRLE1BQVIsQ0FGVixDQUFBOztBQUFBLEVBR0MsUUFBUyxPQUFBLENBQVEsVUFBUixFQUFULEtBSEQsQ0FBQTs7QUFBQSxFQUtBLFNBQUEsR0FBOEIsT0FBQSxDQUFRLHFCQUFSLENBTDlCLENBQUE7O0FBQUEsRUFNQSxVQUFBLEdBQThCLE9BQUEsQ0FBUSxzQkFBUixDQU45QixDQUFBOztBQUFBLEVBT0MsVUFBVyxDQUFBLEdBQUEsR0FBa0IsT0FBQSxDQUFRLFFBQVIsQ0FBbEIsRUFBWCxPQVBELENBQUE7O0FBQUEsRUFRQyxXQUE2QixPQUFBLENBQVEsU0FBUixFQUE3QixRQVJELENBQUE7O0FBQUEsRUFTQSxPQUE4QixPQUFBLENBQVEsWUFBUixDQUE5QixFQUFDLHFCQUFBLGFBQUQsRUFBZ0Isa0JBQUEsVUFUaEIsQ0FBQTs7QUFBQSxFQVVDLGFBQTZCLE9BQUEsQ0FBUSxXQUFSLEVBQTdCLFVBVkQsQ0FBQTs7QUFBQSxFQWFNO0FBRUosMkJBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7S0FBQTs7QUFBQSxtQkFBQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsTUFBQSxJQUFDLENBQUEsUUFBRCxHQUFxQixJQUFBLFFBQUEsQ0FBUyxFQUFULENBQXJCLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxVQUFELEdBQXFCLElBQUEsVUFBQSxDQUFXLEVBQVgsQ0FEckIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFVBQUQsR0FBcUIsSUFB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
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/repo.coffee