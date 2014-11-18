(function() {
  var $, git;

  $ = require('atom').$;

  git = require('./git');

  module.exports = {
    configDefaults: {
      includeStagedDiff: true,
      openInPane: true,
      splitPane: 'right',
      wordDiff: true,
      amountOfCommitsToShow: 25,
      gitPath: 'git',
      messageTimeout: 5
    },
    activate: function(state) {
      var GitAdd, GitAddAllAndCommit, GitAddAndCommit, GitBranch, GitCheckoutAllFiles, GitCheckoutCurrentFile, GitCherryPick, GitCommit, GitCommitAmend, GitDiff, GitDiffAll, GitFetch, GitInit, GitLog, GitPull, GitPush, GitRemove, GitRun, GitShow, GitStageFiles, GitStageHunk, GitStashApply, GitStashDrop, GitStashPop, GitStashSave, GitStatus, GitTags, GitUnstageFiles;
      GitAdd = require('./models/git-add');
      GitAddAllAndCommit = require('./models/git-add-all-and-commit');
      GitAddAndCommit = require('./models/git-add-and-commit');
      GitBranch = require('./models/git-branch');
      GitCheckoutAllFiles = require('./models/git-checkout-all-files');
      GitCheckoutCurrentFile = require('./models/git-checkout-current-file');
      GitCherryPick = require('./models/git-cherry-pick');
      GitCommit = require('./models/git-commit');
      GitCommitAmend = require('./models/git-commit-amend');
      GitDiff = require('./models/git-diff');
      GitDiffAll = require('./models/git-diff-all');
      GitFetch = require('./models/git-fetch');
      GitInit = require('./models/git-init');
      GitLog = require('./models/git-log');
      GitStatus = require('./models/git-status');
      GitPush = require('./models/git-push');
      GitPull = require('./models/git-pull');
      GitRemove = require('./models/git-remove');
      GitShow = require('./models/git-show');
      GitStageFiles = require('./models/git-stage-files');
      GitStageHunk = require('./models/git-stage-hunk');
      GitStashApply = require('./models/git-stash-apply');
      GitStashDrop = require('./models/git-stash-drop');
      GitStashPop = require('./models/git-stash-pop');
      GitStashSave = require('./models/git-stash-save');
      GitTags = require('./models/git-tags');
      GitUnstageFiles = require('./models/git-unstage-files');
      GitRun = require('./models/git-run');
      atom.workspaceView.command('git-plus:add', function() {
        return GitAdd();
      });
      atom.workspaceView.command('git-plus:add-all', function() {
        return GitAdd(true);
      });
      atom.workspaceView.command('git-plus:add-all-and-commit', function() {
        return GitAddAllAndCommit();
      });
      atom.workspaceView.command('git-plus:add-and-commit', function() {
        return GitAddAndCommit();
      });
      atom.workspaceView.command('git-plus:diff', function() {
        return GitDiff();
      });
      atom.workspaceView.command('git-plus:diff-all', function() {
        return GitDiffAll();
      });
      atom.workspaceView.command('git-plus:log', function() {
        return GitLog();
      });
      atom.workspaceView.command('git-plus:log-current-file', function() {
        return GitLog(true);
      });
      atom.workspaceView.command('git-plus:status', function() {
        return GitStatus();
      });
      atom.workspaceView.command('git-plus:push', function() {
        return GitPush();
      });
      atom.workspaceView.command('git-plus:pull', function() {
        return GitPull();
      });
      atom.workspaceView.command('git-plus:remove-current-file', function() {
        return GitRemove();
      });
      atom.workspaceView.command('git-plus:remove', function() {
        return GitRemove(true);
      });
      atom.workspaceView.command('git-plus:checkout-current-file', function() {
        return GitCheckoutCurrentFile();
      });
      atom.workspaceView.command('git-plus:checkout', function() {
        return GitBranch.gitBranches();
      });
      atom.workspaceView.command('git-plus:checkout-all-files', function() {
        return GitCheckoutAllFiles();
      });
      atom.workspaceView.command('git-plus:cherry-pick', function() {
        return GitCherryPick();
      });
      atom.workspaceView.command('git-plus:commit', function() {
        return new GitCommit();
      });
      atom.workspaceView.command('git-plus:commit-amend', function() {
        return GitCommitAmend();
      });
      atom.workspaceView.command('git-plus:fetch', function() {
        return GitFetch();
      });
      atom.workspaceView.command('git-plus:new-branch', function() {
        return GitBranch.newBranch();
      });
      atom.workspaceView.command('git-plus:reset-head', function() {
        return git.reset();
      });
      atom.workspaceView.command('git-plus:show', function() {
        return GitShow();
      });
      atom.workspaceView.command('git-plus:stage-files', function() {
        return GitStageFiles();
      });
      atom.workspaceView.command('git-plus:stage-hunk', function() {
        return GitStageHunk();
      });
      atom.workspaceView.command('git-plus:stash-save', function() {
        return GitStashSave();
      });
      atom.workspaceView.command('git-plus:stash-pop', function() {
        return GitStashPop();
      });
      atom.workspaceView.command('git-plus:stash-keep', function() {
        return GitStashApply();
      });
      atom.workspaceView.command('git-plus:stash-drop', function() {
        return GitStashDrop();
      });
      atom.workspaceView.command('git-plus:tags', function() {
        return GitTags();
      });
      atom.workspaceView.command('git-plus:unstage-files', function() {
        return GitUnstageFiles();
      });
      atom.workspaceView.command('git-plus:init', function() {
        return GitInit();
      });
      return atom.workspaceView.command('git-plus:run', function() {
        return GitRun();
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLE1BQUE7O0FBQUEsRUFBQyxJQUFLLE9BQUEsQ0FBUSxNQUFSLEVBQUwsQ0FBRCxDQUFBOztBQUFBLEVBQ0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSLENBRE4sQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7QUFBQSxJQUFBLGNBQUEsRUFDRTtBQUFBLE1BQUEsaUJBQUEsRUFBbUIsSUFBbkI7QUFBQSxNQUNBLFVBQUEsRUFBWSxJQURaO0FBQUEsTUFFQSxTQUFBLEVBQVcsT0FGWDtBQUFBLE1BR0EsUUFBQSxFQUFVLElBSFY7QUFBQSxNQUlBLHFCQUFBLEVBQXVCLEVBSnZCO0FBQUEsTUFLQSxPQUFBLEVBQVMsS0FMVDtBQUFBLE1BTUEsY0FBQSxFQUFnQixDQU5oQjtLQURGO0FBQUEsSUFTQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUE7QUFDUixVQUFBLHFXQUFBO0FBQUEsTUFBQSxNQUFBLEdBQXlCLE9BQUEsQ0FBUSxrQkFBUixDQUF6QixDQUFBO0FBQUEsTUFDQSxrQkFBQSxHQUF5QixPQUFBLENBQVEsaUNBQVIsQ0FEekIsQ0FBQTtBQUFBLE1BRUEsZUFBQSxHQUF5QixPQUFBLENBQVEsNkJBQVIsQ0FGekIsQ0FBQTtBQUFBLE1BR0EsU0FBQSxHQUF5QixPQUFBLENBQVEscUJBQVIsQ0FIekIsQ0FBQTtBQUFBLE1BSUEsbUJBQUEsR0FBeUIsT0FBQSxDQUFRLGlDQUFSLENBSnpCLENBQUE7QUFBQSxNQUtBLHNCQUFBLEdBQXlCLE9BQUEsQ0FBUSxvQ0FBUixDQUx6QixDQUFBO0FBQUEsTUFNQSxhQUFBLEdBQXlCLE9BQUEsQ0FBUSwwQkFBUixDQU56QixDQUFBO0FBQUEsTUFPQSxTQUFBLEdBQXlCLE9BQUEsQ0FBUSxxQkFBUixDQVB6QixDQUFBO0FBQUEsTUFRQSxjQUFBLEdBQXlCLE9BQUEsQ0FBUSwyQkFBUixDQVJ6QixDQUFBO0FBQUEsTUFTQSxPQUFBLEdBQXlCLE9BQUEsQ0FBUSxtQkFBUixDQVR6QixDQUFBO0FBQUEsTUFVQSxVQUFBLEdBQXlCLE9BQUEsQ0FBUSx1QkFBUixDQVZ6QixDQUFBO0FBQUEsTUFXQSxRQUFBLEdBQXlCLE9BQUEsQ0FBUSxvQkFBUixDQVh6QixDQUFBO0FBQUEsTUFZQSxPQUFBLEdBQXlCLE9BQUEsQ0FBUSxtQkFBUixDQVp6QixDQUFBO0FBQUEsTUFhQSxNQUFBLEdBQXlCLE9BQUEsQ0FBUSxrQkFBUixDQWJ6QixDQUFBO0FBQUEsTUFjQSxTQUFBLEdBQXlCLE9BQUEsQ0FBUSxxQkFBUixDQWR6QixDQUFBO0FBQUEsTUFlQSxPQUFBLEdBQXlCLE9BQUEsQ0FBUSxtQkFBUixDQWZ6QixDQUFBO0FBQUEsTUFnQkEsT0FBQSxHQUF5QixPQUFBLENBQVEsbUJBQVIsQ0FoQnpCLENBQUE7QUFBQSxNQWlCQSxTQUFBLEdBQXlCLE9BQUEsQ0FBUSxxQkFBUixDQWpCekIsQ0FBQTtBQUFBLE1Ba0JBLE9BQUEsR0FBeUIsT0FBQSxDQUFRLG1CQUFSLENBbEJ6QixDQUFBO0FBQUEsTUFtQkEsYUFBQSxHQUF5QixPQUFBLENBQVEsMEJBQVIsQ0FuQnpCLENBQUE7QUFBQSxNQW9CQSxZQUFBLEdBQXlCLE9BQUEsQ0FBUSx5QkFBUixDQXBCekIsQ0FBQTtBQUFBLE1BcUJBLGFBQUEsR0FBeUIsT0FBQSxDQUFRLDBCQUFSLENBckJ6QixDQUFBO0FBQUEsTUFzQkEsWUFBQSxHQUF5QixPQUFBLENBQVEseUJBQVIsQ0F0QnpCLENBQUE7QUFBQSxNQXVCQSxXQUFBLEdBQXlCLE9BQUEsQ0FBUSx3QkFBUixDQXZCekIsQ0FBQTtBQUFBLE1Bd0JBLFlBQUEsR0FBeUIsT0FBQSxDQUFRLHlCQUFSLENBeEJ6QixDQUFBO0FBQUEsTUF5QkEsT0FBQSxHQUF5QixPQUFBLENBQVEsbUJBQVIsQ0F6QnpCLENBQUE7QUFBQSxNQTBCQSxlQUFBLEdBQXlCLE9BQUEsQ0FBUSw0QkFBUixDQTFCekIsQ0FBQTtBQUFBLE1BMkJBLE1BQUEsR0FBeUIsT0FBQSxDQUFRLGtCQUFSLENBM0J6QixDQUFBO0FBQUEsTUE2QkEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQixjQUEzQixFQUEyQyxTQUFBLEdBQUE7ZUFBRyxNQUFBLENBQUEsRUFBSDtNQUFBLENBQTNDLENBN0JBLENBQUE7QUFBQSxNQThCQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLGtCQUEzQixFQUErQyxTQUFBLEdBQUE7ZUFBRyxNQUFBLENBQU8sSUFBUCxFQUFIO01BQUEsQ0FBL0MsQ0E5QkEsQ0FBQTtBQUFBLE1BK0JBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsNkJBQTNCLEVBQTBELFNBQUEsR0FBQTtlQUFHLGtCQUFBLENBQUEsRUFBSDtNQUFBLENBQTFELENBL0JBLENBQUE7QUFBQSxNQWdDQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLHlCQUEzQixFQUFzRCxTQUFBLEdBQUE7ZUFBRyxlQUFBLENBQUEsRUFBSDtNQUFBLENBQXRELENBaENBLENBQUE7QUFBQSxNQWlDQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLGVBQTNCLEVBQTRDLFNBQUEsR0FBQTtlQUFHLE9BQUEsQ0FBQSxFQUFIO01BQUEsQ0FBNUMsQ0FqQ0EsQ0FBQTtBQUFBLE1Ba0NBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsbUJBQTNCLEVBQWdELFNBQUEsR0FBQTtlQUFHLFVBQUEsQ0FBQSxFQUFIO01BQUEsQ0FBaEQsQ0FsQ0EsQ0FBQTtBQUFBLE1BbUNBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsY0FBM0IsRUFBMkMsU0FBQSxHQUFBO2VBQUcsTUFBQSxDQUFBLEVBQUg7TUFBQSxDQUEzQyxDQW5DQSxDQUFBO0FBQUEsTUFvQ0EsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQiwyQkFBM0IsRUFBd0QsU0FBQSxHQUFBO2VBQUcsTUFBQSxDQUFPLElBQVAsRUFBSDtNQUFBLENBQXhELENBcENBLENBQUE7QUFBQSxNQXFDQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLGlCQUEzQixFQUE4QyxTQUFBLEdBQUE7ZUFBRyxTQUFBLENBQUEsRUFBSDtNQUFBLENBQTlDLENBckNBLENBQUE7QUFBQSxNQXNDQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLGVBQTNCLEVBQTRDLFNBQUEsR0FBQTtlQUFHLE9BQUEsQ0FBQSxFQUFIO01BQUEsQ0FBNUMsQ0F0Q0EsQ0FBQTtBQUFBLE1BdUNBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsZUFBM0IsRUFBNEMsU0FBQSxHQUFBO2VBQUcsT0FBQSxDQUFBLEVBQUg7TUFBQSxDQUE1QyxDQXZDQSxDQUFBO0FBQUEsTUF3Q0EsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQiw4QkFBM0IsRUFBMkQsU0FBQSxHQUFBO2VBQUcsU0FBQSxDQUFBLEVBQUg7TUFBQSxDQUEzRCxDQXhDQSxDQUFBO0FBQUEsTUF5Q0EsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQixpQkFBM0IsRUFBOEMsU0FBQSxHQUFBO2VBQUcsU0FBQSxDQUFVLElBQVYsRUFBSDtNQUFBLENBQTlDLENBekNBLENBQUE7QUFBQSxNQTBDQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLGdDQUEzQixFQUE2RCxTQUFBLEdBQUE7ZUFBRyxzQkFBQSxDQUFBLEVBQUg7TUFBQSxDQUE3RCxDQTFDQSxDQUFBO0FBQUEsTUEyQ0EsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQixtQkFBM0IsRUFBZ0QsU0FBQSxHQUFBO2VBQUcsU0FBUyxDQUFDLFdBQVYsQ0FBQSxFQUFIO01BQUEsQ0FBaEQsQ0EzQ0EsQ0FBQTtBQUFBLE1BNENBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsNkJBQTNCLEVBQTBELFNBQUEsR0FBQTtlQUFHLG1CQUFBLENBQUEsRUFBSDtNQUFBLENBQTFELENBNUNBLENBQUE7QUFBQSxNQTZDQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLHNCQUEzQixFQUFtRCxTQUFBLEdBQUE7ZUFBRyxhQUFBLENBQUEsRUFBSDtNQUFBLENBQW5ELENBN0NBLENBQUE7QUFBQSxNQThDQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLGlCQUEzQixFQUE4QyxTQUFBLEdBQUE7ZUFBTyxJQUFBLFNBQUEsQ0FBQSxFQUFQO01BQUEsQ0FBOUMsQ0E5Q0EsQ0FBQTtBQUFBLE1BK0NBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsdUJBQTNCLEVBQW9ELFNBQUEsR0FBQTtlQUFHLGNBQUEsQ0FBQSxFQUFIO01BQUEsQ0FBcEQsQ0EvQ0EsQ0FBQTtBQUFBLE1BZ0RBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsZ0JBQTNCLEVBQTZDLFNBQUEsR0FBQTtlQUFHLFFBQUEsQ0FBQSxFQUFIO01BQUEsQ0FBN0MsQ0FoREEsQ0FBQTtBQUFBLE1BaURBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIscUJBQTNCLEVBQWtELFNBQUEsR0FBQTtlQUFHLFNBQVMsQ0FBQyxTQUFWLENBQUEsRUFBSDtNQUFBLENBQWxELENBakRBLENBQUE7QUFBQSxNQWtEQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLHFCQUEzQixFQUFrRCxTQUFBLEdBQUE7ZUFBRyxHQUFHLENBQUMsS0FBSixDQUFBLEVBQUg7TUFBQSxDQUFsRCxDQWxEQSxDQUFBO0FBQUEsTUFtREEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQixlQUEzQixFQUE0QyxTQUFBLEdBQUE7ZUFBRyxPQUFBLENBQUEsRUFBSDtNQUFBLENBQTVDLENBbkRBLENBQUE7QUFBQSxNQW9EQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLHNCQUEzQixFQUFtRCxTQUFBLEdBQUE7ZUFBRyxhQUFBLENBQUEsRUFBSDtNQUFBLENBQW5ELENBcERBLENBQUE7QUFBQSxNQXFEQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLHFCQUEzQixFQUFrRCxTQUFBLEdBQUE7ZUFBRyxZQUFBLENBQUEsRUFBSDtNQUFBLENBQWxELENBckRBLENBQUE7QUFBQSxNQXNEQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLHFCQUEzQixFQUFrRCxTQUFBLEdBQUE7ZUFBRyxZQUFBLENBQUEsRUFBSDtNQUFBLENBQWxELENBdERBLENBQUE7QUFBQSxNQXVEQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLG9CQUEzQixFQUFpRCxTQUFBLEdBQUE7ZUFBRyxXQUFBLENBQUEsRUFBSDtNQUFBLENBQWpELENBdkRBLENBQUE7QUFBQSxNQXdEQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLHFCQUEzQixFQUFrRCxTQUFBLEdBQUE7ZUFBRyxhQUFBLENBQUEsRUFBSDtNQUFBLENBQWxELENBeERBLENBQUE7QUFBQSxNQXlEQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLHFCQUEzQixFQUFrRCxTQUFBLEdBQUE7ZUFBRyxZQUFBLENBQUEsRUFBSDtNQUFBLENBQWxELENBekRBLENBQUE7QUFBQSxNQTBEQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLGVBQTNCLEVBQTRDLFNBQUEsR0FBQTtlQUFHLE9BQUEsQ0FBQSxFQUFIO01BQUEsQ0FBNUMsQ0ExREEsQ0FBQTtBQUFBLE1BMkRBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsd0JBQTNCLEVBQXFELFNBQUEsR0FBQTtlQUFHLGVBQUEsQ0FBQSxFQUFIO01BQUEsQ0FBckQsQ0EzREEsQ0FBQTtBQUFBLE1BNERBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsZUFBM0IsRUFBNEMsU0FBQSxHQUFBO2VBQUcsT0FBQSxDQUFBLEVBQUg7TUFBQSxDQUE1QyxDQTVEQSxDQUFBO2FBNkRBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsY0FBM0IsRUFBMkMsU0FBQSxHQUFBO2VBQUcsTUFBQSxDQUFBLEVBQUg7TUFBQSxDQUEzQyxFQTlEUTtJQUFBLENBVFY7R0FKRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/git-plus/lib/git-plus.coffee