(function() {
  var ListItem, Model,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Model = require('backbone').Model;

  module.exports = ListItem = (function(_super) {
    __extends(ListItem, _super);

    function ListItem() {
      this.selfSelect = __bind(this.selfSelect, this);
      return ListItem.__super__.constructor.apply(this, arguments);
    }

    ListItem.prototype.selfSelect = function() {
      if (this.collection) {
        return this.collection.select(this.collection.indexOf(this));
      } else {
        return this.select();
      }
    };

    ListItem.prototype.select = function() {
      return this.set({
        selected: true
      });
    };

    ListItem.prototype.deselect = function() {
      return this.set({
        selected: false
      });
    };

    ListItem.prototype.selectedP = function() {
      return this.get("selected");
    };

    ListItem.prototype.allowPrevious = function() {
      if (this.useSublist()) {
        return !this.sublist.previous();
      } else {
        return true;
      }
    };

    ListItem.prototype.allowNext = function() {
      if (this.useSublist()) {
        return !this.sublist.next();
      } else {
        return true;
      }
    };

    ListItem.prototype.leaf = function() {
      if (this.useSublist()) {
        return this.sublist.leaf() || this;
      } else {
        return this;
      }
    };

    ListItem.prototype.useSublist = function() {
      return false;
    };

    return ListItem;

  })(Model);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGVBQUE7SUFBQTs7bVNBQUE7O0FBQUEsRUFBQyxRQUFTLE9BQUEsQ0FBUSxVQUFSLEVBQVQsS0FBRCxDQUFBOztBQUFBLEVBUUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLCtCQUFBLENBQUE7Ozs7O0tBQUE7O0FBQUEsdUJBQUEsVUFBQSxHQUFZLFNBQUEsR0FBQTtBQUdWLE1BQUEsSUFBRyxJQUFDLENBQUEsVUFBSjtlQUNFLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixDQUFtQixJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBb0IsSUFBcEIsQ0FBbkIsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsTUFBRCxDQUFBLEVBSEY7T0FIVTtJQUFBLENBQVosQ0FBQTs7QUFBQSx1QkFRQSxNQUFBLEdBQVEsU0FBQSxHQUFBO2FBQ04sSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsUUFBQSxFQUFVLElBQVY7T0FBTCxFQURNO0lBQUEsQ0FSUixDQUFBOztBQUFBLHVCQVdBLFFBQUEsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxRQUFBLEVBQVUsS0FBVjtPQUFMLEVBRFE7SUFBQSxDQVhWLENBQUE7O0FBQUEsdUJBY0EsU0FBQSxHQUFXLFNBQUEsR0FBQTthQUNULElBQUMsQ0FBQSxHQUFELENBQUssVUFBTCxFQURTO0lBQUEsQ0FkWCxDQUFBOztBQUFBLHVCQWlCQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ2IsTUFBQSxJQUFHLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBSDtlQUNFLENBQUEsSUFBSyxDQUFBLE9BQU8sQ0FBQyxRQUFULENBQUEsRUFETjtPQUFBLE1BQUE7ZUFHRSxLQUhGO09BRGE7SUFBQSxDQWpCZixDQUFBOztBQUFBLHVCQXVCQSxTQUFBLEdBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxJQUFHLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBSDtlQUNFLENBQUEsSUFBSyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQUEsRUFETjtPQUFBLE1BQUE7ZUFHRSxLQUhGO09BRFM7SUFBQSxDQXZCWCxDQUFBOztBQUFBLHVCQTZCQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0osTUFBQSxJQUFHLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBSDtlQUNFLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFBLENBQUEsSUFBbUIsS0FEckI7T0FBQSxNQUFBO2VBR0UsS0FIRjtPQURJO0lBQUEsQ0E3Qk4sQ0FBQTs7QUFBQSx1QkFtQ0EsVUFBQSxHQUFZLFNBQUEsR0FBQTthQUFHLE1BQUg7SUFBQSxDQW5DWixDQUFBOztvQkFBQTs7S0FEcUIsTUFUdkIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/list-item.coffee