(function() {
  var DiffLineView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  module.exports = DiffLineView = (function(_super) {
    __extends(DiffLineView, _super);

    function DiffLineView() {
      return DiffLineView.__super__.constructor.apply(this, arguments);
    }

    DiffLineView.content = function(line) {
      return this.div({
        "class": "diff-line " + (line.type())
      }, (function(_this) {
        return function() {
          return _this.raw(line.markup());
        };
      })(this));
    };

    DiffLineView.prototype.initialize = function(line) {
      return this.model = line;
    };

    return DiffLineView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxPQUFRLE9BQUEsQ0FBUSxNQUFSLEVBQVIsSUFBRCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLG1DQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFlBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxJQUFELEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQVEsWUFBQSxHQUFXLENBQUEsSUFBSSxDQUFDLElBQUwsQ0FBQSxDQUFBLENBQW5CO09BQUwsRUFBd0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDdEMsS0FBQyxDQUFBLEdBQUQsQ0FBSyxJQUFJLENBQUMsTUFBTCxDQUFBLENBQUwsRUFEc0M7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QyxFQURRO0lBQUEsQ0FBVixDQUFBOztBQUFBLDJCQUlBLFVBQUEsR0FBWSxTQUFDLElBQUQsR0FBQTthQUNWLElBQUMsQ0FBQSxLQUFELEdBQVMsS0FEQztJQUFBLENBSlosQ0FBQTs7d0JBQUE7O0tBRHlCLEtBSDNCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/views/diffs/diff-line-view.coffee