(function() {
  var GitNotFoundError, GitNotFoundErrorView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  GitNotFoundError = require('./git-bridge').GitNotFoundError;

  GitNotFoundErrorView = (function(_super) {
    __extends(GitNotFoundErrorView, _super);

    function GitNotFoundErrorView() {
      return GitNotFoundErrorView.__super__.constructor.apply(this, arguments);
    }

    GitNotFoundErrorView.content = function(err) {
      return this.div({
        "class": 'overlay from-top padded merge-conflict-error merge-conflicts-message'
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'panel'
          }, function() {
            _this.div({
              "class": "panel-heading text-error"
            }, function() {
              _this.code('git');
              _this.text("can't be found at ");
              _this.code(atom.config.get('merge-conflicts.gitPath'));
              return _this.text('!');
            });
            return _this.div({
              "class": 'panel-body'
            }, function() {
              _this.div({
                "class": 'block'
              }, 'Please fix the path in your settings.');
              return _this.div({
                "class": 'block'
              }, function() {
                _this.button({
                  "class": 'btn btn-error inline-block-tight',
                  click: 'openSettings'
                }, 'Open Settings');
                return _this.button({
                  "class": 'btn inline-block-tight',
                  click: 'notRightNow'
                }, 'Not Right Now');
              });
            });
          });
        };
      })(this));
    };

    GitNotFoundErrorView.prototype.openSettings = function() {
      atom.workspace.open('atom://config');
      return this.remove();
    };

    GitNotFoundErrorView.prototype.notRightNow = function() {
      return this.remove();
    };

    return GitNotFoundErrorView;

  })(View);

  module.exports = function(err) {
    if (err == null) {
      return false;
    }
    if (err instanceof GitNotFoundError) {
      atom.workspaceView.appendToTop(new GitNotFoundErrorView(err));
    }
    console.error(err);
    return true;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxPQUFRLE9BQUEsQ0FBUSxNQUFSLEVBQVIsSUFBRCxDQUFBOztBQUFBLEVBQ0MsbUJBQW9CLE9BQUEsQ0FBUSxjQUFSLEVBQXBCLGdCQURELENBQUE7O0FBQUEsRUFHTTtBQUVKLDJDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLG9CQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsR0FBRCxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLHNFQUFQO09BQUwsRUFBb0YsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDbEYsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLE9BQVA7V0FBTCxFQUFxQixTQUFBLEdBQUE7QUFDbkIsWUFBQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsY0FBQSxPQUFBLEVBQU8sMEJBQVA7YUFBTCxFQUF3QyxTQUFBLEdBQUE7QUFDdEMsY0FBQSxLQUFDLENBQUEsSUFBRCxDQUFNLEtBQU4sQ0FBQSxDQUFBO0FBQUEsY0FDQSxLQUFDLENBQUEsSUFBRCxDQUFNLG9CQUFOLENBREEsQ0FBQTtBQUFBLGNBRUEsS0FBQyxDQUFBLElBQUQsQ0FBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IseUJBQWhCLENBQU4sQ0FGQSxDQUFBO3FCQUdBLEtBQUMsQ0FBQSxJQUFELENBQU0sR0FBTixFQUpzQztZQUFBLENBQXhDLENBQUEsQ0FBQTttQkFLQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsY0FBQSxPQUFBLEVBQU8sWUFBUDthQUFMLEVBQTBCLFNBQUEsR0FBQTtBQUN4QixjQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxnQkFBQSxPQUFBLEVBQU8sT0FBUDtlQUFMLEVBQ0UsdUNBREYsQ0FBQSxDQUFBO3FCQUVBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxnQkFBQSxPQUFBLEVBQU8sT0FBUDtlQUFMLEVBQXFCLFNBQUEsR0FBQTtBQUNuQixnQkFBQSxLQUFDLENBQUEsTUFBRCxDQUFRO0FBQUEsa0JBQUEsT0FBQSxFQUFPLGtDQUFQO0FBQUEsa0JBQTJDLEtBQUEsRUFBTyxjQUFsRDtpQkFBUixFQUEwRSxlQUExRSxDQUFBLENBQUE7dUJBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBUTtBQUFBLGtCQUFBLE9BQUEsRUFBTyx3QkFBUDtBQUFBLGtCQUFpQyxLQUFBLEVBQU8sYUFBeEM7aUJBQVIsRUFBK0QsZUFBL0QsRUFGbUI7Y0FBQSxDQUFyQixFQUh3QjtZQUFBLENBQTFCLEVBTm1CO1VBQUEsQ0FBckIsRUFEa0Y7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFwRixFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLG1DQWVBLFlBQUEsR0FBYyxTQUFBLEdBQUE7QUFDWixNQUFBLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixlQUFwQixDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBRlk7SUFBQSxDQWZkLENBQUE7O0FBQUEsbUNBbUJBLFdBQUEsR0FBYSxTQUFBLEdBQUE7YUFDWCxJQUFDLENBQUEsTUFBRCxDQUFBLEVBRFc7SUFBQSxDQW5CYixDQUFBOztnQ0FBQTs7S0FGaUMsS0FIbkMsQ0FBQTs7QUFBQSxFQTJCQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLEdBQUQsR0FBQTtBQUNmLElBQUEsSUFBb0IsV0FBcEI7QUFBQSxhQUFPLEtBQVAsQ0FBQTtLQUFBO0FBRUEsSUFBQSxJQUFHLEdBQUEsWUFBZSxnQkFBbEI7QUFDRSxNQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBbkIsQ0FBbUMsSUFBQSxvQkFBQSxDQUFxQixHQUFyQixDQUFuQyxDQUFBLENBREY7S0FGQTtBQUFBLElBS0EsT0FBTyxDQUFDLEtBQVIsQ0FBYyxHQUFkLENBTEEsQ0FBQTtXQU1BLEtBUGU7RUFBQSxDQTNCakIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/merge-conflicts/lib/error-view.coffee