(function() {
  var Collection, List,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Collection = require('backbone').Collection;

  module.exports = List = (function(_super) {
    __extends(List, _super);

    function List() {
      return List.__super__.constructor.apply(this, arguments);
    }

    List.prototype.selected_index = 0;

    List.prototype.is_sublist = false;

    List.prototype.leaf = function() {
      if (this.selection()) {
        return this.selection().leaf();
      }
    };

    List.prototype.selection = function() {
      return this.at(this.selected_index);
    };

    List.prototype.select = function(i) {
      var old_selection;
      old_selection = this.selected_index;
      if (this.selection()) {
        this.selection().deselect();
      }
      if (this.is_sublist && i < 0) {
        this.selected_index = -1;
        return false;
      }
      this.selected_index = Math.max(Math.min(i, this.length - 1), 0);
      if (this.selection()) {
        this.selection().select();
      }
      return old_selection !== this.selected_index;
    };

    List.prototype.next = function() {
      if (this.selection() && !this.selection().allowNext()) {
        return false;
      }
      return this.select(this.selected_index + 1);
    };

    List.prototype.previous = function() {
      if (this.selection() && !this.selection().allowPrevious()) {
        return false;
      }
      return this.select(this.selected_index - 1);
    };

    return List;

  })(Collection);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxVQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBUUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLDJCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxtQkFBQSxjQUFBLEdBQWdCLENBQWhCLENBQUE7O0FBQUEsbUJBQ0EsVUFBQSxHQUFZLEtBRFosQ0FBQTs7QUFBQSxtQkFHQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0osTUFBQSxJQUFHLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBSDtlQUNFLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBWSxDQUFDLElBQWIsQ0FBQSxFQURGO09BREk7SUFBQSxDQUhOLENBQUE7O0FBQUEsbUJBT0EsU0FBQSxHQUFXLFNBQUEsR0FBQTthQUNULElBQUMsQ0FBQSxFQUFELENBQUksSUFBQyxDQUFBLGNBQUwsRUFEUztJQUFBLENBUFgsQ0FBQTs7QUFBQSxtQkFVQSxNQUFBLEdBQVEsU0FBQyxDQUFELEdBQUE7QUFDTixVQUFBLGFBQUE7QUFBQSxNQUFBLGFBQUEsR0FBZ0IsSUFBQyxDQUFBLGNBQWpCLENBQUE7QUFDQSxNQUFBLElBQUcsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFIO0FBQ0UsUUFBQSxJQUFDLENBQUEsU0FBRCxDQUFBLENBQVksQ0FBQyxRQUFiLENBQUEsQ0FBQSxDQURGO09BREE7QUFJQSxNQUFBLElBQUcsSUFBQyxDQUFBLFVBQUQsSUFBZ0IsQ0FBQSxHQUFJLENBQXZCO0FBQ0UsUUFBQSxJQUFDLENBQUEsY0FBRCxHQUFrQixDQUFBLENBQWxCLENBQUE7QUFDQSxlQUFPLEtBQVAsQ0FGRjtPQUpBO0FBQUEsTUFRQSxJQUFDLENBQUEsY0FBRCxHQUFrQixJQUFJLENBQUMsR0FBTCxDQUFTLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBVCxFQUFZLElBQUMsQ0FBQSxNQUFELEdBQVUsQ0FBdEIsQ0FBVCxFQUFtQyxDQUFuQyxDQVJsQixDQUFBO0FBVUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBSDtBQUNFLFFBQUEsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFZLENBQUMsTUFBYixDQUFBLENBQUEsQ0FERjtPQVZBO2FBYUEsYUFBQSxLQUFpQixJQUFDLENBQUEsZUFkWjtJQUFBLENBVlIsQ0FBQTs7QUFBQSxtQkEwQkEsSUFBQSxHQUFNLFNBQUEsR0FBQTtBQUNKLE1BQUEsSUFBZ0IsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFBLElBQWlCLENBQUEsSUFBSyxDQUFBLFNBQUQsQ0FBQSxDQUFZLENBQUMsU0FBYixDQUFBLENBQXJDO0FBQUEsZUFBTyxLQUFQLENBQUE7T0FBQTthQUNBLElBQUMsQ0FBQSxNQUFELENBQVMsSUFBQyxDQUFBLGNBQUQsR0FBa0IsQ0FBM0IsRUFGSTtJQUFBLENBMUJOLENBQUE7O0FBQUEsbUJBOEJBLFFBQUEsR0FBVSxTQUFBLEdBQUE7QUFDUixNQUFBLElBQWdCLElBQUMsQ0FBQSxTQUFELENBQUEsQ0FBQSxJQUFpQixDQUFBLElBQUssQ0FBQSxTQUFELENBQUEsQ0FBWSxDQUFDLGFBQWIsQ0FBQSxDQUFyQztBQUFBLGVBQU8sS0FBUCxDQUFBO09BQUE7YUFDQSxJQUFDLENBQUEsTUFBRCxDQUFRLElBQUMsQ0FBQSxjQUFELEdBQWtCLENBQTFCLEVBRlE7SUFBQSxDQTlCVixDQUFBOztnQkFBQTs7S0FEaUIsV0FUbkIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/models/list.coffee