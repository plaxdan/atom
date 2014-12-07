(function() {
  var $, AtomColorHighlightView, CompositeDisposable, Disposable, DotMarkerView, MarkerView, Subscriber, View, _, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ = require('underscore-plus');

  _ref = require('space-pen'), View = _ref.View, $ = _ref.$;

  Subscriber = require('emissary').Subscriber;

  _ref1 = require('event-kit'), CompositeDisposable = _ref1.CompositeDisposable, Disposable = _ref1.Disposable;

  MarkerView = require('./marker-view');

  DotMarkerView = require('./dot-marker-view');

  module.exports = AtomColorHighlightView = (function(_super) {
    __extends(AtomColorHighlightView, _super);

    Subscriber.includeInto(AtomColorHighlightView);

    AtomColorHighlightView.content = function() {
      return this.div({
        "class": 'atom-color-highlight'
      });
    };

    function AtomColorHighlightView(model, editorView) {
      this.rebuildMarkers = __bind(this.rebuildMarkers, this);
      this.markersUpdated = __bind(this.markersUpdated, this);
      this.updateSelections = __bind(this.updateSelections, this);
      this.requestSelectionUpdate = __bind(this.requestSelectionUpdate, this);
      this.editorDestroyed = __bind(this.editorDestroyed, this);
      AtomColorHighlightView.__super__.constructor.apply(this, arguments);
      this.selections = [];
      this.markerViews = {};
      this.subscriptions = new CompositeDisposable;
      this.observeConfig();
      this.setEditorView(editorView);
      this.setModel(model);
      this.updateSelections();
    }

    AtomColorHighlightView.prototype.observeConfig = function() {
      this.subscriptions.add(atom.config.observe('atom-color-highlight.hideMarkersInComments', this.rebuildMarkers));
      this.subscriptions.add(atom.config.observe('atom-color-highlight.hideMarkersInStrings', this.rebuildMarkers));
      this.subscriptions.add(atom.config.observe('atom-color-highlight.markersAtEndOfLine', this.rebuildMarkers));
      this.subscriptions.add(atom.config.observe('atom-color-highlight.dotMarkersSize', this.rebuildMarkers));
      this.subscriptions.add(atom.config.observe('atom-color-highlight.dotMarkersSpading', this.rebuildMarkers));
      this.subscriptions.add(atom.config.observe('editor.lineHeight', this.rebuildMarkers));
      return this.subscriptions.add(atom.config.observe('editor.fontSize', this.rebuildMarkers));
    };

    AtomColorHighlightView.prototype.setModel = function(model) {
      this.unsubscribeFromModel();
      this.model = model;
      return this.subscribeToModel();
    };

    AtomColorHighlightView.prototype.setEditorView = function(editorView) {
      this.editorView = editorView;
      this.editor = this.editorView.editor;
      return this.subscribeToEditor();
    };

    AtomColorHighlightView.prototype.subscribeToModel = function() {
      if (this.model == null) {
        return;
      }
      return this.subscribe(this.model, 'updated', this.markersUpdated);
    };

    AtomColorHighlightView.prototype.unsubscribeFromModel = function() {
      if (this.model == null) {
        return;
      }
      return this.unsubscribe(this.model, 'updated');
    };

    AtomColorHighlightView.prototype.subscribeToEditor = function() {
      if (this.editor == null) {
        return;
      }
      this.subscriptions.add(this.editor.onDidDestroy(this.editorDestroyed));
      this.subscriptions.add(this.editor.onDidAddCursor(this.requestSelectionUpdate));
      this.subscriptions.add(this.editor.onDidRemoveCursor(this.requestSelectionUpdate));
      this.subscriptions.add(this.editor.onDidChangeCursorPosition(this.requestSelectionUpdate));
      this.subscriptions.add(this.editor.onDidAddSelection(this.requestSelectionUpdate));
      this.subscriptions.add(this.editor.onDidRemoveSelection(this.requestSelectionUpdate));
      return this.subscriptions.add(this.editor.onDidChangeSelectionRange(this.requestSelectionUpdate));
    };

    AtomColorHighlightView.prototype.editorDestroyed = function() {
      return this.destroy();
    };

    AtomColorHighlightView.prototype.requestSelectionUpdate = function() {
      if (this.updateRequested) {
        return;
      }
      this.updateRequested = true;
      return requestAnimationFrame((function(_this) {
        return function() {
          _this.updateRequested = false;
          if (_this.editor.getBuffer().isDestroyed()) {
            return;
          }
          return _this.updateSelections();
        };
      })(this));
    };

    AtomColorHighlightView.prototype.updateSelections = function() {
      var id, range, selection, selections, view, viewRange, viewsToBeDisplayed, _i, _len, _ref2, _ref3, _results;
      if (((_ref2 = this.markers) != null ? _ref2.length : void 0) === 0) {
        return;
      }
      selections = this.editor.getSelections();
      viewsToBeDisplayed = _.clone(this.markerViews);
      _ref3 = this.markerViews;
      for (id in _ref3) {
        view = _ref3[id];
        view.removeClass('selected');
        for (_i = 0, _len = selections.length; _i < _len; _i++) {
          selection = selections[_i];
          range = selection.getScreenRange();
          viewRange = view.getScreenRange();
          if (viewRange.intersectsWith(range)) {
            view.addClass('selected');
            delete viewsToBeDisplayed[id];
          }
        }
      }
      _results = [];
      for (id in viewsToBeDisplayed) {
        view = viewsToBeDisplayed[id];
        _results.push(view.show());
      }
      return _results;
    };

    AtomColorHighlightView.prototype.destroy = function() {
      this.unsubscribeFromModel();
      this.subscriptions.dispose();
      this.destroyAllViews();
      return this.detach();
    };

    AtomColorHighlightView.prototype.getMarkerAt = function(position) {
      var id, view, _ref2;
      _ref2 = this.markerViews;
      for (id in _ref2) {
        view = _ref2[id];
        if (view.marker.bufferMarker.containsPoint(position)) {
          return view;
        }
      }
    };

    AtomColorHighlightView.prototype.removeMarkers = function() {
      var id, markerView, _ref2;
      _ref2 = this.markerViews;
      for (id in _ref2) {
        markerView = _ref2[id];
        markerView.remove();
      }
      return this.markerViews = {};
    };

    AtomColorHighlightView.prototype.markersUpdated = function(markers) {
      var id, marker, markerView, markerViewsToRemoveById, markersByRows, sortedMarkers, useDots, _i, _j, _len, _len1, _ref2, _results;
      this.markers = markers;
      markerViewsToRemoveById = _.clone(this.markerViews);
      markersByRows = {};
      useDots = atom.config.get('atom-color-highlight.markersAtEndOfLine');
      sortedMarkers = [];
      _ref2 = this.markers;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        marker = _ref2[_i];
        if (this.markerViews[marker.id] != null) {
          delete markerViewsToRemoveById[marker.id];
          if (useDots) {
            sortedMarkers.push(this.markerViews[marker.id]);
          }
        } else {
          if (useDots) {
            markerView = new DotMarkerView({
              editorView: this.editorView,
              marker: marker,
              markersByRows: markersByRows
            });
            sortedMarkers.push(markerView);
          } else {
            markerView = new MarkerView({
              editorView: this.editorView,
              marker: marker
            });
          }
          this.append(markerView.element);
          this.markerViews[marker.id] = markerView;
        }
      }
      for (id in markerViewsToRemoveById) {
        markerView = markerViewsToRemoveById[id];
        delete this.markerViews[id];
        markerView.remove();
      }
      if (useDots) {
        markersByRows = {};
        _results = [];
        for (_j = 0, _len1 = sortedMarkers.length; _j < _len1; _j++) {
          markerView = sortedMarkers[_j];
          markerView.markersByRows = markersByRows;
          markerView.updateNeeded = true;
          markerView.clearPosition = true;
          _results.push(markerView.updateDisplay());
        }
        return _results;
      }
    };

    AtomColorHighlightView.prototype.rebuildMarkers = function() {
      var marker, markerView, markersByRows, _i, _len, _ref2, _results;
      if (!this.markers) {
        return;
      }
      markersByRows = {};
      _ref2 = this.markers;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        marker = _ref2[_i];
        if (this.markerViews[marker.id] != null) {
          this.markerViews[marker.id].remove();
        }
        if (atom.config.get('atom-color-highlight.markersAtEndOfLine')) {
          markerView = new DotMarkerView({
            editorView: this.editorView,
            marker: marker,
            markersByRows: markersByRows
          });
        } else {
          markerView = new MarkerView({
            editorView: this.editorView,
            marker: marker
          });
        }
        this.append(markerView.element);
        _results.push(this.markerViews[marker.id] = markerView);
      }
      return _results;
    };

    AtomColorHighlightView.prototype.destroyAllViews = function() {
      this.empty();
      return this.markerViews = {};
    };

    return AtomColorHighlightView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVIQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxPQUFZLE9BQUEsQ0FBUSxXQUFSLENBQVosRUFBQyxZQUFBLElBQUQsRUFBTyxTQUFBLENBRFAsQ0FBQTs7QUFBQSxFQUVDLGFBQWMsT0FBQSxDQUFRLFVBQVIsRUFBZCxVQUZELENBQUE7O0FBQUEsRUFHQSxRQUFvQyxPQUFBLENBQVEsV0FBUixDQUFwQyxFQUFDLDRCQUFBLG1CQUFELEVBQXNCLG1CQUFBLFVBSHRCLENBQUE7O0FBQUEsRUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGVBQVIsQ0FMYixDQUFBOztBQUFBLEVBTUEsYUFBQSxHQUFnQixPQUFBLENBQVEsbUJBQVIsQ0FOaEIsQ0FBQTs7QUFBQSxFQVFBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiw2Q0FBQSxDQUFBOztBQUFBLElBQUEsVUFBVSxDQUFDLFdBQVgsQ0FBdUIsc0JBQXZCLENBQUEsQ0FBQTs7QUFBQSxJQUVBLHNCQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxzQkFBUDtPQUFMLEVBRFE7SUFBQSxDQUZWLENBQUE7O0FBS2EsSUFBQSxnQ0FBQyxLQUFELEVBQVEsVUFBUixHQUFBO0FBQ1gsNkRBQUEsQ0FBQTtBQUFBLDZEQUFBLENBQUE7QUFBQSxpRUFBQSxDQUFBO0FBQUEsNkVBQUEsQ0FBQTtBQUFBLCtEQUFBLENBQUE7QUFBQSxNQUFBLHlEQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsVUFBRCxHQUFjLEVBRGQsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFB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
//# sourceURL=/Users/daniel/.atom/packages/atom-color-highlight/lib/atom-color-highlight-view.coffee