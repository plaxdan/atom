(function() {
  var Diff, DiffChunk, List, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  DiffChunk = require('./diff-chunk');

  List = require('../list');

  _ = require('underscore');

  module.exports = Diff = (function(_super) {
    __extends(Diff, _super);

    Diff.prototype.model = DiffChunk;

    Diff.prototype.is_sublist = true;

    Diff.prototype.selected_index = -1;

    Diff.prototype.removeHeader = function(diff) {
      var _ref;
      this.header = diff != null ? (_ref = diff.match(/^(.*?\n){2}/)) != null ? _ref[0] : void 0 : void 0;
      return diff != null ? diff.replace(/^(.*?\n){2}/, "") : void 0;
    };

    Diff.prototype.splitChunks = function(diff) {
      return diff != null ? diff.split(/(?=^@@ )/gm) : void 0;
    };

    function Diff(diff) {
      var chunks;
      this.giftDiff = diff;
      this.raw = diff != null ? diff.diff : void 0;
      diff = this.removeHeader(this.raw);
      chunks = this.splitChunks(diff);
      chunks = _.map(chunks, (function(_this) {
        return function(chunk) {
          return {
            chunk: chunk,
            header: _this.header
          };
        };
      })(this));
      Diff.__super__.constructor.call(this, chunks);
      this.select(-1);
    }

    Diff.prototype.chunks = function() {
      return this.models;
    };

    return Diff;

  })(List);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVIsQ0FBWixDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxTQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVBLENBQUEsR0FBSSxPQUFBLENBQVEsWUFBUixDQUZKLENBQUE7O0FBQUEsRUFTQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osMkJBQUEsQ0FBQTs7QUFBQSxtQkFBQSxLQUFBLEdBQU8sU0FBUCxDQUFBOztBQUFBLG1CQUNBLFVBQUEsR0FBWSxJQURaLENBQUE7O0FBQUEsbUJBRUEsY0FBQSxHQUFnQixDQUFBLENBRmhCLENBQUE7O0FBQUEsbUJBSUEsWUFBQSxHQUFjLFNBQUMsSUFBRCxHQUFBO0FBRVosVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsTUFBRCxtRUFBc0MsQ0FBQSxDQUFBLG1CQUF0QyxDQUFBOzRCQUNBLElBQUksQ0FBRSxPQUFOLENBQWMsYUFBZCxFQUE2QixFQUE3QixXQUhZO0lBQUEsQ0FKZCxDQUFBOztBQUFBLG1CQVNBLFdBQUEsR0FBYSxTQUFDLElBQUQsR0FBQTs0QkFHWCxJQUFJLENBQUUsS0FBTixDQUFZLFlBQVosV0FIVztJQUFBLENBVGIsQ0FBQTs7QUFjYSxJQUFBLGNBQUMsSUFBRCxHQUFBO0FBQ1gsVUFBQSxNQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQVosQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLEdBQUQsa0JBQU8sSUFBSSxDQUFFLGFBRGIsQ0FBQTtBQUFBLE1BRUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxZQUFELENBQWMsSUFBQyxDQUFBLEdBQWYsQ0FGUCxDQUFBO0FBQUEsTUFHQSxNQUFBLEdBQVMsSUFBQyxDQUFBLFdBQUQsQ0FBYSxJQUFiLENBSFQsQ0FBQTtBQUFBLE1BSUEsTUFBQSxHQUFTLENBQUMsQ0FBQyxHQUFGLENBQU0sTUFBTixFQUFjLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLEtBQUQsR0FBQTtpQkFBVztBQUFBLFlBQUEsS0FBQSxFQUFPLEtBQVA7QUFBQSxZQUFjLE1BQUEsRUFBUSxLQUFDLENBQUEsTUFBdkI7WUFBWDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWQsQ0FKVCxDQUFBO0FBQUEsTUFLQSxzQ0FBTSxNQUFOLENBTEEsQ0FBQTtBQUFBLE1BT0EsSUFBQyxDQUFBLE1BQUQsQ0FBUSxDQUFBLENBQVIsQ0FQQSxDQURXO0lBQUEsQ0FkYjs7QUFBQSxtQkF3QkEsTUFBQSxHQUFRLFNBQUEsR0FBQTthQUNOLElBQUMsQ0FBQSxPQURLO0lBQUEsQ0F4QlIsQ0FBQTs7Z0JBQUE7O0tBRGlCLEtBVm5CLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/diffs/diff.coffee