(function() {
  var File, StagedFile, git, shell,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  shell = require('shell');

  File = require('./file');

  git = require('../../git').git;

  module.exports = StagedFile = (function(_super) {
    __extends(StagedFile, _super);

    function StagedFile() {
      this.discardAllChanges = __bind(this.discardAllChanges, this);
      return StagedFile.__super__.constructor.apply(this, arguments);
    }

    StagedFile.prototype.sort_value = 2;

    StagedFile.prototype.stage = function() {
      return null;
    };

    StagedFile.prototype.unstage = function() {
      return git.git("reset HEAD " + (this.path()));
    };

    StagedFile.prototype.kill = function() {
      return atom.confirm({
        message: "Discard all changes to \"" + (this.path()) + "\"?",
        buttons: {
          "Discard": this.discardAllChanges,
          "Cancel": function() {
            return null;
          }
        }
      });
    };

    StagedFile.prototype.discardAllChanges = function() {
      return git.git("reset HEAD " + (this.path()), (function(_this) {
        return function() {
          return git.git("checkout " + (_this.path()));
        };
      })(this));
    };

    StagedFile.prototype.loadDiff = function() {
      return git.diff(this.path(), this.setDiff, {
        flags: "--staged"
      });
    };

    StagedFile.prototype.stagedP = function() {
      return true;
    };

    return StagedFile;

  })(File);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRCQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSLENBQVIsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsUUFBUixDQUZQLENBQUE7O0FBQUEsRUFHQyxNQUFPLE9BQUEsQ0FBUSxXQUFSLEVBQVAsR0FIRCxDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUdKLGlDQUFBLENBQUE7Ozs7O0tBQUE7O0FBQUEseUJBQUEsVUFBQSxHQUFZLENBQVosQ0FBQTs7QUFBQSx5QkFFQSxLQUFBLEdBQU8sU0FBQSxHQUFBO2FBQ0wsS0FESztJQUFBLENBRlAsQ0FBQTs7QUFBQSx5QkFLQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2FBQ1AsR0FBRyxDQUFDLEdBQUosQ0FBUyxhQUFBLEdBQVksQ0FBQSxJQUFDLENBQUEsSUFBRCxDQUFBLENBQUEsQ0FBckIsRUFETztJQUFBLENBTFQsQ0FBQTs7QUFBQSx5QkFRQSxJQUFBLEdBQU0sU0FBQSxHQUFBO2FBQ0osSUFBSSxDQUFDLE9BQUwsQ0FDRTtBQUFBLFFBQUEsT0FBQSxFQUFVLDJCQUFBLEdBQTBCLENBQUEsSUFBQyxDQUFBLElBQUQsQ0FBQSxDQUFBLENBQTFCLEdBQW1DLEtBQTdDO0FBQUEsUUFDQSxPQUFBLEVBQ0U7QUFBQSxVQUFBLFNBQUEsRUFBVyxJQUFDLENBQUEsaUJBQVo7QUFBQSxVQUNBLFFBQUEsRUFBVSxTQUFBLEdBQUE7bUJBQUcsS0FBSDtVQUFBLENBRFY7U0FGRjtPQURGLEVBREk7SUFBQSxDQVJOLENBQUE7O0FBQUEseUJBZUEsaUJBQUEsR0FBbUIsU0FBQSxHQUFBO2FBQ2pCLEdBQUcsQ0FBQyxHQUFKLENBQVMsYUFBQSxHQUFZLENBQUEsSUFBQyxDQUFBLElBQUQsQ0FBQSxDQUFBLENBQXJCLEVBQWlDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQy9CLEdBQUcsQ0FBQyxHQUFKLENBQVMsV0FBQSxHQUFVLENBQUEsS0FBQyxDQUFBLElBQUQsQ0FBQSxDQUFBLENBQW5CLEVBRCtCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakMsRUFEaUI7SUFBQSxDQWZuQixDQUFBOztBQUFBLHlCQW1CQSxRQUFBLEdBQVUsU0FBQSxHQUFBO2FBQ1IsR0FBRyxDQUFDLElBQUosQ0FBUyxJQUFDLENBQUEsSUFBRCxDQUFBLENBQVQsRUFBa0IsSUFBQyxDQUFBLE9BQW5CLEVBQTRCO0FBQUEsUUFBQSxLQUFBLEVBQU8sVUFBUDtPQUE1QixFQURRO0lBQUEsQ0FuQlYsQ0FBQTs7QUFBQSx5QkFzQkEsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUFHLEtBQUg7SUFBQSxDQXRCVCxDQUFBOztzQkFBQTs7S0FIdUIsS0FOekIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/files/staged-file.coffee