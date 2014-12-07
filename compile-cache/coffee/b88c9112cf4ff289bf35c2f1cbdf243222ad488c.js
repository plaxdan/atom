(function() {
  var ErrorView, Repo, RepoView;

  Repo = require('./models/repo');

  RepoView = require('./views/repo-view');

  ErrorView = require('./views/error-view');

  module.exports = {
    configDefaults: {
      debug: false,
      pre_commit_hook: ''
    },
    repo: null,
    repoView: null,
    activate: function(state) {
      if (!atom.project.getRepo()) {
        return this.errorNoGitRepo();
      }
      this.insertCommands();
      return this.show();
    },
    hide: function() {
      if (this.repoView.hasParent()) {
        return this.repoView.detach();
      }
    },
    show: function() {
      if (!atom.project.getRepo()) {
        return this.errorNoGitRepo();
      }
      if (this.repo == null) {
        this.repo = new Repo();
      }
      if (this.repoView == null) {
        this.repoView = new RepoView(this.repo);
      }
      return this.repo.reload().then((function(_this) {
        return function() {
          var _ref;
          if (!((_ref = _this.repoView) != null ? _ref.hasParent() : void 0)) {
            atom.workspaceView.appendToRight(_this.repoView);
          }
          return _this.repoView.focus();
        };
      })(this));
    },
    deactivate: (function(_this) {
      return function() {
        _this.repo.destroy();
        return _this.repoView.destroy();
      };
    })(this),
    errorNoGitRepo: function() {
      return new ErrorView({
        message: 'Project is no git repository!'
      });
    },
    insertCommands: function() {
      atom.workspaceView.command('atomatigit:show', (function(_this) {
        return function() {
          return _this.show();
        };
      })(this));
      return atom.workspaceView.command('atomatigit:close', (function(_this) {
        return function() {
          return _this.hide();
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlCQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFZLE9BQUEsQ0FBUSxlQUFSLENBQVosQ0FBQTs7QUFBQSxFQUNBLFFBQUEsR0FBWSxPQUFBLENBQVEsbUJBQVIsQ0FEWixDQUFBOztBQUFBLEVBRUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxvQkFBUixDQUZaLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxjQUFBLEVBQ0U7QUFBQSxNQUFBLEtBQUEsRUFBTyxLQUFQO0FBQUEsTUFDQSxlQUFBLEVBQWlCLEVBRGpCO0tBREY7QUFBQSxJQUlBLElBQUEsRUFBTSxJQUpOO0FBQUEsSUFLQSxRQUFBLEVBQVUsSUFMVjtBQUFBLElBUUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO0FBQ1IsTUFBQSxJQUFBLENBQUEsSUFBb0MsQ0FBQyxPQUFPLENBQUMsT0FBYixDQUFBLENBQWhDO0FBQUEsZUFBTyxJQUFDLENBQUEsY0FBRCxDQUFBLENBQVAsQ0FBQTtPQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsY0FBRCxDQUFBLENBREEsQ0FBQTthQUVBLElBQUMsQ0FBQSxJQUFELENBQUEsRUFIUTtJQUFBLENBUlY7QUFBQSxJQWNBLElBQUEsRUFBTSxTQUFBLEdBQUE7QUFDSixNQUFBLElBQXNCLElBQUMsQ0FBQSxRQUFRLENBQUMsU0FBVixDQUFBLENBQXRCO2VBQUEsSUFBQyxDQUFBLFFBQVEsQ0FBQyxNQUFWLENBQUEsRUFBQTtPQURJO0lBQUEsQ0FkTjtBQUFBLElBa0JBLElBQUEsRUFBTSxTQUFBLEdBQUE7QUFDSixNQUFBLElBQUEsQ0FBQSxJQUFvQyxDQUFDLE9BQU8sQ0FBQyxPQUFiLENBQUEsQ0FBaEM7QUFBQSxlQUFPLElBQUMsQ0FBQSxjQUFELENBQUEsQ0FBUCxDQUFBO09BQUE7O1FBQ0EsSUFBQyxDQUFBLE9BQVksSUFBQSxJQUFBLENBQUE7T0FEYjs7UUFFQSxJQUFDLENBQUEsV0FBZ0IsSUFBQSxRQUFBLENBQVMsSUFBQyxDQUFBLElBQVY7T0FGakI7YUFHQSxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sQ0FBQSxDQUFjLENBQUMsSUFBZixDQUFvQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ2xCLGNBQUEsSUFBQTtBQUFBLFVBQUEsSUFBQSxDQUFBLHVDQUE0RCxDQUFFLFNBQVgsQ0FBQSxXQUFuRDtBQUFBLFlBQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxhQUFuQixDQUFpQyxLQUFDLENBQUEsUUFBbEMsQ0FBQSxDQUFBO1dBQUE7aUJBQ0EsS0FBQyxDQUFBLFFBQVEsQ0FBQyxLQUFWLENBQUEsRUFGa0I7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwQixFQUpJO0lBQUEsQ0FsQk47QUFBQSxJQTJCQSxVQUFBLEVBQVksQ0FBQSxTQUFBLEtBQUEsR0FBQTthQUFBLFNBQUEsR0FBQTtBQUNWLFFBQUEsS0FBQyxDQUFBLElBQUksQ0FBQyxPQUFOLENBQUEsQ0FBQSxDQUFBO2VBQ0EsS0FBQyxDQUFBLFFBQVEsQ0FBQyxPQUFWLENBQUEsRUFGVTtNQUFBLEVBQUE7SUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBM0JaO0FBQUEsSUFnQ0EsY0FBQSxFQUFnQixTQUFBLEdBQUE7YUFDVixJQUFBLFNBQUEsQ0FBVTtBQUFBLFFBQUEsT0FBQSxFQUFTLCtCQUFUO09BQVYsRUFEVTtJQUFBLENBaENoQjtBQUFBLElBb0NBLGNBQUEsRUFBZ0IsU0FBQSxHQUFBO0FBQ2QsTUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLGlCQUEzQixFQUE4QyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxJQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlDLENBQUEsQ0FBQTthQUNBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsa0JBQTNCLEVBQStDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLElBQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0MsRUFGYztJQUFBLENBcENoQjtHQUxGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/atomatigit.coffee