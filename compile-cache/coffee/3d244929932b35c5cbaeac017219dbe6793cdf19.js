(function() {
  var BranchList, CommitList, CurrentBranch, FileList, Model, Repo, fs, git, path, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore');

  fs = require('fs');

  path = require('path');

  Model = require('backbone').Model;

  git = require('../git').git;

  FileList = require('./files').FileList;

  _ref = require('./branches'), CurrentBranch = _ref.CurrentBranch, BranchList = _ref.BranchList;

  CommitList = require('./commits').CommitList;

  module.exports = Repo = (function(_super) {
    __extends(Repo, _super);

    function Repo() {
      this.writeCommitMessage = __bind(this.writeCommitMessage, this);
      this.reload = __bind(this.reload, this);
      return Repo.__super__.constructor.apply(this, arguments);
    }

    Repo.prototype.initialize = function(opts) {
      this.file_list = new FileList([]);
      this.branch_list = new BranchList([]);
      this.commit_list = new CommitList([]);
      this.current_branch = new CurrentBranch(this.headRefsCount() > 0);
      return git.on("reload", this.reload);
    };

    Repo.prototype.reload = function() {
      git.setPath();
      this.file_list.reload();
      if (this.headRefsCount() > 0) {
        this.current_branch.reload();
        this.branch_list.reload();
        return this.commit_list.reload(this.current_branch);
      }
    };

    Repo.prototype.selection = function() {
      return this.active_list.selection();
    };

    Repo.prototype.leaf = function() {
      return this.active_list.leaf();
    };

    Repo.prototype.commitMessagePath = function() {
      var _ref1;
      return path.join((_ref1 = atom.project.getRepo()) != null ? _ref1.getWorkingDirectory() : void 0, '/.git/COMMIT_EDITMSG_ATOMATIGIT');
    };

    Repo.prototype.headRefsCount = function() {
      return atom.project.getRepo().getReferences().heads.length;
    };

    Repo.prototype.fetch = function() {
      git.incrementTaskCounter();
      return git.remoteFetch("origin", function() {
        return git.decrementTaskCounter();
      });
    };

    Repo.prototype.checkoutBranch = function() {
      return this.branch_list.checkout_branch;
    };

    Repo.prototype.stash = function() {
      return git.git("stash");
    };

    Repo.prototype.stashPop = function() {
      return git.git("stash pop");
    };

    Repo.prototype.initiateCommit = function() {
      var editor;
      git.incrementTaskCounter();
      if (atom.config.get("atomatigit.pre_commit_hook") !== "") {
        atom.workspaceView.trigger(atom.config.get("atomatigit.pre_commit_hook"));
      }
      fs.writeFileSync(this.commitMessagePath(), '');
      editor = atom.workspace.open(this.commitMessagePath(), {
        changeFocus: true
      });
      return editor.then((function(_this) {
        return function(result) {
          return _this.writeCommitMessage(result);
        };
      })(this));
    };

    Repo.prototype.writeCommitMessage = function(editor) {
      var commitMessage, file, filesStaged, filesUnstaged, filesUntracked, _i, _j, _k, _len, _len1, _len2;
      commitMessage = '\n' + ("# Please enter the commit message for your changes. Lines starting\n# with '#' will be ignored, and an empty message aborts the commit.\n# On branch " + (this.current_branch.localName()) + "\n");
      filesStaged = this.file_list.staged();
      filesUnstaged = this.file_list.unstaged();
      filesUntracked = this.file_list.untracked();
      if (filesStaged.length >= 1) {
        commitMessage += "#\n# Changes to be committed:\n";
      }
      for (_i = 0, _len = filesStaged.length; _i < _len; _i++) {
        file = filesStaged[_i];
        commitMessage += file.commitMessage();
      }
      if (filesUnstaged.length >= 1) {
        commitMessage += "#\n# Changes not staged for commit:\n";
      }
      for (_j = 0, _len1 = filesUnstaged.length; _j < _len1; _j++) {
        file = filesUnstaged[_j];
        commitMessage += file.commitMessage();
      }
      if (filesUntracked.length >= 1) {
        commitMessage += "#\n# Untracked files:\n";
      }
      for (_k = 0, _len2 = filesUntracked.length; _k < _len2; _k++) {
        file = filesUntracked[_k];
        commitMessage += file.commitMessage();
      }
      editor.setGrammar(atom.syntax.grammarForScopeName('text.git-commit'));
      editor.setText(commitMessage);
      return editor.setCursorBufferPosition([0, 0]);
    };

    Repo.prototype.completeCommit = function() {
      git.git("commit --cleanup=strip --file=\"" + (this.commitMessagePath()) + "\"");
      return git.decrementTaskCounter();
    };

    Repo.prototype.initiateCreateBranch = function() {
      return this.trigger("need_input", {
        query: "Branch name",
        callback: function(name) {
          return git.createBranch(name, function() {
            return git.git("checkout " + name);
          });
        }
      });
    };

    Repo.prototype.initiateGitCommand = function() {
      return this.trigger("need_input", {
        query: "Git command",
        callback: function(command) {
          return git.git(command);
        }
      });
    };

    Repo.prototype.push = function() {
      return this.current_branch.push();
    };

    return Repo;

  })(Model);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9GQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxZQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQURMLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0MsUUFBUyxPQUFBLENBQVEsVUFBUixFQUFULEtBSEQsQ0FBQTs7QUFBQSxFQUtDLE1BQU8sT0FBQSxDQUFRLFFBQVIsRUFBUCxHQUxELENBQUE7O0FBQUEsRUFNQyxXQUFZLE9BQUEsQ0FBUSxTQUFSLEVBQVosUUFORCxDQUFBOztBQUFBLEVBT0EsT0FBOEIsT0FBQSxDQUFRLFlBQVIsQ0FBOUIsRUFBQyxxQkFBQSxhQUFELEVBQWdCLGtCQUFBLFVBUGhCLENBQUE7O0FBQUEsRUFRQyxhQUFjLE9BQUEsQ0FBUSxXQUFSLEVBQWQsVUFSRCxDQUFBOztBQUFBLEVBVUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLDJCQUFBLENBQUE7Ozs7OztLQUFBOztBQUFBLG1CQUFBLFVBQUEsR0FBWSxTQUFDLElBQUQsR0FBQTtBQUNWLE1BQUEsSUFBQyxDQUFBLFNBQUQsR0FBaUIsSUFBQSxRQUFBLENBQVMsRUFBVCxDQUFqQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsV0FBRCxHQUFtQixJQUFBLFVBQUEsQ0FBVyxFQUFYLENBRG5CLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxXQUFELEdBQW1CLElBQUEsVUFBQSxDQUFXLEVBQVgsQ0FGbkIsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLGNBQUQsR0FBc0IsSUFBQSxhQUFBLENBQWMsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFBLEdBQW1CLENB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
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/repo.coffee