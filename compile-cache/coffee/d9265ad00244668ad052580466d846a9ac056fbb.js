(function() {
  var getCommands, git;

  git = require('./git');

  getCommands = function() {
    var GitAdd, GitAddAllAndCommit, GitAddAndCommit, GitBranch, GitCheckoutAllFiles, GitCheckoutCurrentFile, GitCherryPick, GitCommit, GitCommitAmend, GitDiff, GitDiffAll, GitFetch, GitInit, GitLog, GitPull, GitPush, GitRemove, GitShow, GitStageFiles, GitStageHunk, GitStatus, GitTags, GitUnstageFiles, commands, _ref;
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
    GitPull = require('./models/git-pull');
    GitPush = require('./models/git-push');
    GitRemove = require('./models/git-remove');
    GitShow = require('./models/git-show');
    GitStageFiles = require('./models/git-stage-files');
    GitStageHunk = require('./models/git-stage-hunk');
    GitStatus = require('./models/git-status');
    GitTags = require('./models/git-tags');
    GitUnstageFiles = require('./models/git-unstage-files');
    commands = [];
    if (atom.project.getRepo() != null) {
      git.refresh();
      if (((_ref = atom.workspace.getActiveEditor()) != null ? _ref.getPath() : void 0) != null) {
        commands.push([
          'git-plus:add', 'Add', function() {
            return GitAdd();
          }
        ]);
        commands.push([
          'git-plus:log-current-file', 'Log Current File', function() {
            return GitLog(true);
          }
        ]);
        commands.push([
          'git-plus:remove-current-file', 'Remove Current File', function() {
            return GitRemove();
          }
        ]);
        commands.push([
          'git-plus:checkout-current-file', 'Checkout Current File', function() {
            return GitCheckoutCurrentFile();
          }
        ]);
      }
      commands.push([
        'git-plus:add-all', 'Add All', function() {
          return GitAdd(true);
        }
      ]);
      commands.push([
        'git-plus:add-all-and-commit', 'Add All And Commit', function() {
          return GitAddAllAndCommit();
        }
      ]);
      commands.push([
        'git-plus:add-and-commit', 'Add And Commit', function() {
          return GitAddAndCommit();
        }
      ]);
      commands.push([
        'git-plus:checkout', 'Checkout', function() {
          return GitBranch.gitBranches();
        }
      ]);
      commands.push([
        'git-plus:checkout-all-files', 'Checkout All Files', function() {
          return GitCheckoutAllFiles();
        }
      ]);
      commands.push([
        'git-plus:cherry-pick', 'Cherry-Pick', function() {
          return GitCherryPick();
        }
      ]);
      commands.push([
        'git-plus:commit', 'Commit', function() {
          return new GitCommit;
        }
      ]);
      commands.push([
        'git-plus:commit-amend', 'Commit Amend', function() {
          return GitCommitAmend();
        }
      ]);
      commands.push([
        'git-plus:diff', 'Diff', function() {
          return GitDiff();
        }
      ]);
      commands.push([
        'git-plus:diff-all', 'Diff All', function() {
          return GitDiffAll();
        }
      ]);
      commands.push([
        'git-plus:fetch', 'Fetch', function() {
          return GitFetch();
        }
      ]);
      commands.push([
        'git-plus:log', 'Log', function() {
          return GitLog();
        }
      ]);
      commands.push([
        'git-plus:new-branch', 'Checkout New Branch', function() {
          return GitBranch.newBranch();
        }
      ]);
      commands.push([
        'git-plus:pull', 'Pull', function() {
          return GitPull();
        }
      ]);
      commands.push([
        'git-plus:push', 'Push', function() {
          return GitPush();
        }
      ]);
      commands.push([
        'git-plus:remove', 'Remove', function() {
          return GitRemove(true);
        }
      ]);
      commands.push([
        'git-plus:show', 'Show', function() {
          return GitShow();
        }
      ]);
      commands.push([
        'git-plus:stage-files', 'Stage Files', function() {
          return GitStageFiles();
        }
      ]);
      commands.push([
        'git-plus:stage-hunk', 'Stage Hunk', function() {
          return GitStageHunk();
        }
      ]);
      commands.push([
        'git-plus:status', 'Status', function() {
          return GitStatus();
        }
      ]);
      commands.push([
        'git-plus:tags', 'Tags', function() {
          return GitTags();
        }
      ]);
      commands.push([
        'git-plus:unstage-files', 'Unstage Files', function() {
          return GitUnstageFiles();
        }
      ]);
    } else {
      commands.push([
        'git-plus:init', 'Init', function() {
          return GitInit();
        }
      ]);
    }
    return commands;
  };

  module.exports = getCommands;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdCQUFBOztBQUFBLEVBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSLENBQU4sQ0FBQTs7QUFBQSxFQUVBLFdBQUEsR0FBYyxTQUFBLEdBQUE7QUFDWixRQUFBLHFUQUFBO0FBQUEsSUFBQSxNQUFBLEdBQXlCLE9BQUEsQ0FBUSxrQkFBUixDQUF6QixDQUFBO0FBQUEsSUFDQSxrQkFBQSxHQUF5QixPQUFBLENBQVEsaUNBQVIsQ0FEekIsQ0FBQTtBQUFBLElBRUEsZUFBQSxHQUF5QixPQUFBLENBQVEsNkJBQVIsQ0FGekIsQ0FBQTtBQUFBLElBR0EsU0FBQSxHQUF5QixPQUFBLENBQVEscUJBQVIsQ0FIekIsQ0FBQTtBQUFBLElBSUEsbUJBQUEsR0FBeUIsT0FBQSxDQUFRLGlDQUFSLENBSnpCLENBQUE7QUFBQSxJQUtBLHNCQUFBLEdBQXlCLE9BQUEsQ0FBUSxvQ0FBUixDQUx6QixDQUFBO0FBQUEsSUFNQSxhQUFBLEdBQXlCLE9BQUEsQ0FBUSwwQkFBUixDQU56QixDQUFBO0FBQUEsSUFPQSxTQUFBLEdBQXlCLE9BQUEsQ0FBUSxxQkFBUixDQVB6QixDQUFBO0FBQUEsSUFRQSxjQUFBLEdBQXlCLE9BQUEsQ0FBUSwyQkFBUixDQVJ6QixDQUFBO0FBQUEsSUFTQSxPQUFBLEdBQXlCLE9BQUEsQ0FBUSxtQkFBUixDQVR6QixDQUFBO0FBQUEsSUFVQSxVQUFBLEdBQXlCLE9BQUEsQ0FBUSx1QkFBUixDQVZ6QixDQUFBO0FBQUEsSUFXQSxRQUFBLEdBQXlCLE9BQUEsQ0FBUSxvQkFBUixDQVh6QixDQUFBO0FBQUEsSUFZQSxPQUFBLEdBQXlCLE9BQUEsQ0FBUSxtQkFBUixDQVp6QixDQUFBO0FBQUEsSUFhQSxNQUFBLEdBQXlCLE9BQUEsQ0FBUSxrQkFBUixDQWJ6QixDQUFBO0FB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
//# sourceURL=/Users/daniel/.atom/packages/git-plus/lib/git-plus-commands.coffee