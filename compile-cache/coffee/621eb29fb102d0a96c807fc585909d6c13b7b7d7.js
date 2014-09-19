(function() {
  var MinimapHighlightSelected, Subscriber,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Subscriber = require('emissary').Subscriber;

  MinimapHighlightSelected = (function() {
    function MinimapHighlightSelected() {
      this.destroyViews = __bind(this.destroyViews, this);
      this.createViews = __bind(this.createViews, this);
    }

    Subscriber.includeInto(MinimapHighlightSelected);

    MinimapHighlightSelected.prototype.views = {};

    MinimapHighlightSelected.prototype.activate = function(state) {
      this.highlightSelectedPackage = atom.packages.getLoadedPackage('highlight-selected');
      this.minimapPackage = atom.packages.getLoadedPackage('minimap');
      if (!((this.highlightSelectedPackage != null) && (this.minimapPackage != null))) {
        return this.deactivate();
      }
      this.MinimapHighlightSelectedView = require('./minimap-highlight-selected-view')();
      this.minimap = require(this.minimapPackage.path);
      this.highlightSelected = require(this.highlightSelectedPackage.path);
      return this.minimap.registerPlugin('highlight-selected', this);
    };

    MinimapHighlightSelected.prototype.deactivate = function() {
      this.deactivatePlugin();
      this.minimapPackage = null;
      this.highlightSelectedPackage = null;
      this.highlightSelected = null;
      return this.minimap = null;
    };

    MinimapHighlightSelected.prototype.isActive = function() {
      return this.active;
    };

    MinimapHighlightSelected.prototype.activatePlugin = function() {
      if (this.active) {
        return;
      }
      this.active = true;
      if (this.minimap.active) {
        this.createViews();
      }
      this.subscribe(this.minimap, 'activated', this.createViews);
      return this.subscribe(this.minimap, 'deactivated', this.destroyViews);
    };

    MinimapHighlightSelected.prototype.deactivatePlugin = function() {
      if (!this.active) {
        return;
      }
      this.active = false;
      this.destroyViews();
      return this.unsubscribe();
    };

    MinimapHighlightSelected.prototype.createViews = function() {
      if (this.viewsCreated) {
        return;
      }
      this.viewsCreated = true;
      return this.viewsSubscription = this.minimap.eachMinimapView((function(_this) {
        return function(_arg) {
          var highlightView, view;
          view = _arg.view;
          highlightView = new _this.MinimapHighlightSelectedView(view);
          highlightView.attach();
          highlightView.handleSelection();
          return _this.views[view.editor.id] = highlightView;
        };
      })(this));
    };

    MinimapHighlightSelected.prototype.destroyViews = function() {
      var id, view, _ref;
      if (!this.viewsCreated) {
        return;
      }
      this.viewsSubscription.off();
      this.viewsCreated = false;
      _ref = this.views;
      for (id in _ref) {
        view = _ref[id];
        view.destroy();
      }
      return this.views = {};
    };

    return MinimapHighlightSelected;

  })();

  module.exports = new MinimapHighlightSelected;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9DQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxhQUFjLE9BQUEsQ0FBUSxVQUFSLEVBQWQsVUFBRCxDQUFBOztBQUFBLEVBRU07Ozs7S0FDSjs7QUFBQSxJQUFBLFVBQVUsQ0FBQyxXQUFYLENBQXVCLHdCQUF2QixDQUFBLENBQUE7O0FBQUEsdUNBRUEsS0FBQSxHQUFPLEVBRlAsQ0FBQTs7QUFBQSx1Q0FJQSxRQUFBLEdBQVUsU0FBQyxLQUFELEdBQUE7QUFDUixNQUFBLElBQUMsQ0FBQSx3QkFBRCxHQUE0QixJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLG9CQUEvQixDQUE1QixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsY0FBRCxHQUFrQixJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLFNBQS9CLENBRGxCLENBQUE7QUFHQSxNQUFBLElBQUEsQ0FBQSxDQUE0Qix1Q0FBQSxJQUErQiw2QkFBM0QsQ0FBQTtBQUFBLGVBQU8sSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQUFQLENBQUE7T0FIQTtBQUFBLE1BS0EsSUFBQyxDQUFBLDRCQUFELEdBQWdDLE9BQUEsQ0FBUSxtQ0FBUixDQUFBLENBQUEsQ0FMaEMsQ0FBQTtBQUFBLE1BT0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxPQUFBLENBQVEsSUFBQyxDQUFBLGNBQWMsQ0FBQyxJQUF4QixDQVBYLENBQUE7QUFBQSxNQVFBLElBQUMsQ0FBQSxpQkFBRCxHQUFxQixPQUFBLENBQVEsSUFBQyxDQUFBLHdCQUF3QixDQUFDLElBQWxDLENBUnJCLENBQUE7YUFVQSxJQUFDLENBQUEsT0FBTyxDQUFDLGNBQVQsQ0FBd0Isb0JBQXhCLEVBQThDLElBQTlDLEVBWFE7SUFBQSxDQUpWLENBQUE7O0FBQUEsdUNBaUJBLFVBQUEs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
//# sourceURL=/Users/daniel/.atom/packages/minimap-highlight-selected/lib/minimap-highlight-selected.coffee