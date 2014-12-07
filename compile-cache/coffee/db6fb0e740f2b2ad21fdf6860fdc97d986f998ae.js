(function() {
  var BranchListView, OutputView, PullBranchListView, git,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  git = require('../git');

  OutputView = require('./output-view');

  BranchListView = require('./branch-list-view');

  module.exports = PullBranchListView = (function(_super) {
    __extends(PullBranchListView, _super);

    function PullBranchListView() {
      return PullBranchListView.__super__.constructor.apply(this, arguments);
    }

    PullBranchListView.prototype.initialize = function(remote) {
      this.remote = remote;
      return git.cmd({
        args: ['branch', '-r'],
        stdout: (function(_this) {
          return function(data) {
            _this.data = data;
            return PullBranchListView.__super__.initialize.apply(_this, arguments);
          };
        })(this)
      });
    };

    PullBranchListView.prototype.confirmed = function(_arg) {
      var name;
      name = _arg.name;
      this.pull(name.split('/')[1]);
      return this.cancel();
    };

    PullBranchListView.prototype.pull = function(remoteBranch) {
      var remote, view;
      if (remoteBranch == null) {
        remoteBranch = '';
      }
      view = new OutputView();
      remote = this.remote;
      return git.cmd({
        args: ['fetch', this.remote],
        stdout: function(data) {
          this.data = data;
          if (this.data.toString().length === 0) {
            return git.cmd({
              args: ['merge', remote + "/" + remoteBranch],
              stdout: function(data) {
                return view.addLine(data.toString());
              },
              stderr: function(data) {
                return view.addLine(data.toString());
              },
              exit: (function(_this) {
                return function(code) {
                  return view.finish();
                };
              })(this)
            });
          }
        },
        stderr: function(data) {
          return view.addLine(data.toString());
        }
      });
    };

    return PullBranchListView;

  })(BranchListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1EQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVIsQ0FBTixDQUFBOztBQUFBLEVBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBRGIsQ0FBQTs7QUFBQSxFQUVBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG9CQUFSLENBRmpCLENBQUE7O0FBQUEsRUFJQSxNQUFNLENBQUMsT0FBUCxHQUdRO0FBQ0oseUNBQUEsQ0FBQTs7OztLQUFBOztBQUFBLGlDQUFBLFVBQUEsR0FBWSxTQUFFLE1BQUYsR0FBQTtBQUNWLE1BRFcsSUFBQyxDQUFBLFNBQUEsTUFDWixDQUFBO2FBQUEsR0FBRyxDQUFDLEdBQUosQ0FDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLENBQUMsUUFBRCxFQUFXLElBQVgsQ0FBTjtBQUFBLFFBQ0EsTUFBQSxFQUFRLENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBRSxJQUFGLEdBQUE7QUFDTixZQURPLEtBQUMsQ0FBQSxPQUFBLElBQ1IsQ0FBQTttQkFBQSxxREFBQSxTQUFBLEVBRE07VUFBQSxFQUFBO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQURSO09BREYsRUFEVTtJQUFBLENBQVosQ0FBQTs7QUFBQSxpQ0FNQSxTQUFBLEdBQVcsU0FBQyxJQUFELEdBQUE7QUFDVCxVQUFBLElBQUE7QUFBQSxNQURXLE9BQUQsS0FBQyxJQUNYLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxJQUFELENBQU0sSUFBSSxDQUFDLEtBQUwsQ0FBVyxHQUFYLENBQWdCLENBQUEsQ0FBQSxDQUF0QixDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBRlM7SUFBQSxDQU5YLENBQUE7O0FBQUEsaUNBVUEsSUFBQSxHQUFNLFNBQUMsWUFBRCxHQUFBO0FBQ0osVUFBQSxZQUFBOztRQURLLGVBQWE7T0FDbEI7QUFBQSxNQUFBLElBQUEsR0FBVyxJQUFBLFVBQUEsQ0FBQSxDQUFYLENBQUE7QUFBQSxNQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEsTUFEVixDQUFBO2FBRUEsR0FBRyxDQUFDLEdBQUosQ0FDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLENBQUMsT0FBRCxFQUFVLElBQUMsQ0FBQSxNQUFYLENBQU47QUFBQSxRQUNBLE1BQUEsRUFBUSxTQUFFLElBQUYsR0FBQTtBQUNOLFVBRE8sSUFBQyxDQUFBLE9BQUEsSUFDUixDQUFBO0FBQUEsVUFBQSxJQUFHLElBQUMsQ0FBQSxJQUFJLENBQUMsUUFBTixDQUFBLENBQWdCLENBQUMsTUFBakIsS0FBMkIsQ0FBOUI7bUJBQ0UsR0FBRyxDQUFDLEdBQUosQ0FDRTtBQUFBLGNBQUEsSUFBQSxFQUFNLENBQUMsT0FBRCxFQUFVLE1BQUEsR0FBUyxHQUFULEdBQWUsWUFBekIsQ0FBTjtBQUFBLGNBQ0EsTUFBQSxFQUFRLFNBQUMsSUFBRCxHQUFBO3VCQUFVLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBSSxDQUFDLFFBQUwsQ0FBQSxDQUFiLEVBQVY7Y0FBQSxDQURSO0FBQUEsY0FFQSxNQUFBLEVBQVEsU0FBQyxJQUFELEdBQUE7dUJBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFJLENBQUMsUUFBTCxDQUFBLENBQWIsRUFBVjtjQUFBLENBRlI7QUFBQSxjQUdBLElBQUEsRUFBTSxDQUFBLFNBQUEsS0FBQSxHQUFBO3VCQUFBLFNBQUMsSUFBRCxHQUFBO3lCQUNKLElBQUksQ0FBQyxNQUFMLENBQUEsRUFESTtnQkFBQSxFQUFBO2NBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUhOO2FBREYsRUFERjtXQURNO1FBQUEsQ0FEUjtBQUFBLFFBU0EsTUFBQSxFQUFRLFNBQUMsSUFBRCxHQUFBO2lCQUFVLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBSSxDQUFDLFFBQUwsQ0FBQSxDQUFiLEVBQVY7UUFBQSxDQVRSO09BREYsRUFISTtJQUFBLENBVk4sQ0FBQTs7OEJBQUE7O0tBRCtCLGVBUG5DLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/git-plus/lib/views/pull-branch-list-view.coffee