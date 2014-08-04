
/*
Borrow from feedback package
 */

(function() {
  var $, NotificationView, View, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), $ = _ref.$, View = _ref.View;

  module.exports = NotificationView = (function(_super) {
    __extends(NotificationView, _super);

    function NotificationView() {
      return NotificationView.__super__.constructor.apply(this, arguments);
    }

    NotificationView.warn = function() {
      return this.li((function(_this) {
        return function() {
          _this.span("'");
          _this.a({
            href: "https://atom.io/packages/coffee-refactor"
          }, "coffee-refactor");
          _this.span("' package requires '");
          _this.a({
            href: "https://atom.io/packages/refactor"
          }, "refactor");
          return _this.span("' package");
        };
      })(this));
    };

    NotificationView.content = function() {
      return this.div({
        tabindex: -1,
        "class": 'notification overlay from-top native-key-bindings'
      }, (function(_this) {
        return function() {
          _this.h1("Requires related package installation");
          _this.ul(function() {
            return _this.warn();
          });
          return _this.p("You can install and activate packages using the preference pane.");
        };
      })(this));
    };

    NotificationView.prototype.initialize = function() {
      var $notification, html;
      if (($notification = atom.workspaceView.find('.notification')).length === 0) {
        atom.workspaceView.prepend(this);
      } else {
        html = this.constructor.buildHtml(function() {
          return this.warn();
        });
        $notification.find('ul').append(html);
      }
      this.subscribe(this, 'focusout', (function(_this) {
        return function() {
          return process.nextTick(function() {
            if (!(_this.is(':focus') || _this.find(':focus').length > 0)) {
              return _this.detach();
            }
          });
        };
      })(this));
      this.subscribe(atom.workspaceView, 'core:cancel', (function(_this) {
        return function() {
          return _this.detach();
        };
      })(this));
      return this.focus();
    };

    return NotificationView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7R0FBQTtBQUFBO0FBQUE7QUFBQSxNQUFBLCtCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFJQSxPQUFZLE9BQUEsQ0FBUSxNQUFSLENBQVosRUFBQyxTQUFBLENBQUQsRUFBSSxZQUFBLElBSkosQ0FBQTs7QUFBQSxFQU1BLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSix1Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxnQkFBQyxDQUFBLElBQUQsR0FBTyxTQUFBLEdBQUE7YUFDTCxJQUFDLENBQUEsRUFBRCxDQUFJLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDRixVQUFBLEtBQUMsQ0FBQSxJQUFELENBQU0sR0FBTixDQUFBLENBQUE7QUFBQSxVQUNBLEtBQUMsQ0FBQSxDQUFELENBQUc7QUFBQSxZQUFBLElBQUEsRUFBTSwwQ0FBTjtXQUFILEVBQXFELGlCQUFyRCxDQURBLENBQUE7QUFBQSxVQUVBLEtBQUMsQ0FBQSxJQUFELENBQU0sc0JBQU4sQ0FGQSxDQUFBO0FBQUEsVUFHQSxLQUFDLENBQUEsQ0FBRCxDQUFHO0FBQUEsWUFBQSxJQUFBLEVBQU0sbUNBQU47V0FBSCxFQUE4QyxVQUE5QyxDQUhBLENBQUE7aUJBSUEsS0FBQyxDQUFBLElBQUQsQ0FBTSxXQUFOLEVBTEU7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFKLEVBREs7SUFBQSxDQUFQLENBQUE7O0FBQUEsSUFPQSxnQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxRQUFBLEVBQVUsQ0FBQSxDQUFWO0FBQUEsUUFBYyxPQUFBLEVBQU8sbURBQXJCO09BQUwsRUFBK0UsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUM3RSxVQUFBLEtBQUMsQ0FBQSxFQUFELENBQUksdUNBQUosQ0FBQSxDQUFBO0FBQUEsVUFDQSxLQUFDLENBQUEsRUFBRCxDQUFJLFNBQUEsR0FBQTttQkFBRyxLQUFDLENBQUEsSUFBRCxDQUFBLEVBQUg7VUFBQSxDQUFKLENBREEsQ0FBQTtpQkFFQSxLQUFDLENBQUEsQ0FBRCxDQUFHLGtFQUFILEVBSDZFO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0UsRUFEUTtJQUFBLENBUFYsQ0FBQTs7QUFBQSwrQkFhQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQ1YsVUFBQSxtQkFBQTtBQUFBLE1BQUEsSUFBRyxDQUFDLGFBQUEsR0FBZ0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFuQixDQUF3QixlQUF4QixDQUFqQixDQUEwRCxDQUFDLE1BQTNELEtBQXFFLENBQXhFO0FBQ0UsUUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLElBQTNCLENBQUEsQ0FERjtPQUFBLE1BQUE7QUFHRSxRQUFBLElBQUEsR0FBTyxJQUFDLENBQUEsV0FBVyxDQUFDLFNBQWIsQ0FBdUIsU0FBQSxHQUFBO2lCQUFHLElBQUMsQ0FBQSxJQUFELENBQUEsRUFBSDtRQUFBLENBQXZCLENBQVAsQ0FBQTtBQUFBLFFBQ0EsYUFBYSxDQUFDLElBQWQsQ0FBbUIsSUFBbkIsQ0FBd0IsQ0FBQyxNQUF6QixDQUFnQyxJQUFoQyxDQURBLENBSEY7T0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFYLEVBQWlCLFVBQWpCLEVBQTZCLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBRTNCLE9BQU8sQ0FBQyxRQUFSLENBQWlCLFNBQUEsR0FBQTtBQUNmLFlBQUEsSUFBQSxDQUFBLENBQWlCLEtBQUMsQ0FBQSxFQUFELENBQUksUUFBSixDQUFBLElBQWlCLEtBQUMsQ0FBQSxJQUFELENBQU0sUUFBTixDQUFlLENBQUMsTUFBaEIsR0FBeUIsQ0FBM0QsQ0FBQTtxQkFBQSxLQUFDLENBQUEsTUFBRCxDQUFBLEVBQUE7YUFEZTtVQUFBLENBQWpCLEVBRjJCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0IsQ0FOQSxDQUFBO0FBQUEsTUFXQSxJQUFDLENBQUEsU0FBRCxDQUFXLElBQUksQ0FBQyxhQUFoQixFQUErQixhQUEvQixFQUE4QyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxNQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlDLENBWEEsQ0FBQTthQWFBLElBQUMsQ0FBQSxLQUFELENBQUEsRUFkVTtJQUFBLENBYlosQ0FBQTs7NEJBQUE7O0tBRDZCLEtBUC9CLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/coffee-refactor/lib/notification-view.coffee