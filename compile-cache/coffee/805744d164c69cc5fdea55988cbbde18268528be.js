(function() {
  var GitBridge, MergeState;

  GitBridge = require('./git-bridge');

  module.exports = MergeState = (function() {
    function MergeState(conflicts, isRebase) {
      this.conflicts = conflicts;
      this.isRebase = isRebase;
    }

    MergeState.prototype.reread = function(callback) {
      return GitBridge.withConflicts((function(_this) {
        return function(conflicts) {
          _this.conflicts = conflicts;
          return callback(_this);
        };
      })(this));
    };

    MergeState.prototype.isEmpty = function() {
      return this.conflicts.length === 0;
    };

    MergeState.read = function(callback) {
      var isr;
      isr = GitBridge.isRebasing();
      return GitBridge.withConflicts(function(cs) {
        return callback(new MergeState(cs, isr));
      });
    };

    return MergeState;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFCQUFBOztBQUFBLEVBQUEsU0FBQSxHQUFZLE9BQUEsQ0FBUSxjQUFSLENBQVosQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFFUyxJQUFBLG9CQUFFLFNBQUYsRUFBYyxRQUFkLEdBQUE7QUFBeUIsTUFBeEIsSUFBQyxDQUFBLFlBQUEsU0FBdUIsQ0FBQTtBQUFBLE1BQVosSUFBQyxDQUFBLFdBQUEsUUFBVyxDQUF6QjtJQUFBLENBQWI7O0FBQUEseUJBRUEsTUFBQSxHQUFRLFNBQUMsUUFBRCxHQUFBO2FBQ04sU0FBUyxDQUFDLGFBQVYsQ0FBd0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUUsU0FBRixHQUFBO0FBQ3RCLFVBRHVCLEtBQUMsQ0FBQSxZQUFBLFNBQ3hCLENBQUE7aUJBQUEsUUFBQSxDQUFTLEtBQVQsRUFEc0I7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QixFQURNO0lBQUEsQ0FGUixDQUFBOztBQUFBLHlCQU1BLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsS0FBcUIsRUFBeEI7SUFBQSxDQU5ULENBQUE7O0FBQUEsSUFRQSxVQUFDLENBQUEsSUFBRCxHQUFPLFNBQUMsUUFBRCxHQUFBO0FBQ0wsVUFBQSxHQUFBO0FBQUEsTUFBQSxHQUFBLEdBQU0sU0FBUyxDQUFDLFVBQVYsQ0FBQSxDQUFOLENBQUE7YUFDQSxTQUFTLENBQUMsYUFBVixDQUF3QixTQUFDLEVBQUQsR0FBQTtlQUN0QixRQUFBLENBQWEsSUFBQSxVQUFBLENBQVcsRUFBWCxFQUFlLEdBQWYsQ0FBYixFQURzQjtNQUFBLENBQXhCLEVBRks7SUFBQSxDQVJQLENBQUE7O3NCQUFBOztNQUxGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/merge-conflicts/lib/merge-state.coffee