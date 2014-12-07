(function() {
  var ErrorView, File, StagedFile, git,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  git = require('../../git');

  File = require('./file');

  ErrorView = require('../../views/error-view');

  StagedFile = (function(_super) {
    __extends(StagedFile, _super);

    function StagedFile() {
      this.getMode = __bind(this.getMode, this);
      this.loadDiff = __bind(this.loadDiff, this);
      this.discardAllChanges = __bind(this.discardAllChanges, this);
      this.kill = __bind(this.kill, this);
      this.unstage = __bind(this.unstage, this);
      return StagedFile.__super__.constructor.apply(this, arguments);
    }

    StagedFile.prototype.sortValue = 2;

    StagedFile.prototype.stage = function() {};

    StagedFile.prototype.unstage = function() {
      return git.unstage(this.path()).then((function(_this) {
        return function() {
          return _this.trigger('update');
        };
      })(this))["catch"](function(error) {
        return new ErrorView(error);
      });
    };

    StagedFile.prototype.kill = function() {
      return atom.confirm({
        message: "Discard all changes to \"" + (this.path()) + "\"?",
        buttons: {
          'Discard': this.discardAllChanges,
          'Cancel': function() {}
        }
      });
    };

    StagedFile.prototype.discardAllChanges = function() {
      this.unstage();
      return this.checkout();
    };

    StagedFile.prototype.loadDiff = function() {
      if (this.getMode() === 'D') {
        return;
      }
      return git.getDiff(this.path(), {
        staged: true
      }).then((function(_this) {
        return function(diff) {
          return _this.setDiff(diff);
        };
      })(this))["catch"](function(error) {
        return new ErrorView(error);
      });
    };

    StagedFile.prototype.getMode = function() {
      return this.get('modeIndex');
    };

    StagedFile.prototype.isStaged = function() {
      return true;
    };

    return StagedFile;

  })(File);

  module.exports = StagedFile;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdDQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsR0FBQSxHQUFZLE9BQUEsQ0FBUSxXQUFSLENBQVosQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBWSxPQUFBLENBQVEsUUFBUixDQURaLENBQUE7O0FBQUEsRUFFQSxTQUFBLEdBQVksT0FBQSxDQUFRLHdCQUFSLENBRlosQ0FBQTs7QUFBQSxFQUlNO0FBR0osaUNBQUEsQ0FBQTs7Ozs7Ozs7O0tBQUE7O0FBQUEseUJBQUEsU0FBQSxHQUFXLENBQVgsQ0FBQTs7QUFBQSx5QkFHQSxLQUFBLEdBQU8sU0FBQSxHQUFBLENBSFAsQ0FBQTs7QUFBQSx5QkFNQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2FBQ1AsR0FBRyxDQUFDLE9BQUosQ0FBWSxJQUFDLENBQUEsSUFBRCxDQUFBLENBQVosQ0FDQSxDQUFDLElBREQsQ0FDTSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxPQUFELENBQVMsUUFBVCxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FETixDQUVBLENBQUMsT0FBRCxDQUZBLENBRU8sU0FBQyxLQUFELEdBQUE7ZUFBZSxJQUFBLFNBQUEsQ0FBVSxLQUFWLEVBQWY7TUFBQSxDQUZQLEVBRE87SUFBQSxDQU5ULENBQUE7O0FBQUEseUJBYUEsSUFBQSxHQUFNLFNBQUEsR0FBQTthQUNKLElBQUksQ0FBQyxPQUFMLENBQ0U7QUFBQSxRQUFBLE9BQUEsRUFBVSwyQkFBQSxHQUEwQixDQUFBLElBQUMsQ0FBQSxJQUFELENBQUEsQ0FBQSxDQUExQixHQUFtQyxLQUE3QztBQUFBLFFBQ0EsT0FBQSxFQUNFO0FBQUEsVUFBQSxTQUFBLEVBQVcsSUFBQyxDQUFBLGlCQUFaO0FBQUEsVUFDQSxRQUFBLEVBQVUsU0FBQSxHQUFBLENBRFY7U0FGRjtPQURGLEVBREk7SUFBQSxDQWJOLENBQUE7O0FBQUEseUJBcUJBLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTtBQUNqQixNQUFBLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBQSxFQUZpQjtJQUFBLENBckJuQixDQUFBOztBQUFBLHlCQTBCQSxRQUFBLEdBQVUsU0FBQSxHQUFBO0FBQ1IsTUFBQSxJQUFVLElBQUMsQ0FBQSxPQUFELENBQUEsQ0FBQSxLQUFjLEdBQXhCO0FBQUEsY0FBQSxDQUFBO09BQUE7YUFDQSxHQUFHLENBQUMsT0FBSixDQUFZLElBQUMsQ0FBQSxJQUFELENBQUEsQ0FBWixFQUFxQjtBQUFBLFFBQUMsTUFBQSxFQUFRLElBQVQ7T0FBckIsQ0FDQSxDQUFDLElBREQsQ0FDTSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEdBQUE7aUJBQVUsS0FBQyxDQUFBLE9BQUQsQ0FBUyxJQUFULEVBQVY7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUROLENBRUEsQ0FBQyxPQUFELENBRkEsQ0FFTyxTQUFDLEtBQUQsR0FBQTtlQUFlLElBQUEsU0FBQSxDQUFVLEtBQVYsRUFBZjtNQUFBLENBRlAsRUFGUTtJQUFBLENBMUJWLENBQUE7O0FBQUEseUJBZ0NBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFDUCxJQUFDLENBQUEsR0FBRCxDQUFLLFdBQUwsRUFETztJQUFBLENBaENULENBQUE7O0FBQUEseUJBbUNBLFFBQUEsR0FBVSxTQUFBLEdBQUE7YUFBRyxLQUFIO0lBQUEsQ0FuQ1YsQ0FBQTs7c0JBQUE7O0tBSHVCLEtBSnpCLENBQUE7O0FBQUEsRUE0Q0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsVUE1Q2pCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/files/staged-file.coffee