(function() {
  var View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  module.exports = function() {
    var HighlightedAreaView, MinimapHighlightSelectedView, highlightSelected, highlightSelectedPackage, minimap, minimapPackage;
    highlightSelectedPackage = atom.packages.getLoadedPackage('highlight-selected');
    minimapPackage = atom.packages.getLoadedPackage('minimap');
    minimap = require(minimapPackage.path);
    highlightSelected = require(highlightSelectedPackage.path);
    HighlightedAreaView = require(highlightSelectedPackage.path + '/lib/highlighted-area-view');
    return MinimapHighlightSelectedView = (function(_super) {
      __extends(MinimapHighlightSelectedView, _super);

      function MinimapHighlightSelectedView() {
        this.onActiveItemChanged = __bind(this.onActiveItemChanged, this);
        MinimapHighlightSelectedView.__super__.constructor.apply(this, arguments);
        this.paneView = this.editorView.getPane();
        this.subscribe(this.paneView.model.$activeItem, this.onActiveItemChanged);
      }

      MinimapHighlightSelectedView.prototype.attach = function() {
        var minimapView;
        this.subscribe(this.editorView, "selection:changed", this.handleSelection);
        minimapView = this.getMinimap();
        if (minimapView != null) {
          minimapView.miniOverlayer.append(this);
          return this.adjustResults();
        }
      };

      MinimapHighlightSelectedView.prototype.detach = function() {
        MinimapHighlightSelectedView.__super__.detach.apply(this, arguments);
        return this.unsubscribe(this.editorView, "selection:changed", this.handleSelection);
      };

      MinimapHighlightSelectedView.prototype.adjustResults = function() {
        return this.css('-webkit-transform', "scale3d(" + (minimap.getCharWidthRatio()) + ",1,1)");
      };

      MinimapHighlightSelectedView.prototype.onActiveItemChanged = function(item) {
        if (item === this.activeItem) {
          return;
        }
        if (this.paneView.activeView === this.editorView) {
          return this.attach();
        } else {
          return this.detach();
        }
      };

      MinimapHighlightSelectedView.prototype.getMinimap = function() {
        if (this.editorView.hasClass('editor')) {
          return minimap.minimapForEditorView(this.editorView);
        }
      };

      return MinimapHighlightSelectedView;

    })(HighlightedAreaView);
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLElBQUE7SUFBQTs7bVNBQUE7O0FBQUEsRUFBQyxPQUFRLE9BQUEsQ0FBUSxNQUFSLEVBQVIsSUFBRCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQSxHQUFBO0FBQ2YsUUFBQSx1SEFBQTtBQUFBLElBQUEsd0JBQUEsR0FBMkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixvQkFBL0IsQ0FBM0IsQ0FBQTtBQUFBLElBQ0EsY0FBQSxHQUFpQixJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLFNBQS9CLENBRGpCLENBQUE7QUFBQSxJQUdBLE9BQUEsR0FBVSxPQUFBLENBQVMsY0FBYyxDQUFDLElBQXhCLENBSFYsQ0FBQTtBQUFBLElBSUEsaUJBQUEsR0FBb0IsT0FBQSxDQUFTLHdCQUF3QixDQUFDLElBQWxDLENBSnBCLENBQUE7QUFBQSxJQUtBLG1CQUFBLEdBQXNCLE9BQUEsQ0FBUyx3QkFBd0IsQ0FBQyxJQUF6QixHQUFnQyw0QkFBekMsQ0FMdEIsQ0FBQTtXQU9NO0FBQ0oscURBQUEsQ0FBQTs7QUFBYSxNQUFBLHNDQUFBLEdBQUE7QUFDWCx5RUFBQSxDQUFBO0FBQUEsUUFBQSwrREFBQSxTQUFBLENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBQSxDQURaLENBQUE7QUFBQSxRQUVBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLFFBQVEsQ0FBQyxLQUFLLENBQUMsV0FBM0IsRUFBd0MsSUFBQyxDQUFBLG1CQUF6QyxDQUZBLENBRFc7TUFBQSxDQUFiOztBQUFBLDZDQUtBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixZQUFBLFdBQUE7QUFBQSxRQUFBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBQyxDQUFBLFVBQVosRUFBd0IsbUJBQXhCLEVBQTZDLElBQUMsQ0FBQSxlQUE5QyxDQUFBLENBQUE7QUFBQSxRQUVBLFdBQUEsR0FBYyxJQUFDLENBQUEsVUFBRCxDQUFBLENBRmQsQ0FBQTtBQUlBLFFBQUEsSUFBRyxtQkFBSDtBQUNFLFVBQUEsV0FBVyxDQUFDLGFBQWEsQ0FBQyxNQUExQixDQUFpQyxJQUFqQyxDQUFBLENBQUE7aUJBQ0EsSUFBQyxDQUFBLGFBQUQsQ0FBQSxFQUZGO1NBTE07TUFBQSxDQUxSLENBQUE7O0FBQUEsNkNBY0EsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNOLFFBQUEsMERBQUEsU0FBQSxDQUFBLENBQUE7ZUFDQSxJQUFDLENBQUEsV0FBRCxDQUFhLElBQUMsQ0FBQSxVQUFkLEVBQTBCLG1CQUExQixFQUErQyxJQUFDLENBQUEsZUFBaEQsRUFGTTtNQUFBLENBZFIsQ0FBQTs7QUFBQSw2Q0FrQkEsYUFBQSxHQUFlLFNBQUEsR0FBQTtlQUNiLElBQUMsQ0FBQSxHQUFELENBQUssbUJBQUwsRUFBMkIsVUFBQSxHQUFTLENBQUEsT0FBTyxDQUFDLGlCQUFSLENBQUEsQ0FBQSxDQUFULEdBQXNDLE9BQWpFLEVBRGE7TUFBQSxDQWxCZixDQUFBOztBQUFBLDZDQXFCQSxtQkFBQSxHQUFxQixTQUFDLElBQUQsR0FBQTtBQUNuQixRQUFBLElBQVUsSUFBQSxLQUFRLElBQUMsQ0FBQSxVQUFuQjtBQUFBLGdCQUFBLENBQUE7U0FBQTtBQUVBLFFBQUEsSUFBRyxJQUFDLENBQUEsUUFBUSxDQUFDLFVBQVYsS0FBd0IsSUFBQyxDQUFBLFVBQTVCO2lCQUNFLElBQUMsQ0FBQSxNQUFELENBQUEsRUFERjtTQUFBLE1BQUE7aUJBR0UsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQUhGO1NBSG1CO01BQUEsQ0FyQnJCLENBQUE7O0FBQUEsNkNBNkJBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixRQUFBLElBQUcsSUFBQyxDQUFBLFVBQVUsQ0FBQyxRQUFaLENBQXFCLFFBQXJCLENBQUg7QUFDRSxpQkFBTyxPQUFPLENBQUMsb0JBQVIsQ0FBNkIsSUFBQyxDQUFBLFVBQTlCLENBQVAsQ0FERjtTQURVO01BQUEsQ0E3QlosQ0FBQTs7MENBQUE7O09BRHlDLHFCQVI1QjtFQUFBLENBRmpCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/minimap-highlight-selected/lib/minimap-highlight-selected-view.coffee