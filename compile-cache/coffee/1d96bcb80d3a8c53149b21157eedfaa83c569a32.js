(function() {
  var DiffLine, Model, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('lodash');

  Model = require('backbone').Model;

  DiffLine = (function(_super) {
    __extends(DiffLine, _super);

    function DiffLine() {
      this.markup = __bind(this.markup, this);
      this.repo = __bind(this.repo, this);
      this.type = __bind(this.type, this);
      this.line = __bind(this.line, this);
      return DiffLine.__super__.constructor.apply(this, arguments);
    }

    DiffLine.prototype.line = function() {
      return this.get('line');
    };

    DiffLine.prototype.type = function() {
      if (this.line().match(/^\+/)) {
        return 'addition';
      } else if (this.line().match(/^\-/)) {
        return 'subtraction';
      } else {
        return 'context';
      }
    };

    DiffLine.prototype.repo = function() {
      return this.get('repo');
    };

    DiffLine.prototype.markup = function() {
      return this.escapeHTML(this.line());
    };

    DiffLine.prototype.escapeHTML = function(string) {
      var entityMap;
      entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        ' ': '&nbsp;'
      };
      if (_.isString(string)) {
        return string.replace(/[&<>"'\/ ]/g, function(s) {
          return entityMap[s];
        });
      } else {
        return string;
      }
    };

    return DiffLine;

  })(Model);

  module.exports = DiffLine;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFVLE9BQUEsQ0FBUSxRQUFSLENBQVYsQ0FBQTs7QUFBQSxFQUNDLFFBQVMsT0FBQSxDQUFRLFVBQVIsRUFBVCxLQURELENBQUE7O0FBQUEsRUFRTTtBQUlKLCtCQUFBLENBQUE7Ozs7Ozs7O0tBQUE7O0FBQUEsdUJBQUEsSUFBQSxHQUFNLFNBQUEsR0FBQTthQUNKLElBQUMsQ0FBQSxHQUFELENBQUssTUFBTCxFQURJO0lBQUEsQ0FBTixDQUFBOztBQUFBLHVCQVNBLElBQUEsR0FBTSxTQUFBLEdBQUE7QUFDSixNQUFBLElBQUcsSUFBQyxDQUFBLElBQUQsQ0FBQSxDQUFPLENBQUMsS0FBUixDQUFjLEtBQWQsQ0FBSDtlQUNFLFdBREY7T0FBQSxNQUVLLElBQUcsSUFBQyxDQUFBLElBQUQsQ0FBQSxDQUFPLENBQUMsS0FBUixDQUFjLEtBQWQsQ0FBSDtlQUNILGNBREc7T0FBQSxNQUFBO2VBR0gsVUFIRztPQUhEO0lBQUEsQ0FUTixDQUFBOztBQUFBLHVCQW9CQSxJQUFBLEdBQU0sU0FBQSxHQUFBO2FBQ0osSUFBQyxDQUFBLEdBQUQsQ0FBSyxNQUFMLEVBREk7SUFBQSxDQXBCTixDQUFBOztBQUFBLHVCQTBCQSxNQUFBLEdBQVEsU0FBQSxHQUFBO2FBQ04sSUFBQyxDQUFBLFVBQUQsQ0FBWSxJQUFDLENBQUEsSUFBRCxDQUFBLENBQVosRUFETTtJQUFBLENBMUJSLENBQUE7O0FBQUEsdUJBa0NBLFVBQUEsR0FBWSxTQUFDLE1BQUQsR0FBQTtBQUNWLFVBQUEsU0FBQTtBQUFBLE1BQUEsU0FBQSxHQUNFO0FBQUEsUUFBQSxHQUFBLEVBQUssT0FBTDtBQUFBLFFBQ0EsR0FBQSxFQUFLLE1BREw7QUFBQSxRQUVBLEdBQUEsRUFBSyxNQUZMO0FBQUEsUUFHQSxHQUFBLEVBQUssUUFITDtBQUFBLFFBSUEsR0FBQSxFQUFLLE9BSkw7QUFBQSxRQUtBLEdBQUEsRUFBSyxRQUxMO0FBQUEsUUFNQSxHQUFBLEVBQUssUUFOTDtPQURGLENBQUE7QUFRQSxNQUFBLElBQUcsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxNQUFYLENBQUg7ZUFDRSxNQUFNLENBQUMsT0FBUCxDQUFlLGFBQWYsRUFBOEIsU0FBQyxDQUFELEdBQUE7aUJBQU8sU0FBVSxDQUFBLENBQUEsRUFBakI7UUFBQSxDQUE5QixFQURGO09BQUEsTUFBQTtlQUdFLE9BSEY7T0FUVTtJQUFBLENBbENaLENBQUE7O29CQUFBOztLQUpxQixNQVJ2QixDQUFBOztBQUFBLEVBNERBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFFBNURqQixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/diffs/diff-line.coffee