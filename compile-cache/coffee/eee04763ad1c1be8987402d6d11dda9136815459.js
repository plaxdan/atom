(function() {
  var FilesizeView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require("atom").View;

  module.exports = FilesizeView = (function(_super) {
    __extends(FilesizeView, _super);

    function FilesizeView() {
      return FilesizeView.__super__.constructor.apply(this, arguments);
    }

    FilesizeView.prototype.visible = false;

    FilesizeView.prototype.shouldDisplay = true;

    FilesizeView.content = function() {
      return this.div({
        "class": "file-size inline-block"
      }, (function(_this) {
        return function() {
          return _this.span("", {
            "class": "current-size",
            outlet: "currentSize"
          });
        };
      })(this));
    };

    FilesizeView.prototype.initialize = function() {};

    FilesizeView.prototype.display = function(info) {
      var _ref;
      if (this.shouldDisplay) {
        this.show();
        return (_ref = atom.workspaceView.statusBar) != null ? _ref.find(".current-size")[0].innerHTML = info : void 0;
      }
    };

    FilesizeView.prototype.show = function() {
      var _ref;
      if (!this.visible) {
        if ((_ref = atom.workspaceView.statusBar) != null) {
          _ref.appendLeft(this);
        }
        return this.visible = true;
      }
    };

    FilesizeView.prototype.hide = function() {
      var _ref;
      if ((_ref = atom.workspaceView.statusBar) != null) {
        _ref.find(".file-size").remove();
      }
      return this.visible = false;
    };

    FilesizeView.prototype.destroy = function() {
      this.hide();
      return this.shouldDisplay = false;
    };

    return FilesizeView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxPQUFRLE9BQUEsQ0FBUSxNQUFSLEVBQVIsSUFBRCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUVKLG1DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSwyQkFBQSxPQUFBLEdBQVMsS0FBVCxDQUFBOztBQUFBLDJCQUVBLGFBQUEsR0FBZSxJQUZmLENBQUE7O0FBQUEsSUFJQSxZQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyx3QkFBUDtPQUFMLEVBQXNDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ3BDLEtBQUMsQ0FBQSxJQUFELENBQU0sRUFBTixFQUFVO0FBQUEsWUFBQSxPQUFBLEVBQU8sY0FBUDtBQUFBLFlBQXVCLE1BQUEsRUFBUSxhQUEvQjtXQUFWLEVBRG9DO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdEMsRUFEUTtJQUFBLENBSlYsQ0FBQTs7QUFBQSwyQkFRQSxVQUFBLEdBQVksU0FBQSxHQUFBLENBUlosQ0FBQTs7QUFBQSwyQkFVQSxPQUFBLEdBQVMsU0FBQyxJQUFELEdBQUE7QUFFUCxVQUFBLElBQUE7QUFBQSxNQUFBLElBQUcsSUFBQyxDQUFBLGFBQUo7QUFDRSxRQUFBLElBQUMsQ0FBQSxJQUFELENBQUEsQ0FBQSxDQUFBO21FQUU0QixDQUFFLElBQTlCLENBQW1DLGVBQW5DLENBQW9ELENBQUEsQ0FBQSxDQUFFLENBQUMsU0FBdkQsR0FBbUUsY0FIckU7T0FGTztJQUFBLENBVlQsQ0FBQTs7QUFBQSwyQkFpQkEsSUFBQSxHQUFNLFNBQUEsR0FBQTtBQUNKLFVBQUEsSUFBQTtBQUFBLE1BQUEsSUFBRyxDQUFBLElBQUssQ0FBQSxPQUFSOztjQUU4QixDQUFFLFVBQTlCLENBQXlDLElBQXpDO1NBQUE7ZUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLEtBSGI7T0FESTtJQUFBLENBakJOLENBQUE7O0FBQUEsMkJBdUJBLElBQUEsR0FBTSxTQUFBLEdBQUE7QUFDSixVQUFBLElBQUE7O1lBQTRCLENBQUUsSUFBOUIsQ0FBbUMsWUFBbkMsQ0FBZ0QsQ0FBQyxNQUFqRCxDQUFBO09BQUE7YUFDQSxJQUFDLENBQUEsT0FBRCxHQUFXLE1BRlA7SUFBQSxDQXZCTixDQUFBOztBQUFBLDJCQTJCQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsTUFBQSxJQUFDLENBQUEsSUFBRCxDQUFBLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCLE1BRlY7SUFBQSxDQTNCVCxDQUFBOzt3QkFBQTs7S0FGeUIsS0FIM0IsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/filesize/lib/filesize-view.coffee