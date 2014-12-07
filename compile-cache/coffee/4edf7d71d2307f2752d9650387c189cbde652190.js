(function() {
  var $, ErrorView, View, prettyjson, _, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  prettyjson = require('prettyjson');

  _ref = require('atom'), $ = _ref.$, View = _ref.View;

  ErrorView = (function(_super) {
    __extends(ErrorView, _super);

    function ErrorView() {
      return ErrorView.__super__.constructor.apply(this, arguments);
    }

    ErrorView.content = function(raw) {
      var message;
      message = _.isString(raw) ? raw : raw.message;
      return this.div((function(_this) {
        return function() {
          return _this.div({
            "class": 'overlay from-bottom atomatigit-error',
            outlet: 'messagePanel'
          }, function() {
            return _this.div({
              "class": 'panel-body padded error-message'
            }, message);
          });
        };
      })(this));
    };

    ErrorView.prototype.initialize = function(error) {
      if (atom.config.get('atomatigit.debug')) {
        console.trace(prettyjson.render(error, {
          noColor: true
        }));
      }
      this.messagePanel.on('click', this.detach);
      atom.workspaceView.append(this);
      return setTimeout(((function(_this) {
        return function() {
          return _this.detach();
        };
      })(this)), 10000);
    };

    return ErrorView;

  })(View);

  module.exports = ErrorView;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQWEsT0FBQSxDQUFRLFFBQVIsQ0FBYixDQUFBOztBQUFBLEVBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxZQUFSLENBRGIsQ0FBQTs7QUFBQSxFQUVBLE9BQWEsT0FBQSxDQUFRLE1BQVIsQ0FBYixFQUFDLFNBQUEsQ0FBRCxFQUFJLFlBQUEsSUFGSixDQUFBOztBQUFBLEVBS007QUFDSixnQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxTQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsR0FBRCxHQUFBO0FBQ1IsVUFBQSxPQUFBO0FBQUEsTUFBQSxPQUFBLEdBQWEsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxHQUFYLENBQUgsR0FBd0IsR0FBeEIsR0FBaUMsR0FBRyxDQUFDLE9BQS9DLENBQUE7YUFDQSxJQUFDLENBQUEsR0FBRCxDQUFLLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ0gsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLHNDQUFQO0FBQUEsWUFBK0MsTUFBQSxFQUFRLGNBQXZEO1dBQUwsRUFBNEUsU0FBQSxHQUFBO21CQUMxRSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsY0FBQSxPQUFBLEVBQU8saUNBQVA7YUFBTCxFQUErQyxPQUEvQyxFQUQwRTtVQUFBLENBQTVFLEVBREc7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFMLEVBRlE7SUFBQSxDQUFWLENBQUE7O0FBQUEsd0JBT0EsVUFBQSxHQUFZLFNBQUMsS0FBRCxHQUFBO0FBQ1YsTUFBQSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixrQkFBaEIsQ0FBSDtBQUNFLFFBQUEsT0FBTyxDQUFDLEtBQVIsQ0FBYyxVQUFVLENBQUMsTUFBWCxDQUFrQixLQUFsQixFQUF5QjtBQUFBLFVBQUEsT0FBQSxFQUFTLElBQVQ7U0FBekIsQ0FBZCxDQUFBLENBREY7T0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFlBQVksQ0FBQyxFQUFkLENBQWlCLE9BQWpCLEVBQTBCLElBQUMsQ0FBQSxNQUEzQixDQUhBLENBQUE7QUFBQSxNQUlBLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBbkIsQ0FBMEIsSUFBMUIsQ0FKQSxDQUFBO2FBS0EsVUFBQSxDQUFXLENBQUMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFELENBQVgsRUFBMkIsS0FBM0IsRUFOVTtJQUFBLENBUFosQ0FBQTs7cUJBQUE7O0tBRHNCLEtBTHhCLENBQUE7O0FBQUEsRUFxQkEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FyQmpCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/views/error-view.coffee