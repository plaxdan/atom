(function() {
  var OurSide, Side, TheirSide,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Side = (function() {
    function Side(originalText, ref, marker, refBannerMarker, position) {
      this.originalText = originalText;
      this.ref = ref;
      this.marker = marker;
      this.refBannerMarker = refBannerMarker;
      this.position = position;
      this.conflict = null;
      this.isDirty = false;
      this.followingMarker = null;
    }

    Side.prototype.resolve = function() {
      return this.conflict.resolveAs(this);
    };

    Side.prototype.wasChosen = function() {
      return this.conflict.resolution === this;
    };

    return Side;

  })();

  OurSide = (function(_super) {
    __extends(OurSide, _super);

    function OurSide() {
      return OurSide.__super__.constructor.apply(this, arguments);
    }

    OurSide.prototype.site = function() {
      return 1;
    };

    OurSide.prototype.klass = function() {
      return 'ours';
    };

    OurSide.prototype.description = function() {
      return 'our changes';
    };

    OurSide.prototype.eventName = function() {
      return 'merge-conflicts:accept-ours';
    };

    return OurSide;

  })(Side);

  TheirSide = (function(_super) {
    __extends(TheirSide, _super);

    function TheirSide() {
      return TheirSide.__super__.constructor.apply(this, arguments);
    }

    TheirSide.prototype.site = function() {
      return 2;
    };

    TheirSide.prototype.klass = function() {
      return 'theirs';
    };

    TheirSide.prototype.description = function() {
      return 'their changes';
    };

    TheirSide.prototype.eventName = function() {
      return 'merge-conflicts:accept-theirs';
    };

    return TheirSide;

  })(Side);

  module.exports = {
    Side: Side,
    OurSide: OurSide,
    TheirSide: TheirSide
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBTTtBQUNTLElBQUEsY0FBRSxZQUFGLEVBQWlCLEdBQWpCLEVBQXVCLE1BQXZCLEVBQWdDLGVBQWhDLEVBQWtELFFBQWxELEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxlQUFBLFlBQ2IsQ0FBQTtBQUFBLE1BRDJCLElBQUMsQ0FBQSxNQUFBLEdBQzVCLENBQUE7QUFBQSxNQURpQyxJQUFDLENBQUEsU0FBQSxNQUNsQyxDQUFBO0FBQUEsTUFEMEMsSUFBQyxDQUFBLGtCQUFBLGVBQzNDLENBQUE7QUFBQSxNQUQ0RCxJQUFDLENBQUEsV0FBQSxRQUM3RCxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQVosQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxLQURYLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxlQUFELEdBQW1CLElBRm5CLENBRFc7SUFBQSxDQUFiOztBQUFBLG1CQUtBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVYsQ0FBb0IsSUFBcEIsRUFBSDtJQUFBLENBTFQsQ0FBQTs7QUFBQSxtQkFPQSxTQUFBLEdBQVcsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxVQUFWLEtBQXdCLEtBQTNCO0lBQUEsQ0FQWCxDQUFBOztnQkFBQTs7TUFERixDQUFBOztBQUFBLEVBVU07QUFFSiw4QkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsc0JBQUEsSUFBQSxHQUFNLFNBQUEsR0FBQTthQUFHLEVBQUg7SUFBQSxDQUFOLENBQUE7O0FBQUEsc0JBRUEsS0FBQSxHQUFPLFNBQUEsR0FBQTthQUFHLE9BQUg7SUFBQSxDQUZQLENBQUE7O0FBQUEsc0JBSUEsV0FBQSxHQUFhLFNBQUEsR0FBQTthQUFHLGNBQUg7SUFBQSxDQUpiLENBQUE7O0FBQUEsc0JBTUEsU0FBQSxHQUFXLFNBQUEsR0FBQTthQUFHLDhCQUFIO0lBQUEsQ0FOWCxDQUFBOzttQkFBQTs7S0FGb0IsS0FWdEIsQ0FBQTs7QUFBQSxFQW9CTTtBQUVKLGdDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSx3QkFBQSxJQUFBLEdBQU0sU0FBQSxHQUFBO2FBQUcsRUFBSDtJQUFBLENBQU4sQ0FBQTs7QUFBQSx3QkFFQSxLQUFBLEdBQU8sU0FBQSxHQUFBO2FBQUcsU0FBSDtJQUFBLENBRlAsQ0FBQTs7QUFBQSx3QkFJQSxXQUFBLEdBQWEsU0FBQSxHQUFBO2FBQUcsZ0JBQUg7SUFBQSxDQUpiLENBQUE7O0FBQUEsd0JBTUEsU0FBQSxHQUFXLFNBQUEsR0FBQTthQUFHLGdDQUFIO0lBQUEsQ0FOWCxDQUFBOztxQkFBQTs7S0FGc0IsS0FwQnhCLENBQUE7O0FBQUEsRUE4QkEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFBQSxJQUFBLElBQUEsRUFBTSxJQUFOO0FBQUEsSUFBWSxPQUFBLEVBQVMsT0FBckI7QUFBQSxJQUE4QixTQUFBLEVBQVcsU0FBekM7R0E5QmpCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/merge-conflicts/lib/side.coffee