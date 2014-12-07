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

    Side.prototype.lineClass = function() {
      if (this.wasChosen()) {
        return 'conflict-resolved';
      } else if (this.isDirty) {
        return 'conflict-dirty';
      } else {
        return "conflict-" + (this.klass());
      }
    };

    Side.prototype.toString = function() {
      var chosenMark, dirtyMark, text;
      text = this.originalText.replace(/[\n\r]/, ' ');
      if (text.length > 20) {
        text = text.slice(0, 18) + "...";
      }
      dirtyMark = this.isDirty ? ' dirty' : '';
      chosenMark = this.wasChosen() ? ' chosen' : '';
      return "[" + (this.klass()) + ": " + text + " :" + dirtyMark + chosenMark + "]";
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBTTtBQUNTLElBQUEsY0FBRSxZQUFGLEVBQWlCLEdBQWpCLEVBQXVCLE1BQXZCLEVBQWdDLGVBQWhDLEVBQWtELFFBQWxELEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxlQUFBLFlBQ2IsQ0FBQTtBQUFBLE1BRDJCLElBQUMsQ0FBQSxNQUFBLEdBQzVCLENBQUE7QUFBQSxNQURpQyxJQUFDLENBQUEsU0FBQSxNQUNsQyxDQUFBO0FBQUEsTUFEMEMsSUFBQyxDQUFBLGtCQUFBLGVBQzNDLENBQUE7QUFBQSxNQUQ0RCxJQUFDLENBQUEsV0FBQSxRQUM3RCxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsUUFBRCxHQUFZLElBQVosQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxLQURYLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxlQUFELEdBQW1CLElBRm5CLENBRFc7SUFBQSxDQUFiOztBQUFBLG1CQUtBLE9BQUEsR0FBUyxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLFNBQVYsQ0FBb0IsSUFBcEIsRUFBSDtJQUFBLENBTFQsQ0FBQTs7QUFBQSxtQkFPQSxTQUFBLEdBQVcsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxVQUFWLEtBQXdCLEtBQTNCO0lBQUEsQ0FQWCxDQUFBOztBQUFBLG1CQVNBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLElBQUcsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFIO2VBQ0Usb0JBREY7T0FBQSxNQUVLLElBQUcsSUFBQyxDQUFBLE9BQUo7ZUFDSCxpQkFERztPQUFBLE1BQUE7ZUFHRixXQUFBLEdBQVUsQ0FBQSxJQUFDLENBQUEsS0FBRCxDQUFBLENBQUEsRUFIUjtPQUhJO0lBQUEsQ0FUWCxDQUFBOztBQUFBLG1CQWlCQSxRQUFBLEdBQVUsU0FBQSxHQUFBO0FBQ1IsVUFBQSwyQkFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxZQUFZLENBQUMsT0FBZCxDQUFzQixRQUF0QixFQUFnQyxHQUFoQyxDQUFQLENBQUE7QUFDQSxNQUFBLElBQUcsSUFBSSxDQUFDLE1BQUwsR0FBYyxFQUFqQjtBQUNFLFFBQUEsSUFBQSxHQUFPLElBQUssYUFBTCxHQUFjLEtBQXJCLENBREY7T0FEQTtBQUFBLE1BR0EsU0FBQSxHQUFlLElBQUMsQ0FBQSxPQUFKLEdBQWlCLFFBQWpCLEdBQStCLEVBSDNDLENBQUE7QUFBQSxNQUlBLFVBQUEsR0FBZ0IsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFILEdBQXFCLFNBQXJCLEdBQW9DLEVBSmpELENBQUE7YUFLQyxHQUFBLEdBQUUsQ0FBQSxJQUFDLENBQUEsS0FBRCxDQUFBLENBQUEsQ0FBRixHQUFZLElBQVosR0FBZSxJQUFmLEdBQXFCLElBQXJCLEdBQXdCLFNBQXhCLEdBQW9DLFVBQXBDLEdBQWdELElBTnpDO0lBQUEsQ0FqQlYsQ0FBQTs7Z0JBQUE7O01BREYsQ0FBQTs7QUFBQSxFQTJCTTtBQUVKLDhCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxzQkFBQSxJQUFBLEdBQU0sU0FBQSxHQUFBO2FBQUcsRUFBSDtJQUFBLENBQU4sQ0FBQTs7QUFBQSxzQkFFQSxLQUFBLEdBQU8sU0FBQSxHQUFBO2FBQUcsT0FBSDtJQUFBLENBRlAsQ0FBQTs7QUFBQSxzQkFJQSxXQUFBLEdBQWEsU0FBQSxHQUFBO2FBQUcsY0FBSDtJQUFBLENBSmIsQ0FBQTs7QUFBQSxzQkFNQSxTQUFBLEdBQVcsU0FBQSxHQUFBO2FBQUcsOEJBQUg7SUFBQSxDQU5YLENBQUE7O21CQUFBOztLQUZvQixLQTNCdEIsQ0FBQTs7QUFBQSxFQXFDTTtBQUVKLGdDQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSx3QkFBQSxJQUFBLEdBQU0sU0FBQSxHQUFBO2FBQUcsRUFBSDtJQUFBLENBQU4sQ0FBQTs7QUFBQSx3QkFFQSxLQUFBLEdBQU8sU0FBQSxHQUFBO2FBQUcsU0FBSDtJQUFBLENBRlAsQ0FBQTs7QUFBQSx3QkFJQSxXQUFBLEdBQWEsU0FBQSxHQUFBO2FBQUcsZ0JBQUg7SUFBQSxDQUpiLENBQUE7O0FBQUEsd0JBTUEsU0FBQSxHQUFXLFNBQUEsR0FBQTthQUFHLGdDQUFIO0lBQUEsQ0FOWCxDQUFBOztxQkFBQTs7S0FGc0IsS0FyQ3hCLENBQUE7O0FBQUEsRUErQ0EsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFBQSxJQUFBLElBQUEsRUFBTSxJQUFOO0FBQUEsSUFBWSxPQUFBLEVBQVMsT0FBckI7QUFBQSxJQUE4QixTQUFBLEVBQVcsU0FBekM7R0EvQ2pCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/merge-conflicts/lib/side.coffee