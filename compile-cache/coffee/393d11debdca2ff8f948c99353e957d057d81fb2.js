(function() {
  var ListItem, Model,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Model = require('backbone').Model;

  ListItem = (function(_super) {
    __extends(ListItem, _super);

    function ListItem() {
      this.leaf = __bind(this.leaf, this);
      this.allowNext = __bind(this.allowNext, this);
      this.allowPrevious = __bind(this.allowPrevious, this);
      this.isSelected = __bind(this.isSelected, this);
      this.deselect = __bind(this.deselect, this);
      this.select = __bind(this.select, this);
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

    ListItem.prototype.isSelected = function() {
      return this.get('selected');
    };

    ListItem.prototype.allowPrevious = function() {
      var _ref;
      if (this.useSublist()) {
        return !((_ref = this.sublist) != null ? _ref.previous() : void 0);
      } else {
        return true;
      }
    };

    ListItem.prototype.allowNext = function() {
      var _ref;
      if (this.useSublist()) {
        return !((_ref = this.sublist) != null ? _ref.next() : void 0);
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

  module.exports = ListItem;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGVBQUE7SUFBQTs7bVNBQUE7O0FBQUEsRUFBQyxRQUFTLE9BQUEsQ0FBUSxVQUFSLEVBQVQsS0FBRCxDQUFBOztBQUFBLEVBTU07QUFLSiwrQkFBQSxDQUFBOzs7Ozs7Ozs7OztLQUFBOztBQUFBLHVCQUFBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFBLElBQUcsSUFBQyxDQUFBLFVBQUo7ZUFDRSxJQUFDLENBQUEsVUFBVSxDQUFDLE1BQVosQ0FBbUIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQW9CLElBQXBCLENBQW5CLEVBREY7T0FBQSxNQUFBO2VBR0UsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQUhGO09BRFU7SUFBQSxDQUFaLENBQUE7O0FBQUEsdUJBT0EsTUFBQSxHQUFRLFNBQUEsR0FBQTthQUNOLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLFFBQUEsRUFBVSxJQUFWO09BQUwsRUFETTtJQUFBLENBUFIsQ0FBQTs7QUFBQSx1QkFXQSxRQUFBLEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsUUFBQSxFQUFVLEtBQVY7T0FBTCxFQURRO0lBQUEsQ0FYVixDQUFBOztBQUFBLHVCQWlCQSxVQUFBLEdBQVksU0FBQSxHQUFBO2FBQ1YsSUFBQyxDQUFBLEdBQUQsQ0FBSyxVQUFMLEVBRFU7SUFBQSxDQWpCWixDQUFBOztBQUFBLHVCQXVCQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ2IsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBSDtlQUNFLENBQUEscUNBQVksQ0FBRSxRQUFWLENBQUEsWUFETjtPQUFBLE1BQUE7ZUFHRSxLQUhGO09BRGE7SUFBQSxDQXZCZixDQUFBOztBQUFBLHVCQWdDQSxTQUFBLEdBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBSDtlQUNFLENBQUEscUNBQVksQ0FBRSxJQUFWLENBQUEsWUFETjtPQUFBLE1BQUE7ZUFHRSxLQUhGO09BRFM7SUFBQSxDQWhDWCxDQUFBOztBQUFBLHVCQXlDQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0osTUFBQSxJQUFHLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBSDtlQUNFLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFBLENBQUEsSUFBbUIsS0FEckI7T0FBQSxNQUFBO2VBR0UsS0FIRjtPQURJO0lBQUEsQ0F6Q04sQ0FBQTs7QUFBQSx1QkErQ0EsVUFBQSxHQUFZLFNBQUEsR0FBQTthQUFHLE1BQUg7SUFBQSxDQS9DWixDQUFBOztvQkFBQTs7S0FMcUIsTUFOdkIsQ0FBQTs7QUFBQSxFQTREQSxNQUFNLENBQUMsT0FBUCxHQUFpQixRQTVEakIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/list-item.coffee