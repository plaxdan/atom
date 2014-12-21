(function() {
  var CompositeDisposable, MinimapSelectionView, View,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom-space-pen-views').View;

  CompositeDisposable = require('event-kit').CompositeDisposable;

  module.exports = MinimapSelectionView = (function(_super) {
    __extends(MinimapSelectionView, _super);

    function MinimapSelectionView() {
      this.handleSelection = __bind(this.handleSelection, this);
      return MinimapSelectionView.__super__.constructor.apply(this, arguments);
    }

    MinimapSelectionView.prototype.decorations = [];

    MinimapSelectionView.content = function() {
      return this.div({
        "class": 'minimap-selection'
      });
    };

    MinimapSelectionView.prototype.initialize = function(minimapView) {
      this.minimapView = minimapView;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(this.minimapView.editor.onDidChangeSelectionRange(this.handleSelection));
      this.subscriptions.add(this.minimapView.editor.onDidAddCursor(this.handleSelection));
      this.subscriptions.add(this.minimapView.editor.onDidChangeCursorPosition(this.handleSelection));
      return this.subscriptions.add(this.minimapView.editor.onDidRemoveCursor(this.handleSelection));
    };

    MinimapSelectionView.prototype.attach = function() {
      this.minimapView.miniUnderlayer.append(this);
      return this.handleSelection();
    };

    MinimapSelectionView.prototype.destroy = function() {
      this.detach();
      this.subscriptions.dispose();
      return this.minimapView = null;
    };

    MinimapSelectionView.prototype.handleSelection = function() {
      var decoration, editor, selection, _i, _len, _ref, _results;
      this.removeDecorations();
      editor = this.minimapView.editor;
      _ref = editor.getSelections();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        selection = _ref[_i];
        if (!selection.isEmpty()) {
          decoration = this.minimapView.decorateMarker(selection.marker, {
            type: 'highlight-under',
            scope: '.minimap .minimap-selection .region'
          });
          if (decoration != null) {
            _results.push(this.decorations.push(decoration));
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    MinimapSelectionView.prototype.removeDecorations = function() {
      var decoration, _i, _len, _ref;
      if (this.decorations.length === 0) {
        return;
      }
      _ref = this.decorations;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        decoration = _ref[_i];
        if (decoration != null) {
          decoration.destroy();
        }
      }
      return this.decorations = [];
    };

    return MinimapSelectionView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtDQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsc0JBQVIsRUFBUixJQUFELENBQUE7O0FBQUEsRUFDQyxzQkFBdUIsT0FBQSxDQUFRLFdBQVIsRUFBdkIsbUJBREQsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiwyQ0FBQSxDQUFBOzs7OztLQUFBOztBQUFBLG1DQUFBLFdBQUEsR0FBYSxFQUFiLENBQUE7O0FBQUEsSUFDQSxvQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sbUJBQVA7T0FBTCxFQURRO0lBQUEsQ0FEVixDQUFBOztBQUFBLG1DQUlBLFVBQUEsR0FBWSxTQUFFLFdBQUYsR0FBQTtBQUNWLE1BRFcsSUFBQyxDQUFBLGNBQUEsV0FDWixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBQWpCLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsV0FBVyxDQUFDLE1BQU0sQ0FBQyx5QkFBcEIsQ0FBOEMsSUFBQyxDQUFBLGVBQS9DLENBQW5CLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxHQUFmLENBQW1CLElBQUMsQ0FBQSxXQUFXLENBQUMsTUFBTSxDQUFDLGNBQXBCLENBQW1DLElBQUMsQ0FBQSxlQUFwQyxDQUFuQixDQUZBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsV0FBVyxDQUFDLE1BQU0sQ0FBQyx5QkFBcEIsQ0FBOEMsSUFBQyxDQUFBLGVBQS9DLENBQW5CLENBSEEsQ0FBQTthQUlBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsV0FBVyxDQUFDLE1BQU0sQ0FBQyxpQkFBcEIsQ0FBc0MsSUFBQyxDQUFBLGVBQXZDLENBQW5CLEVBTFU7SUFBQSxDQUpaLENBQUE7O0FBQUEsbUNBV0EsTUFBQSxHQUFRLFNBQUEsR0FBQTtBQUNOLE1BQUEsSUFBQyxDQUFBLFdBQVcsQ0FBQyxjQUFjLENBQUMsTUFBNUIsQ0FBbUMsSUFBbkMsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLGVBQUQsQ0FBQSxFQUZNO0lBQUEsQ0FYUixDQUFBOztBQUFBLG1DQWVBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxNQUFBLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQSxDQURBLENBQUE7YUFFQSxJQUFDLENBQUEsV0FBRCxHQUFlLEtBSFI7SUFBQSxDQWZULENBQUE7O0FBQUEsbUNBb0JBLGVBQUEsR0FBaUIsU0FBQSxHQUFBO0FBQ2YsVUFBQSx1REFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLGlCQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFFQyxTQUFVLElBQUMsQ0FBQSxZQUFYLE1BRkQsQ0FBQTtBQUlBO0FBQUE7V0FBQSwyQ0FBQTs2QkFBQTtBQUNFLFFBQUEsSUFBQSxDQUFBLFNBQWdCLENBQUMsT0FBVixDQUFBLENBQVA7QUFDRSxVQUFBLFVBQUEsR0FBYSxJQUFDLENBQUEsV0FBVyxDQUFDLGNBQWIsQ0FBNEIsU0FBUyxDQUFDLE1BQXRDLEVBQThDO0FBQUEsWUFBQSxJQUFBLEVBQU0saUJBQU47QUFBQSxZQUF5QixLQUFBLEVBQU8scUNBQWhDO1dBQTlDLENBQWIsQ0FBQTtBQUNBLFVBQUEsSUFBZ0Msa0JBQWhDOzBCQUFBLElBQUMsQ0FBQSxXQUFXLENBQUMsSUFBYixDQUFrQixVQUFsQixHQUFBO1dBQUEsTUFBQTtrQ0FBQTtXQUZGO1NBQUEsTUFBQTtnQ0FBQTtTQURGO0FBQUE7c0JBTGU7SUFBQSxDQXBCakIsQ0FBQTs7QUFBQSxtQ0E4QkEsaUJBQUEsR0FBbUIsU0FBQSxHQUFBO0FBQ2pCLFVBQUEsMEJBQUE7QUFBQSxNQUFBLElBQVUsSUFBQyxDQUFBLFdBQVcsQ0FBQyxNQUFiLEtBQXVCLENBQWpDO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFDQTtBQUFBLFdBQUEsMkNBQUE7OEJBQUE7O1VBQUEsVUFBVSxDQUFFLE9BQVosQ0FBQTtTQUFBO0FBQUEsT0FEQTthQUVBLElBQUMsQ0FBQSxXQUFELEdBQWUsR0FIRTtJQUFBLENBOUJuQixDQUFBOztnQ0FBQTs7S0FEaUMsS0FKbkMsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/minimap-selection/lib/minimap-selection-view.coffee