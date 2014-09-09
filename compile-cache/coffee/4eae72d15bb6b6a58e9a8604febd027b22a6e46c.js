(function() {
  var DiffView, FileView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  DiffView = require('../diffs/diff-view');

  module.exports = FileView = (function(_super) {
    __extends(FileView, _super);

    function FileView() {
      this.showDiff = __bind(this.showDiff, this);
      this.showSelection = __bind(this.showSelection, this);
      return FileView.__super__.constructor.apply(this, arguments);
    }

    FileView.content = function(file) {
      return this.div({
        "class": "file",
        mousedown: "clicked"
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": "filename"
          }, "" + (file.path()));
        };
      })(this));
    };

    FileView.prototype.initialize = function(file) {
      this.model = file;
      this.model.on("change:selected", this.showSelection);
      this.model.on("change:diff", this.showDiff);
      this.showSelection();
      return this.showDiff();
    };

    FileView.prototype.beforeRemove = function() {
      this.model.off("change:selected", this.showSelection);
      return this.model.off("change:diff", this.showDiff);
    };

    FileView.prototype.clicked = function() {
      return this.model.selfSelect();
    };

    FileView.prototype.showSelection = function() {
      return this.toggleClass("selected", this.model.selectedP());
    };

    FileView.prototype.showDiff = function() {
      this.find(".diff").remove();
      if (this.model.showDiffP()) {
        return this.append(new DiffView(this.model.diff()));
      }
    };

    return FileView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsTUFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUNBLFFBQUEsR0FBVyxPQUFBLENBQVEsb0JBQVIsQ0FEWCxDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLCtCQUFBLENBQUE7Ozs7OztLQUFBOztBQUFBLElBQUEsUUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLElBQUQsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxNQUFQO0FBQUEsUUFBZSxTQUFBLEVBQVcsU0FBMUI7T0FBTCxFQUEwQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUN4QyxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sVUFBUDtXQUFMLEVBQXdCLEVBQUEsR0FBRSxDQUFBLElBQUksQ0FBQyxJQUFMLENBQUEsQ0FBQSxDQUExQixFQUR3QztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFDLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsdUJBSUEsVUFBQSxHQUFZLFNBQUMsSUFBRCxHQUFBO0FBQ1YsTUFBQSxJQUFDLENBQUEsS0FBRCxHQUFTLElBQVQsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsaUJBQVYsRUFBNkIsSUFBQyxDQUFBLGFBQTlCLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsYUFBVixFQUF5QixJQUFDLENBQUEsUUFBMUIsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsYUFBRCxDQUFBLENBSEEsQ0FBQTthQUlBLElBQUMsQ0FBQSxRQUFELENBQUEsRUFMVTtJQUFBLENBSlosQ0FBQTs7QUFBQSx1QkFXQSxZQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ1osTUFBQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxpQkFBWCxFQUE4QixJQUFDLENBQUEsYUFBL0IsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsYUFBWCxFQUEwQixJQUFDLENBQUEsUUFBM0IsRUFGWTtJQUFBLENBWGQsQ0FBQTs7QUFBQSx1QkFlQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2FBQ1AsSUFBQyxDQUFBLEtBQUssQ0FBQyxVQUFQLENBQUEsRUFETztJQUFBLENBZlQsQ0FBQTs7QUFBQSx1QkFrQkEsYUFBQSxHQUFlLFNBQUEsR0FBQTthQUNiLElBQUMsQ0FBQSxXQUFELENBQWEsVUFBYixFQUF5QixJQUFDLENBQUEsS0FBSyxDQUFDLFNBQVAsQ0FBQSxDQUF6QixFQURhO0lBQUEsQ0FsQmYsQ0FBQTs7QUFBQSx1QkFxQkEsUUFBQSxHQUFVLFNBQUEsR0FBQTtBQUNSLE1BQUEsSUFBQyxDQUFBLElBQUQsQ0FBTSxPQUFOLENBQWMsQ0FBQyxNQUFmLENBQUEsQ0FBQSxDQUFBO0FBQ0EsTUFBQSxJQUFHLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUCxDQUFBLENBQUg7ZUFDRSxJQUFDLENBQUEsTUFBRCxDQUFZLElBQUEsUUFBQSxDQUFTLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBLENBQVQsQ0FBWixFQURGO09BRlE7SUFBQSxDQXJCVixDQUFBOztvQkFBQTs7S0FEcUIsS0FKdkIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/views/files/file-view.coffee