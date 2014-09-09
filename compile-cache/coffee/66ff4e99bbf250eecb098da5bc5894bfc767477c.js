(function() {
  var $, BranchListView, CommitListView, CurrentBranchView, EditorView, ErrorView, FileListView, RepoView, View, git, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  $ = require('jquery');

  _ref = require('atom'), View = _ref.View, EditorView = _ref.EditorView;

  FileListView = require('./files').FileListView;

  _ref1 = require('./branches'), CurrentBranchView = _ref1.CurrentBranchView, BranchListView = _ref1.BranchListView;

  CommitListView = require('./commits').CommitListView;

  ErrorView = require('./error-view');

  git = require('../git').git;

  module.exports = RepoView = (function(_super) {
    __extends(RepoView, _super);

    function RepoView() {
      this.cancel_input = __bind(this.cancel_input, this);
      this.get_input = __bind(this.get_input, this);
      this.resize = __bind(this.resize, this);
      this.resize_stopped = __bind(this.resize_stopped, this);
      this.resize_started = __bind(this.resize_started, this);
      return RepoView.__super__.constructor.apply(this, arguments);
    }

    RepoView.content = function(model) {
      return this.div({
        "class": 'atomatigit'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": "resize-handle",
            outlet: "resize_handle"
          });
          _this.subview("current_branch_view", new CurrentBranchView(model.current_branch));
          _this.subview("error", new ErrorView(git));
          _this.div({
            "class": "input",
            outlet: "input"
          }, function() {
            return _this.subview("input_editor", new EditorView({
              mini: true
            }));
          });
          _this.ul({
            "class": "list-inline tab-bar inset-panel"
          }, function() {
            _this.li({
              outlet: "file_tab",
              "class": "tab active",
              click: "showFiles"
            }, function() {
              return _this.div({
                "class": 'title'
              }, "Staging");
            });
            _this.li({
              outlet: "branch_tab",
              "class": "tab",
              click: "showBranches"
            }, function() {
              return _this.div({
                "class": 'title'
              }, "Branches");
            });
            return _this.li({
              outlet: "commit_tab",
              "class": "tab",
              click: "showCommits"
            }, function() {
              return _this.div({
                "class": 'title'
              }, "Log");
            });
          });
          return _this.div({
            "class": "lists"
          }, function() {
            _this.subview("file_list_view", new FileListView(model.file_list));
            _this.subview("branch_list_view", new BranchListView(model.branch_list));
            return _this.subview("commit_list_view", new CommitListView(model.commit_list));
          });
        };
      })(this));
    };

    RepoView.prototype.initialize = function(repo) {
      var atom_git;
      this.model = repo;
      this.insert_commands();
      this.model.on("need_input", this.get_input);
      this.on('core:confirm', (function(_this) {
        return function() {
          return _this.complete_input();
        };
      })(this));
      this.on('core:cancel', (function(_this) {
        return function() {
          return _this.cancel_input();
        };
      })(this));
      this.on('click', (function(_this) {
        return function() {
          return _this.focus();
        };
      })(this));
      this.on('focusout', (function(_this) {
        return function() {
          return _this.unfocus();
        };
      })(this));
      this.input_editor.on("click", function() {
        return false;
      });
      this.resize_handle.on("mousedown", this.resize_started);
      atom_git = atom.project.getRepo();
      this.subscribe(atom_git, 'status-changed', this.model.reload);
      return this.showFiles();
    };

    RepoView.prototype.insert_commands = function() {
      atom.workspaceView.command("atomatigit:next", (function(_this) {
        return function() {
          return _this.model.active_list.next();
        };
      })(this));
      atom.workspaceView.command("atomatigit:previous", (function(_this) {
        return function() {
          return _this.model.active_list.previous();
        };
      })(this));
      atom.workspaceView.command("atomatigit:stage", (function(_this) {
        return function() {
          return _this.model.leaf().stage();
        };
      })(this));
      atom.workspaceView.command("atomatigit:unstage", (function(_this) {
        return function() {
          return _this.model.leaf().unstage();
        };
      })(this));
      atom.workspaceView.command("atomatigit:kill", (function(_this) {
        return function() {
          return _this.model.leaf().kill();
        };
      })(this));
      atom.workspaceView.command("atomatigit:open", (function(_this) {
        return function() {
          return _this.model.selection().open();
        };
      })(this));
      atom.workspaceView.command("atomatigit:toggle-diff", (function(_this) {
        return function() {
          return _this.model.selection().toggleDiff();
        };
      })(this));
      atom.workspaceView.command("atomatigit:commit", (function(_this) {
        return function() {
          return _this.model.initiateCommit();
        };
      })(this));
      atom.workspaceView.command("atomatigit:complete-commit", (function(_this) {
        return function() {
          return _this.commitAndClose();
        };
      })(this));
      atom.workspaceView.command("atomatigit:push", (function(_this) {
        return function() {
          return _this.model.push();
        };
      })(this));
      atom.workspaceView.command("atomatigit:fetch", (function(_this) {
        return function() {
          return _this.model.fetch();
        };
      })(this));
      atom.workspaceView.command("atomatigit:stash", (function(_this) {
        return function() {
          return _this.model.stash();
        };
      })(this));
      atom.workspaceView.command("atomatigit:stash-pop", (function(_this) {
        return function() {
          return _this.model.stashPop();
        };
      })(this));
      atom.workspaceView.command("atomatigit:hard-reset-to-commit", (function(_this) {
        return function() {
          return _this.model.selection().confirmHardReset();
        };
      })(this));
      atom.workspaceView.command("atomatigit:showCommit", (function(_this) {
        return function() {
          return _this.model.selection().showCommit();
        };
      })(this));
      atom.workspaceView.command("atomatigit:create-branch", (function(_this) {
        return function() {
          return _this.model.initiateCreateBranch();
        };
      })(this));
      atom.workspaceView.command("atomatigit:git-command", (function(_this) {
        return function() {
          return _this.model.initiateGitCommand();
        };
      })(this));
      atom.workspaceView.command("atomatigit:input:newline", (function(_this) {
        return function() {
          return _this.input_newline();
        };
      })(this));
      atom.workspaceView.command("atomatigit:input:up", (function(_this) {
        return function() {
          return _this.input_up();
        };
      })(this));
      atom.workspaceView.command("atomatigit:input:down", (function(_this) {
        return function() {
          return _this.input_down();
        };
      })(this));
      atom.workspaceView.command("atomatigit:branches", (function(_this) {
        return function() {
          return _this.showBranches();
        };
      })(this));
      atom.workspaceView.command("atomatigit:files", (function(_this) {
        return function() {
          return _this.showFiles();
        };
      })(this));
      atom.workspaceView.command("atomatigit:commit-log", (function(_this) {
        return function() {
          return _this.showCommits();
        };
      })(this));
      return atom.workspaceView.command("atomatigit:refresh", (function(_this) {
        return function() {
          return _this.refresh();
        };
      })(this));
    };

    RepoView.prototype.commitAndClose = function() {
      atom.workspaceView.trigger("core:save");
      atom.workspaceView.trigger("core:close");
      this.model.completeCommit();
      return this.focus();
    };

    RepoView.prototype.refresh = function() {
      this.model.reload();
      return git.clearTaskCounter();
    };

    RepoView.prototype.showBranches = function() {
      this.model.active_list = this.model.branch_list;
      this.active_view = this.branch_list_view;
      return this.showViews();
    };

    RepoView.prototype.showFiles = function() {
      this.model.active_list = this.model.file_list;
      this.active_view = this.file_list_view;
      return this.showViews();
    };

    RepoView.prototype.showCommits = function() {
      this.model.active_list = this.model.commit_list;
      this.active_view = this.commit_list_view;
      return this.showViews();
    };

    RepoView.prototype.showViews = function() {
      this.mode_switch_flag = true;
      this.file_list_view.toggleClass("hidden", this.active_view !== this.file_list_view);
      this.file_tab.toggleClass("active", this.active_view === this.file_list_view);
      this.branch_list_view.toggleClass("hidden", this.active_view !== this.branch_list_view);
      this.branch_tab.toggleClass("active", this.active_view === this.branch_list_view);
      this.commit_list_view.toggleClass("hidden", this.active_view !== this.commit_list_view);
      return this.commit_tab.toggleClass("active", this.active_view === this.commit_list_view);
    };

    RepoView.prototype.resize_started = function() {
      $(document.body).on('mousemove', this.resize);
      return $(document.body).on('mouseup', this.resize_stopped);
    };

    RepoView.prototype.resize_stopped = function() {
      $(document.body).off('mousemove', this.resize);
      return $(document.body).off('mouseup', this.resize_stopped);
    };

    RepoView.prototype.resize = function(_arg) {
      var pageX, width;
      pageX = _arg.pageX;
      width = $(document.body).width() - pageX;
      return this.width(width);
    };

    RepoView.prototype.get_input = function(options) {
      var extra_query;
      this.input.removeClass("block");
      extra_query = "";
      if (options.block) {
        this.input.addClass("block");
        extra_query = " (shift+enter to finish)";
      }
      this.input_callback = options.callback;
      this.input_editor.setPlaceholderText(options.query + extra_query);
      this.input_editor.setText("");
      return this.input.show(100, (function(_this) {
        return function() {
          _this.input_editor.redraw();
          return _this.input_editor.focus();
        };
      })(this));
    };

    RepoView.prototype.complete_input = function() {
      this.input.hide();
      this.input_callback(this.input_editor.getText());
      this.mode_switch_flag = true;
      return this.focus();
    };

    RepoView.prototype.cancel_input = function() {
      this.input.hide();
      this.input_callback = null;
      this.mode_switch_flag = true;
      this.input_editor.off('focusout', this.cancel_input);
      return this.focus();
    };

    RepoView.prototype.focus = function() {
      this.addClass("focused");
      return this.active_view.focus();
    };

    RepoView.prototype.unfocus = function() {
      if (!this.mode_switch_flag) {
        return this.removeClass("focused");
      } else {
        this.focus();
        return this.mode_switch_flag = false;
      }
    };

    RepoView.prototype.serialize = function() {};

    RepoView.prototype.destroy = function() {
      return this.detach();
    };

    return RepoView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJIQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBQUosQ0FBQTs7QUFBQSxFQUVBLE9BQXFCLE9BQUEsQ0FBUSxNQUFSLENBQXJCLEVBQUMsWUFBQSxJQUFELEVBQU8sa0JBQUEsVUFGUCxDQUFBOztBQUFBLEVBR0MsZUFBZ0IsT0FBQSxDQUFRLFNBQVIsRUFBaEIsWUFIRCxDQUFBOztBQUFBLEVBSUEsUUFBdUMsT0FBQSxDQUFRLFlBQVIsQ0FBdkMsRUFBQywwQkFBQSxpQkFBRCxFQUFvQix1QkFBQSxjQUpwQixDQUFBOztBQUFBLEVBS0MsaUJBQWtCLE9BQUEsQ0FBUSxXQUFSLEVBQWxCLGNBTEQsQ0FBQTs7QUFBQSxFQU1BLFNBQUEsR0FBWSxPQUFBLENBQVEsY0FBUixDQU5aLENBQUE7O0FBQUEsRUFPQyxNQUFPLE9BQUEsQ0FBUSxRQUFSLEVBQVAsR0FQRCxDQUFBOztBQUFBLEVBU0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLCtCQUFBLENBQUE7Ozs7Ozs7OztLQUFBOztBQUFBLElBQUEsUUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLEtBQUQsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxZQUFQO09BQUwsRUFBMEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUN4QixVQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxlQUFQO0FBQUEsWUFBd0IsTUFBQSxFQUFRLGVBQWhDO1dBQUwsQ0FBQSxDQUFBO0FBQUEsVUFDQSxLQUFDLENBQUEsT0FBRCxDQUFTLHFCQUFULEVBQW9DLElBQUEsaUJBQUEsQ0FBa0IsS0FBSyxDQUFDLGNB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
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/views/repo-view.coffee