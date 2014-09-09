(function() {
  var DiffChunkView, DiffLineView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  DiffLineView = require('./diff-line-view');

  module.exports = DiffChunkView = (function(_super) {
    __extends(DiffChunkView, _super);

    function DiffChunkView() {
      this.showSelection = __bind(this.showSelection, this);
      return DiffChunkView.__super__.constructor.apply(this, arguments);
    }

    DiffChunkView.content = function() {
      return this.div({
        "class": "diff-chunk",
        click: "clicked"
      });
    };

    DiffChunkView.prototype.initialize = function(model) {
      var line, _i, _len, _ref, _results;
      this.model = model;
      this.model.on("change:selected", this.showSelection);
      _ref = this.model.lines;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        _results.push(this.append(new DiffLineView(line)));
      }
      return _results;
    };

    DiffChunkView.prototype.beforeRemove = function() {
      return this.model.off("change:selected", this.showSelection);
    };

    DiffChunkView.prototype.clicked = function() {
      return this.model.selfSelect();
    };

    DiffChunkView.prototype.showSelection = function() {
      this.removeClass("selected");
      if (this.model.selectedP()) {
        return this.addClass("selected");
      }
    };

    return DiffChunkView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlDQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsTUFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUNBLFlBQUEsR0FBZSxPQUFBLENBQVEsa0JBQVIsQ0FEZixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLG9DQUFBLENBQUE7Ozs7O0tBQUE7O0FBQUEsSUFBQSxhQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxZQUFQO0FBQUEsUUFBcUIsS0FBQSxFQUFPLFNBQTVCO09BQUwsRUFEUTtJQUFBLENBQVYsQ0FBQTs7QUFBQSw0QkFHQSxVQUFBLEdBQVksU0FBRSxLQUFGLEdBQUE7QUFDVixVQUFBLDhCQUFBO0FBQUEsTUFEVyxJQUFDLENBQUEsUUFBQSxLQUNaLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxLQUFLLENBQUMsRUFBUCxDQUFVLGlCQUFWLEVBQTZCLElBQUMsQ0FBQSxhQUE5QixDQUFBLENBQUE7QUFFQTtBQUFBO1dBQUEsMkNBQUE7d0JBQUE7QUFDRSxzQkFBQSxJQUFDLENBQUEsTUFBRCxDQUFZLElBQUEsWUFBQSxDQUFhLElBQWIsQ0FBWixFQUFBLENBREY7QUFBQTtzQkFIVTtJQUFBLENBSFosQ0FBQTs7QUFBQSw0QkFTQSxZQUFBLEdBQWMsU0FBQSxHQUFBO2FBQ1osSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsaUJBQVgsRUFBOEIsSUFBQyxDQUFBLGFBQS9CLEVBRFk7SUFBQSxDQVRkLENBQUE7O0FBQUEsNEJBWUEsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUNQLElBQUMsQ0FBQSxLQUFLLENBQUMsVUFBUCxDQUFBLEVBRE87SUFBQSxDQVpULENBQUE7O0FBQUEsNEJBZUEsYUFBQSxHQUFlLFNBQUEsR0FBQTtBQUNiLE1BQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxVQUFiLENBQUEsQ0FBQTtBQUNBLE1BQUEsSUFBeUIsSUFBQyxDQUFBLEtBQUssQ0FBQyxTQUFQLENBQUEsQ0FBekI7ZUFBQSxJQUFDLENBQUEsUUFBRCxDQUFVLFVBQVYsRUFBQTtPQUZhO0lBQUEsQ0FmZixDQUFBOzt5QkFBQTs7S0FEMEIsS0FKNUIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/views/diffs/diff-chunk-view.coffee