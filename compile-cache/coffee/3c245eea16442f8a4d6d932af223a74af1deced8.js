(function() {
  var DiffChunk, DiffLine, ListItem, fs, git, path, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore');

  fs = require('fs');

  path = require('path');

  git = require('../../git').git;

  DiffLine = require('./diff-line');

  ListItem = require('../list-item');

  module.exports = DiffChunk = (function(_super) {
    __extends(DiffChunk, _super);

    function DiffChunk() {
      return DiffChunk.__super__.constructor.apply(this, arguments);
    }

    DiffChunk.prototype.initialize = function(options) {
      var chunk;
      chunk = this.deleteFirstLine(options.chunk);
      chunk = this.deleteInitialWhitespace(chunk);
      chunk = this.deleteTrailingWhitespace(chunk);
      return this.lines = _.map(this.splitIntoLines(chunk), function(line) {
        return new DiffLine({
          line: line
        });
      });
    };

    DiffChunk.prototype.deleteTrailingWhitespace = function(chunk) {
      return chunk.replace(/\s*$/, "");
    };

    DiffChunk.prototype.deleteFirstLine = function(chunk) {
      return chunk.replace(/.*?\n/, "");
    };

    DiffChunk.prototype.deleteInitialWhitespace = function(chunk) {
      return chunk.replace(/^(\s*?\n)*/, "");
    };

    DiffChunk.prototype.splitIntoLines = function(chunk) {
      return chunk.split(/\n/g);
    };

    DiffChunk.prototype.patch = function() {
      return this.get("header") + this.get("chunk") + "\n";
    };

    DiffChunk.prototype.kill = function() {
      fs.writeFileSync(this.patchPath(), this.patch());
      return git.git("apply --reverse " + (this.patchPath()));
    };

    DiffChunk.prototype.stage = function() {
      fs.writeFileSync(this.patchPath(), this.patch());
      return git.git("apply --cached " + (this.patchPath()));
    };

    DiffChunk.prototype.unstage = function() {
      fs.writeFileSync(this.patchPath(), this.patch());
      return git.git("apply --cached --reverse " + (this.patchPath()));
    };

    DiffChunk.prototype.patchPath = function() {
      return path.join(git.getPath(), ".git/atomatigit_diff_patch");
    };

    return DiffChunk;

  })(ListItem);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQU8sT0FBQSxDQUFRLFlBQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsRUFBQSxHQUFPLE9BQUEsQ0FBUSxJQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUZQLENBQUE7O0FBQUEsRUFJQyxNQUFVLE9BQUEsQ0FBUSxXQUFSLEVBQVYsR0FKRCxDQUFBOztBQUFBLEVBS0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSLENBTFgsQ0FBQTs7QUFBQSxFQU1BLFFBQUEsR0FBVyxPQUFBLENBQVEsY0FBUixDQU5YLENBQUE7O0FBQUEsRUFhQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osZ0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLHdCQUFBLFVBQUEsR0FBWSxTQUFDLE9BQUQsR0FBQTtBQUNWLFVBQUEsS0FBQTtBQUFBLE1BQUEsS0FBQSxHQUFRLElBQUMsQ0FBQSxlQUFELENBQWlCLE9BQU8sQ0FBQyxLQUF6QixDQUFSLENBQUE7QUFBQSxNQUNBLEtBQUEsR0FBUSxJQUFDLENBQUEsdUJBQUQsQ0FBeUIsS0FBekIsQ0FEUixDQUFBO0FBQUEsTUFFQSxLQUFBLEdBQVEsSUFBQyxDQUFBLHdCQUFELENBQTBCLEtBQTFCLENBRlIsQ0FBQTthQUdBLElBQUMsQ0FBQSxLQUFELEdBQVMsQ0FBQyxDQUFDLEdBQUYsQ0FBTSxJQUFDLENBQUEsY0FBRCxDQUFnQixLQUFoQixDQUFOLEVBQThCLFNBQUMsSUFBRCxHQUFBO2VBQ2pDLElBQUEsUUFBQSxDQUFTO0FBQUEsVUFBQSxJQUFBLEVBQU0sSUFBTjtTQUFULEVBRGlDO01BQUEsQ0FBOUIsRUFKQztJQUFBLENBQVosQ0FBQTs7QUFBQSx3QkFPQSx3QkFBQSxHQUEwQixTQUFDLEtBQUQsR0FBQTthQUN4QixLQUFLLENBQUMsT0FBTixDQUFjLE1BQWQsRUFBc0IsRUFBdEIsRUFEd0I7SUFBQSxDQVAxQixDQUFBOztBQUFBLHdCQVVBLGVBQUEsR0FBaUIsU0FBQyxLQUFELEdBQUE7YUFDZixLQUFLLENBQUMsT0FBTixDQUFjLE9BQWQsRUFBdUIsRUFBdkIsRUFEZTtJQUFBLENBVmpCLENBQUE7O0FBQUEsd0JBYUEsdUJBQUEsR0FBeUIsU0FBQyxLQUFELEdBQUE7YUFDdkIsS0FBSyxDQUFDLE9BQU4sQ0FBYyxZQUFkLEVBQTRCLEVBQTVCLEVBRHVCO0lBQUEsQ0FiekIsQ0FBQTs7QUFBQSx3QkFnQkEsY0FBQSxHQUFnQixTQUFDLEtBQUQsR0FBQTthQUNkLEtBQUssQ0FBQyxLQUFOLENBQVksS0FBWixFQURjO0lBQUEsQ0FoQmhCLENBQUE7O0FBQUEsd0JBbUJBLEtBQUEsR0FBTyxTQUFBLEdBQUE7YUFDTCxJQUFDLENBQUEsR0FBRCxDQUFLLFFBQUwsQ0FBQSxHQUFpQixJQUFDLENBQUEsR0FBRCxDQUFLLE9BQUwsQ0FBakIsR0FBaUMsS0FENUI7SUFBQSxDQW5CUCxDQUFBOztBQUFBLHdCQXNCQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0osTUFBQSxFQUFFLENBQUMsYUFBSCxDQUFpQixJQUFDLENBQUEsU0FBRCxDQUFBLENBQWpCLEVBQStCLElBQUMsQ0FBQSxLQUFELENBQUEsQ0FBL0IsQ0FBQSxDQUFBO2FBQ0EsR0FBRyxDQUFDLEdBQUosQ0FBUyxrQkFBQSxHQUFpQixDQUFBLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBQSxDQUExQixFQUZJO0lBQUEsQ0F0Qk4sQ0FBQTs7QUFBQSx3QkEwQkEsS0FBQSxHQUFPLFNBQUEsR0FBQTtBQUNMLE1BQUEsRUFBRSxDQUFDLGFBQUgsQ0FBaUIsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFqQixFQUErQixJQUFDLENBQUEsS0FBRCxDQUFBLENBQS9CLENBQUEsQ0FBQTthQUNBLEdBQUcsQ0FBQyxHQUFKLENBQVMsaUJBQUEsR0FBZ0IsQ0FBQSxJQUFDLENBQUEsU0FBRCxDQUFBLENBQUEsQ0FBekIsRUFGSztJQUFBLENBMUJQLENBQUE7O0FBQUEsd0JBOEJBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxNQUFBLEVBQUUsQ0FBQyxhQUFILENBQWlCLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBakIsRUFBK0IsSUFBQyxDQUFBLEtBQUQsQ0FBQSxDQUEvQixDQUFBLENBQUE7YUFDQSxHQUFHLENBQUMsR0FBSixDQUFTLDJCQUFBLEdBQTBCLENBQUEsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFBLENBQW5DLEVBRk87SUFBQSxDQTlCVCxDQUFBOztBQUFBLHdCQWtDQSxTQUFBLEdBQVcsU0FBQSxHQUFBO2FBQ1QsSUFBSSxDQUFDLElBQUwsQ0FBVSxHQUFHLENBQUMsT0FBSixDQUFBLENBQVYsRUFBeUIsNEJBQXpCLEVBRFM7SUFBQSxDQWxDWCxDQUFBOztxQkFBQTs7S0FEc0IsU0FkeEIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/diffs/diff-chunk.coffee