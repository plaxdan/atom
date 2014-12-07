(function() {
  var $, BranchListView, CommitListView, CurrentBranchView, EditorView, ErrorView, FileListView, InputView, RepoView, View, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), $ = _ref.$, View = _ref.View, EditorView = _ref.EditorView;

  FileListView = require('./files').FileListView;

  _ref1 = require('./branches'), CurrentBranchView = _ref1.CurrentBranchView, BranchListView = _ref1.BranchListView;

  CommitListView = require('./commits').CommitListView;

  ErrorView = require('./error-view');

  InputView = require('./input-view');

  RepoView = (function(_super) {
    __extends(RepoView, _super);

    function RepoView() {
      this.destroy = __bind(this.destroy, this);
      this.unfocus = __bind(this.unfocus, this);
      this.focus = __bind(this.focus, this);
      this.resize = __bind(this.resize, this);
      this.resizeStopped = __bind(this.resizeStopped, this);
      this.resizeStarted = __bind(this.resizeStarted, this);
      this.activateView = __bind(this.activateView, this);
      this.showCommits = __bind(this.showCommits, this);
      this.showFiles = __bind(this.showFiles, this);
      this.showBranches = __bind(this.showBranches, this);
      this.refresh = __bind(this.refresh, this);
      this.insertCommands = __bind(this.insertCommands, this);
      return RepoView.__super__.constructor.apply(this, arguments);
    }

    RepoView.content = function(model) {
      return this.div({
        "class": 'atomatigit'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'resize-handle',
            outlet: 'resizeHandle'
          });
          _this.subview('currentBranchView', new CurrentBranchView(model.currentBranch));
          _this.ul({
            "class": 'list-inline tab-bar inset-panel'
          }, function() {
            _this.li({
              outlet: 'fileTab',
              "class": 'tab active',
              click: 'showFiles'
            }, function() {
              return _this.div({
                "class": 'title'
              }, 'Files');
            });
            _this.li({
              outlet: 'branchTab',
              "class": 'tab',
              click: 'showBranches'
            }, function() {
              return _this.div({
                "class": 'title'
              }, 'Branches');
            });
            return _this.li({
              outlet: 'commitTab',
              "class": 'tab',
              click: 'showCommits'
            }, function() {
              return _this.div({
                "class": 'title'
              }, 'Log');
            });
          });
          return _this.div({
            "class": 'lists'
          }, function() {
            _this.subview('fileListView', new FileListView(model.fileList));
            _this.subview('branchListView', new BranchListView(model.branchList));
            return _this.subview('commitListView', new CommitListView(model.commitList));
          });
        };
      })(this));
    };

    RepoView.prototype.initialize = function(model) {
      var atomGit;
      this.model = model;
      this.model.on('needInput', this.getInput);
      this.on('click', this.focus);
      this.on('focusout', this.unfocus);
      this.resizeHandle.on('mousedown', this.resizeStarted);
      atomGit = atom.project.getRepo();
      if (atomGit != null) {
        this.subscribe(atomGit, 'status-changed', this.model.reload);
      }
      this.insertCommands();
      return this.model.reload().then(this.showFiles);
    };

    RepoView.prototype.insertCommands = function() {
      atom.workspaceView.command('atomatigit:next', (function(_this) {
        return function() {
          return _this.model.activeList.next();
        };
      })(this));
      atom.workspaceView.command('atomatigit:previous', (function(_this) {
        return function() {
          return _this.model.activeList.previous();
        };
      })(this));
      atom.workspaceView.command('atomatigit:files', this.showFiles);
      atom.workspaceView.command('atomatigit:branches', this.showBranches);
      atom.workspaceView.command('atomatigit:commit-log', this.showCommits);
      atom.workspaceView.command('atomatigit:commit', this.model.initiateCommit);
      atom.workspaceView.command('atomatigit:git-command', this.model.initiateGitCommand);
      atom.workspaceView.command('atomatigit:input:down', this.inputDown);
      atom.workspaceView.command('atomatigit:input:newline', this.inputNewline);
      atom.workspaceView.command('atomatigit:input:up', this.inputUp);
      atom.workspaceView.command('atomatigit:stage', (function(_this) {
        return function() {
          var _ref2;
          return (_ref2 = _this.model.leaf()) != null ? _ref2.stage() : void 0;
        };
      })(this));
      atom.workspaceView.command('atomatigit:stash', this.model.stash);
      atom.workspaceView.command('atomatigit:stash-pop', this.model.stashPop);
      atom.workspaceView.command('atomatigit:toggle-diff', (function(_this) {
        return function() {
          var _ref2;
          return (_ref2 = _this.model.selection()) != null ? _ref2.toggleDiff() : void 0;
        };
      })(this));
      atom.workspaceView.command('atomatigit:unstage', (function(_this) {
        return function() {
          var _ref2;
          return (_ref2 = _this.model.leaf()) != null ? _ref2.unstage() : void 0;
        };
      })(this));
      atom.workspaceView.command('atomatigit:hard-reset-to-commit', (function(_this) {
        return function() {
          var _ref2;
          return (_ref2 = _this.model.selection()) != null ? _ref2.confirmHardReset() : void 0;
        };
      })(this));
      atom.workspaceView.command('atomatigit:create-branch', this.model.initiateCreateBranch);
      atom.workspaceView.command('atomatigit:fetch', this.model.fetch);
      atom.workspaceView.command('atomatigit:kill', (function(_this) {
        return function() {
          var _ref2;
          return (_ref2 = _this.model.leaf()) != null ? _ref2.kill() : void 0;
        };
      })(this));
      atom.workspaceView.command('atomatigit:open', (function(_this) {
        return function() {
          var _ref2;
          return (_ref2 = _this.model.selection()) != null ? _ref2.open() : void 0;
        };
      })(this));
      atom.workspaceView.command('atomatigit:push', this.model.push);
      atom.workspaceView.command('atomatigit:refresh', this.refresh);
      return atom.workspaceView.command('atomatigit:showCommit', (function(_this) {
        return function() {
          var _ref2;
          return (_ref2 = _this.model.selection()) != null ? typeof _ref2.showCommit === "function" ? _ref2.showCommit() : void 0 : void 0;
        };
      })(this));
    };

    RepoView.prototype.refresh = function() {
      return this.model.reload().then((function(_this) {
        return function() {
          return _this.activeView.repaint();
        };
      })(this));
    };

    RepoView.prototype.showBranches = function() {
      this.model.activeList = this.model.branchList;
      this.activeView = this.branchListView;
      return this.activateView();
    };

    RepoView.prototype.showFiles = function() {
      this.model.activeList = this.model.fileList;
      this.activeView = this.fileListView;
      return this.activateView();
    };

    RepoView.prototype.showCommits = function() {
      this.model.activeList = this.model.commitList;
      this.activeView = this.commitListView;
      return this.activateView();
    };

    RepoView.prototype.activateView = function() {
      this.modeSwitchFlag = true;
      this.fileListView.toggleClass('hidden', this.activeView !== this.fileListView);
      this.fileTab.toggleClass('active', this.activeView === this.fileListView);
      this.branchListView.toggleClass('hidden', this.activeView !== this.branchListView);
      this.branchTab.toggleClass('active', this.activeView === this.branchListView);
      this.commitListView.toggleClass('hidden', this.activeView !== this.commitListView);
      this.commitTab.toggleClass('active', this.activeView === this.commitListView);
      return this.focus();
    };

    RepoView.prototype.resizeStarted = function() {
      $(document.body).on('mousemove', this.resize);
      return $(document.body).on('mouseup', this.resizeStopped);
    };

    RepoView.prototype.resizeStopped = function() {
      $(document.body).off('mousemove', this.resize);
      return $(document.body).off('mouseup', this.resizeStopped);
    };

    RepoView.prototype.resize = function(_arg) {
      var pageX, width;
      pageX = _arg.pageX;
      width = $(document.body).width() - pageX;
      return this.width(width);
    };

    RepoView.prototype.getInput = function(options) {
      return new InputView(options);
    };

    RepoView.prototype.focus = function() {
      var _ref2;
      return ((_ref2 = this.activeView) != null ? typeof _ref2.focus === "function" ? _ref2.focus() : void 0 : void 0) && this.addClass('focused');
    };

    RepoView.prototype.unfocus = function() {
      if (this.modeSwitchFlag) {
        this.focus();
        return this.modeSwitchFlag = false;
      } else {
        return this.removeClass('focused');
      }
    };

    RepoView.prototype.destroy = function() {
      return this.detach();
    };

    return RepoView;

  })(View);

  module.exports = RepoView;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlJQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsT0FBd0IsT0FBQSxDQUFRLE1BQVIsQ0FBeEIsRUFBQyxTQUFBLENBQUQsRUFBSSxZQUFBLElBQUosRUFBVSxrQkFBQSxVQUFWLENBQUE7O0FBQUEsRUFFQyxlQUFzQyxPQUFBLENBQVEsU0FBUixFQUF0QyxZQUZELENBQUE7O0FBQUEsRUFHQSxRQUF1QyxPQUFBLENBQVEsWUFBUixDQUF2QyxFQUFDLDBCQUFBLGlCQUFELEVBQW9CLHVCQUFBLGNBSHBCLENBQUE7O0FBQUEsRUFJQyxpQkFBc0MsT0FBQSxDQUFRLFdBQVIsRUFBdEMsY0FKRCxDQUFBOztBQUFBLEVBS0EsU0FBQSxHQUF1QyxPQUFBLENBQVEsY0FBUixDQUx2QyxDQUFBOztBQUFBLEVBTUEsU0FBQSxHQUF1QyxPQUFBLENBQVEsY0FBUixDQU52QyxDQUFBOztBQUFBLEVBU007QUFDSiwrQkFBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0tBQUE7O0FBQUEsSUFBQSxRQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsS0FBRCxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLFlBQVA7T0FBTCxFQUEwQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ3hCLFVBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLGVBQVA7QUFBQSxZQUF3QixNQUFBLEVBQVEsY0FBaEM7V0FBTCxDQUFBLENBQUE7QUFBQSxVQUNBLEtBQUMsQ0FBQSxPQUFELENBQVMsbUJBQVQsRUFBa0MsSUFBQSxpQkFBQSxDQUFrQixLQUFLLENBQUMsYUFBeEIsQ0FBbEMsQ0FEQSxDQUFBO0FBQUEsVUFHQSxLQUFDLENBQUEs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
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/views/repo-view.coffee