(function() {
  var CompositeDisposable, MinimapHighlightSelected,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  CompositeDisposable = require('event-kit').CompositeDisposable;

  MinimapHighlightSelected = (function() {
    function MinimapHighlightSelected() {
      this.destroyViews = __bind(this.destroyViews, this);
      this.createViews = __bind(this.createViews, this);
      this.subscriptions = new CompositeDisposable;
    }

    MinimapHighlightSelected.prototype.activate = function(state) {
      this.highlightSelectedPackage = atom.packages.getLoadedPackage('highlight-selected');
      this.minimapPackage = atom.packages.getLoadedPackage('minimap');
      if (!((this.highlightSelectedPackage != null) && (this.minimapPackage != null))) {
        return this.deactivate();
      }
      this.MinimapHighlightSelectedView = require('./minimap-highlight-selected-view')();
      this.minimap = require(this.minimapPackage.path);
      this.highlightSelected = require(this.highlightSelectedPackage.path);
      if (!this.minimap.versionMatch('3.x')) {
        return this.deactivate();
      }
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
      if (!this.minimap.active) {
        return;
      }
      this.active = true;
      this.createViews();
      this.subscriptions.add(this.minimap.onDidActivate(this.createViews));
      return this.subscriptions.add(this.minimap.onDidDeactivate(this.destroyViews));
    };

    MinimapHighlightSelected.prototype.deactivatePlugin = function() {
      if (!this.active) {
        return;
      }
      this.active = false;
      this.destroyViews();
      return this.subscriptions.dispose();
    };

    MinimapHighlightSelected.prototype.createViews = function() {
      if (this.viewsCreated) {
        return;
      }
      this.viewsCreated = true;
      this.view = new this.MinimapHighlightSelectedView(this.minimap);
      return this.view.handleSelection();
    };

    MinimapHighlightSelected.prototype.destroyViews = function() {
      if (!this.viewsCreated) {
        return;
      }
      this.viewsCreated = false;
      this.view.removeMarkers();
      return this.view.destroy();
    };

    return MinimapHighlightSelected;

  })();

  module.exports = new MinimapHighlightSelected;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZDQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxzQkFBdUIsT0FBQSxDQUFRLFdBQVIsRUFBdkIsbUJBQUQsQ0FBQTs7QUFBQSxFQUVNO0FBQ1MsSUFBQSxrQ0FBQSxHQUFBO0FBQ1gseURBQUEsQ0FBQTtBQUFBLHVEQUFBLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEdBQUEsQ0FBQSxtQkFBakIsQ0FEVztJQUFBLENBQWI7O0FBQUEsdUNBR0EsUUFBQSxHQUFVLFNBQUMsS0FBRCxHQUFBO0FBQ1IsTUFBQSxJQUFDLENBQUEsd0JBQUQsR0FBNEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixvQkFBL0IsQ0FBNUIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGNBQUQsR0FBa0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixTQUEvQixDQURsQixDQUFBO0FBR0EsTUFBQSxJQUFBLENBQUEsQ0FBNEIsdUNBQUEsSUFBK0IsNkJBQTNELENBQUE7QUFBQSxlQUFPLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBUCxDQUFBO09BSEE7QUFBQSxNQUtBLElBQUMsQ0FBQSw0QkFBRCxHQUFnQyxPQUFBLENBQVEsbUNBQVIsQ0FBQSxDQUFBLENBTGhDLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxPQUFELEdBQVcsT0FBQSxDQUFRLElBQUMsQ0FBQSxjQUFjLENBQUMsSUFBeEIsQ0FQWCxDQUFBO0FBQUEsTUFRQSxJQUFDLENBQUEsaUJBQUQsR0FBcUIsT0FBQSxDQUFRLElBQUMsQ0FBQSx3QkFBd0IsQ0FBQyxJQUFsQyxDQVJyQixDQUFBO0FBVUEsTUFBQSxJQUFBLENBQUEsSUFBNkIsQ0FBQSxPQUFPLENBQUMsWUFBVCxDQUFzQixLQUF0QixDQUE1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
//# sourceURL=/Users/daniel/.atom/packages/minimap-highlight-selected/lib/minimap-highlight-selected.coffee