(function() {
  var $, EditorView, InputView, StatusView, View, git, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), $ = _ref.$, EditorView = _ref.EditorView, View = _ref.View;

  git = require('../git');

  StatusView = require('../views/status-view');

  InputView = (function(_super) {
    __extends(InputView, _super);

    function InputView() {
      return InputView.__super__.constructor.apply(this, arguments);
    }

    InputView.content = function() {
      return this.div({
        "class": 'overlay from-top'
      }, (function(_this) {
        return function() {
          return _this.subview('commandEditor', new EditorView({
            mini: true,
            placeHolderText: 'Git command and arguments'
          }));
        };
      })(this));
    };

    InputView.prototype.initialize = function() {
      this.currentPane = atom.workspace.getActivePane();
      atom.workspaceView.append(this);
      this.commandEditor.focus();
      this.on('core:cancel', (function(_this) {
        return function() {
          return _this.detach();
        };
      })(this));
      return this.commandEditor.on('core:confirm', (function(_this) {
        return function() {
          var args;
          _this.detach();
          args = $(_this).text().split(' ');
          if (args[0] === 1) {
            args.shift();
          }
          return git.cmd({
            args: args,
            stdout: function(data) {
              var _ref1;
              new StatusView({
                type: 'success',
                message: data.toString()
              });
              if ((_ref1 = atom.project.getRepo()) != null) {
                _ref1.refreshStatus();
              }
              return _this.currentPane.activate();
            }
          });
        };
      })(this));
    };

    return InputView;

  })(View);

  module.exports = function() {
    return new InputView;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFEQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUF3QixPQUFBLENBQVEsTUFBUixDQUF4QixFQUFDLFNBQUEsQ0FBRCxFQUFJLGtCQUFBLFVBQUosRUFBZ0IsWUFBQSxJQUFoQixDQUFBOztBQUFBLEVBRUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxRQUFSLENBRk4sQ0FBQTs7QUFBQSxFQUdBLFVBQUEsR0FBYSxPQUFBLENBQVEsc0JBQVIsQ0FIYixDQUFBOztBQUFBLEVBS007QUFDSixnQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxTQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxrQkFBUDtPQUFMLEVBQWdDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQzlCLEtBQUMsQ0FBQSxPQUFELENBQVMsZUFBVCxFQUE4QixJQUFBLFVBQUEsQ0FBVztBQUFBLFlBQUEsSUFBQSxFQUFNLElBQU47QUFBQSxZQUFZLGVBQUEsRUFBaUIsMkJBQTdCO1dBQVgsQ0FBOUIsRUFEOEI7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQyxFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLHdCQUlBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxXQUFELEdBQWUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQUEsQ0FBZixDQUFBO0FBQUEsTUFDQSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQW5CLENBQTBCLElBQTFCLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxLQUFmLENBQUEsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsRUFBRCxDQUFJLGFBQUosRUFBbUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQixDQUhBLENBQUE7YUFJQSxJQUFDLENBQUEsYUFBYSxDQUFDLEVBQWYsQ0FBa0IsY0FBbEIsRUFBa0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNoQyxjQUFBLElBQUE7QUFBQSxVQUFBLEtBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsVUFDQSxJQUFBLEdBQU8sQ0FBQSxDQUFFLEtBQUYsQ0FBTyxDQUFDLElBQVIsQ0FBQSxDQUFjLENBQUMsS0FBZixDQUFxQixHQUFyQixDQURQLENBQUE7QUFFQSxVQUFBLElBQUcsSUFBSyxDQUFBLENBQUEsQ0FBTCxLQUFXLENBQWQ7QUFBcUIsWUFBQSxJQUFJLENBQUMsS0FBTCxDQUFBLENBQUEsQ0FBckI7V0FGQTtpQkFHQSxHQUFHLENBQUMsR0FBSixDQUNFO0FBQUEsWUFBQSxJQUFBLEVBQU0sSUFBTjtBQUFBLFlBQ0EsTUFBQSxFQUFRLFNBQUMsSUFBRCxHQUFBO0FBQ04sa0JBQUEsS0FBQTtBQUFBLGNBQUksSUFBQSxVQUFBLENBQVc7QUFBQSxnQkFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLGdCQUFpQixPQUFBLEVBQVMsSUFBSSxDQUFDLFFBQUwsQ0FBQSxDQUExQjtlQUFYLENBQUosQ0FBQTs7cUJBQ3NCLENBQUUsYUFBeEIsQ0FBQTtlQURBO3FCQUVBLEtBQUMsQ0FBQSxXQUFXLENBQUMsUUFBYixDQUFBLEVBSE07WUFBQSxDQURSO1dBREYsRUFKZ0M7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQyxFQUxVO0lBQUEsQ0FKWixDQUFBOztxQkFBQTs7S0FEc0IsS0FMeEIsQ0FBQTs7QUFBQSxFQTBCQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFBLEdBQUE7V0FBRyxHQUFBLENBQUEsVUFBSDtFQUFBLENBMUJqQixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/git-plus/lib/models/git-run.coffee