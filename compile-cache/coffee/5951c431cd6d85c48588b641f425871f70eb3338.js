(function() {
  var ErrorView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  module.exports = ErrorView = (function(_super) {
    __extends(ErrorView, _super);

    function ErrorView() {
      return ErrorView.__super__.constructor.apply(this, arguments);
    }

    ErrorView.content = function() {
      return this.div((function(_this) {
        return function() {
          _this.div({
            "class": "loading loading-spinner-small spinner",
            outlet: "spinner"
          });
          return _this.div({
            "class": "inset-panel atomatigit-error",
            outlet: "message_panel"
          }, function() {
            _this.div({
              "class": "panel-heading"
            }, function() {
              _this.div({
                "class": "close-button",
                outlet: "close_button"
              }, function() {
                return _this.raw("&#10006;");
              });
              return _this.text("git output");
            });
            return _this.div({
              "class": "panel-body padded error-message",
              outlet: "message"
            });
          });
        };
      })(this));
    };

    ErrorView.prototype.initialize = function(model) {
      this.model = model;
      this.model.on("error", (function(_this) {
        return function() {
          return _this.repaint();
        };
      })(this));
      this.model.on("change:task_counter", (function(_this) {
        return function() {
          return _this.toggle_spinner();
        };
      })(this));
      return this.close_button.on("click", (function(_this) {
        return function() {
          return _this.message_panel.hide();
        };
      })(this));
    };

    ErrorView.prototype.repaint = function() {
      this.message_panel.show();
      return this.message.html(this.model.messageMarkup());
    };

    ErrorView.prototype.toggle_spinner = function() {
      if (this.model.workingP()) {
        return this.spinner.show();
      } else {
        return this.spinner.hide();
      }
    };

    return ErrorView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGVBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLE9BQVEsT0FBQSxDQUFRLE1BQVIsRUFBUixJQUFELENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osZ0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLElBQUEsU0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDSCxVQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyx1Q0FBUDtBQUFBLFlBQWdELE1BQUEsRUFBUSxTQUF4RDtXQUFMLENBQUEsQ0FBQTtpQkFDQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sOEJBQVA7QUFBQSxZQUF1QyxNQUFBLEVBQVEsZUFBL0M7V0FBTCxFQUFxRSxTQUFBLEdBQUE7QUFDbkUsWUFBQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsY0FBQSxPQUFBLEVBQU8sZUFBUDthQUFMLEVBQTZCLFNBQUEsR0FBQTtBQUMzQixjQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxnQkFBQSxPQUFBLEVBQU8sY0FBUDtBQUFBLGdCQUF1QixNQUFBLEVBQVEsY0FBL0I7ZUFBTCxFQUFvRCxTQUFBLEdBQUE7dUJBQ2xELEtBQUMsQ0FBQSxHQUFELENBQUssVUFBTCxFQURrRDtjQUFBLENBQXBELENBQUEsQ0FBQTtxQkFFQSxLQUFDLENBQUEsSUFBRCxDQUFNLFlBQU4sRUFIMkI7WUFBQSxDQUE3QixDQUFBLENBQUE7bUJBSUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGNBQUEsT0FBQSxFQUFPLGlDQUFQO0FBQUEsY0FBMEMsTUFBQSxFQUFRLFNBQWxEO2FBQUwsRUFMbUU7VUFBQSxDQUFyRSxFQUZHO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTCxFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLHdCQVVBLFVBQUEsR0FBWSxTQUFDLEtBQUQsR0FBQTtBQUNWLE1BQUEsSUFBQyxDQUFBLEtBQUQsR0FBUyxLQUFULENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLE9BQVYsRUFBbUIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsT0FBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQixDQURBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLHFCQUFWLEVBQWlDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLGNBQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakMsQ0FGQSxDQUFBO2FBR0EsSUFBQyxDQUFBLFlBQVksQ0FBQyxFQUFkLENBQWlCLE9BQWpCLEVBQTBCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLGFBQWEsQ0FBQyxJQUFmLENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFCLEVBSlU7SUFBQSxDQVZaLENBQUE7O0FBQUEsd0JBZ0JBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxNQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUFBLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLElBQUMsQ0FBQSxLQUFLLENBQUMsYUFBUCxDQUFBLENBQWQsRUFGTztJQUFBLENBaEJULENBQUE7O0FBQUEsd0JBb0JBLGNBQUEsR0FBZ0IsU0FBQSxHQUFBO0FBQ2QsTUFBQSxJQUFHLElBQUMsQ0FBQSxLQUFLLENBQUMsUUFBUCxDQUFBLENBQUg7ZUFDRSxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFBLEVBSEY7T0FEYztJQUFBLENBcEJoQixDQUFBOztxQkFBQTs7S0FEc0IsS0FIeEIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/views/error-view.coffee