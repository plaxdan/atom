(function() {
  var DiffLine, Model,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Model = require('backbone').Model;

  module.exports = DiffLine = (function(_super) {
    __extends(DiffLine, _super);

    function DiffLine() {
      return DiffLine.__super__.constructor.apply(this, arguments);
    }

    DiffLine.prototype.line = function() {
      return this.get("line");
    };

    DiffLine.prototype.type = function() {
      if (!!(this.line().match(/^\+/))) {
        return "addition";
      } else if (!!(this.line().match(/^\-/))) {
        return "subtraction";
      } else {
        return "context";
      }
    };

    DiffLine.prototype.repo = function() {
      return this.get("repo");
    };

    DiffLine.prototype.markup = function() {
      return this.escapeHTML(this.line());
    };

    DiffLine.prototype.entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': '&quot;',
      "'": '&#39;',
      "/": '&#x2F;',
      " ": '&nbsp;'
    };

    DiffLine.prototype.escapeHTML = function(string) {
      return String(string).replace(/[&<>"'\/ ]/g, (function(_this) {
        return function(s) {
          return _this.entityMap[s];
        };
      })(this));
    };

    return DiffLine;

  })(Model);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGVBQUE7SUFBQTttU0FBQTs7QUFBQSxFQUFDLFFBQVMsT0FBQSxDQUFRLFVBQVIsRUFBVCxLQUFELENBQUE7O0FBQUEsRUFRQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osK0JBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHVCQUFBLElBQUEsR0FBTSxTQUFBLEdBQUE7YUFDSixJQUFDLENBQUEsR0FBRCxDQUFLLE1BQUwsRUFESTtJQUFBLENBQU4sQ0FBQTs7QUFBQSx1QkFHQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0osTUFBQSxJQUFHLENBQUEsQ0FBQyxDQUFFLElBQUMsQ0FBQSxJQUFELENBQUEsQ0FBTyxDQUFDLEtBQVIsQ0FBYyxLQUFkLENBQUQsQ0FBTDtlQUNFLFdBREY7T0FBQSxNQUVLLElBQUcsQ0FBQSxDQUFDLENBQUUsSUFBQyxDQUFBLElBQUQsQ0FBQSxDQUFPLENBQUMsS0FBUixDQUFjLEtBQWQsQ0FBRCxDQUFMO2VBQ0gsY0FERztPQUFBLE1BQUE7ZUFHSCxVQUhHO09BSEQ7SUFBQSxDQUhOLENBQUE7O0FBQUEsdUJBV0EsSUFBQSxHQUFNLFNBQUEsR0FBQTthQUNKLElBQUMsQ0FBQSxHQUFELENBQUssTUFBTCxFQURJO0lBQUEsQ0FYTixDQUFBOztBQUFBLHVCQWNBLE1BQUEsR0FBUSxTQUFBLEdBQUE7YUFDTixJQUFDLENBQUEsVUFBRCxDQUFZLElBQUMsQ0FBQSxJQUFELENBQUEsQ0FBWixFQURNO0lBQUEsQ0FkUixDQUFBOztBQUFBLHVCQWlCQSxTQUFBLEdBQ0U7QUFBQSxNQUFBLEdBQUEsRUFBSyxPQUFMO0FBQUEsTUFDQSxHQUFBLEVBQUssTUFETDtBQUFBLE1BRUEsR0FBQSxFQUFLLE1BRkw7QUFBQSxNQUdBLEdBQUEsRUFBSyxRQUhMO0FBQUEsTUFJQSxHQUFBLEVBQUssT0FKTDtBQUFBLE1BS0EsR0FBQSxFQUFLLFFBTEw7QUFBQSxNQU1BLEdBQUEsRUFBSyxRQU5MO0tBbEJGLENBQUE7O0FBQUEsdUJBMEJBLFVBQUEsR0FBWSxTQUFDLE1BQUQsR0FBQTthQUNWLE1BQUEsQ0FBTyxNQUFQLENBQWMsQ0FBQyxPQUFmLENBQXVCLGFBQXZCLEVBQXNDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLENBQUQsR0FBQTtpQkFBTyxLQUFDLENBQUEsU0FBVSxDQUFBLENBQUEsRUFBbEI7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QyxFQURVO0lBQUEsQ0ExQlosQ0FBQTs7b0JBQUE7O0tBRHFCLE1BVHZCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/diffs/diff-line.coffee