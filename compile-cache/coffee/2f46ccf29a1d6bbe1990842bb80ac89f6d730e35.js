(function() {
  var Q, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  Q = require('q');

  module.exports = function() {
    var MinimapColorHighlighView, colorHighlight, colorHighlightPackage, minimap, minimapPackage;
    colorHighlightPackage = atom.packages.getLoadedPackage('atom-color-highlight');
    minimapPackage = atom.packages.getLoadedPackage('minimap');
    minimap = require(minimapPackage.path);
    colorHighlight = require(colorHighlightPackage.path);
    return MinimapColorHighlighView = (function() {
      function MinimapColorHighlighView(model, editorView) {
        this.model = model;
        this.editorView = editorView;
        this.rebuildDecorations = __bind(this.rebuildDecorations, this);
        this.markersUpdated = __bind(this.markersUpdated, this);
        this.decorationsByMarkerId = {};
        this.editor = this.editorView.editor;
        this.model = colorHighlight.modelForEditorView(this.editorView);
        this.subscription = this.model.on('updated', this.markersUpdated);
        if (this.model != null) {
          this.markersUpdated(this.model.markers);
        }
      }

      MinimapColorHighlighView.prototype.destroy = function() {
        var _ref;
        this.subscription.off();
        this.destroyDecorations();
        return (_ref = this.minimapView) != null ? _ref.find('.atom-color-highlight').remove() : void 0;
      };

      MinimapColorHighlighView.prototype.observeConfig = function() {
        atom.config.observe('atom-color-highlight.hideMarkersInComments', this.rebuildDecorations);
        atom.config.observe('atom-color-highlight.hideMarkersInStrings', this.rebuildDecorations);
        atom.config.observe('atom-color-highlight.markersAtEndOfLine', this.rebuildDecorations);
        atom.config.observe('atom-color-highlight.dotMarkersSize', this.rebuildDecorations);
        return atom.config.observe('atom-color-highlight.dotMarkersSpading', this.rebuildDecorations);
      };

      MinimapColorHighlighView.prototype.destroyDecorations = function() {
        var decoration, id, _ref, _results;
        _ref = this.decorationsByMarkerId;
        _results = [];
        for (id in _ref) {
          decoration = _ref[id];
          _results.push(decoration.destroy());
        }
        return _results;
      };

      MinimapColorHighlighView.prototype.getMinimap = function() {
        var defer, minimapView, poll, _ref;
        defer = Q.defer();
        if ((_ref = this.editorView) != null ? _ref.hasClass('editor') : void 0) {
          minimapView = minimap.minimapForEditorView(this.editorView);
          if (minimapView != null) {
            defer.resolve(minimapView);
          } else {
            poll = (function(_this) {
              return function() {
                minimapView = minimap.minimapForEditorView(_this.editorView);
                if (minimapView != null) {
                  return defer.resolve(minimapView);
                } else {
                  return setTimeout(poll, 10);
                }
              };
            })(this);
            setTimeout(poll, 10);
          }
        } else {
          defer.reject("" + this.editorView + " is not a legal editor");
        }
        return defer.promise;
      };

      MinimapColorHighlighView.prototype.updateSelections = function() {};

      MinimapColorHighlighView.prototype.markersUpdated = function(markers) {
        return this.getMinimap().then((function(_this) {
          return function(minimap) {
            var decoration, decorationsToRemove, id, marker, _i, _len, _results;
            decorationsToRemove = _.clone(_this.decorationsByMarkerId);
            for (_i = 0, _len = markers.length; _i < _len; _i++) {
              marker = markers[_i];
              if (_this.markerHidden(marker)) {
                continue;
              }
              if (_this.decorationsByMarkerId[marker.id] != null) {
                delete decorationsToRemove[marker.id];
              } else {
                decoration = minimap.decorateMarker(marker, {
                  type: 'highlight',
                  color: marker.bufferMarker.properties.cssColor
                });
                _this.decorationsByMarkerId[marker.id] = decoration;
              }
            }
            _this.markers = markers;
            _results = [];
            for (id in decorationsToRemove) {
              decoration = decorationsToRemove[id];
              decoration.destroy();
              _results.push(delete _this.decorationsByMarkerId[id]);
            }
            return _results;
          };
        })(this)).fail(function(reason) {
          return console.log(reason.stack);
        });
      };

      MinimapColorHighlighView.prototype.rebuildDecorations = function() {
        this.destroyDecorations();
        return this.markersUpdated(this.markers);
      };

      MinimapColorHighlighView.prototype.markerHidden = function(marker) {
        return this.markerHiddenDueToComment(marker) || this.markerHiddenDueToString(marker);
      };

      MinimapColorHighlighView.prototype.getScope = function(bufferRange) {
        var descriptor;
        if (this.editor.displayBuffer.scopesForBufferPosition != null) {
          return this.editor.displayBuffer.scopesForBufferPosition(bufferRange.start).join(';');
        } else {
          descriptor = this.editor.displayBuffer.scopeDescriptorForBufferPosition(bufferRange.start);
          if (descriptor.join != null) {
            return descriptor.join(';');
          } else {
            return descriptor.scopes.join(';');
          }
        }
      };

      MinimapColorHighlighView.prototype.markerHiddenDueToComment = function(marker) {
        var bufferRange, scope;
        bufferRange = marker.getBufferRange();
        scope = this.getScope(bufferRange);
        return atom.config.get('atom-color-highlight.hideMarkersInComments') && (scope.match(/comment/) != null);
      };

      MinimapColorHighlighView.prototype.markerHiddenDueToString = function(marker) {
        var bufferRange, scope;
        bufferRange = marker.getBufferRange();
        scope = this.getScope(bufferRange);
        return atom.config.get('atom-color-highlight.hideMarkersInStrings') && (scope.match(/string/) != null);
      };

      return MinimapColorHighlighView;

    })();
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLElBQUE7SUFBQSxrRkFBQTs7QUFBQSxFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxHQUFSLENBREosQ0FBQTs7QUFBQSxFQVFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUEsR0FBQTtBQUNmLFFBQUEsd0ZBQUE7QUFBQSxJQUFBLHFCQUFBLEdBQXdCLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0Isc0JBQS9CLENBQXhCLENBQUE7QUFBQSxJQUNBLGNBQUEsR0FBaUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixTQUEvQixDQURqQixDQUFBO0FBQUEsSUFHQSxPQUFBLEdBQVUsT0FBQSxDQUFTLGNBQWMsQ0FBQyxJQUF4QixDQUhWLENBQUE7QUFBQSxJQUlBLGNBQUEsR0FBaUIsT0FBQSxDQUFTLHFCQUFxQixDQUFDLElBQS9CLENBSmpCLENBQUE7V0FNTTtBQUVTLE1BQUEsa0NBQUUsS0FBRixFQUFVLFVBQVYsR0FBQTtBQUNYLFFBRFksSUFBQyxDQUFBLFFBQUEsS0FDYixDQUFBO0FBQUEsUUFEb0IsSUFBQyxDQUFBLGFBQUEsVUFDckIsQ0FBQTtBQUFBLHVFQUFBLENBQUE7QUFBQSwrREFBQSxDQUFBO0FBQUEsUUFBQSxJQUFDLENBQUEscUJBQUQsR0FBeUIsRUFBekIsQ0FBQTtBQUFBLFFBRUMsSUFBQyxDQUFBLFNBQVUsSUFBQyxDQUFBLFdBQVgsTUFGRixDQUFBO0FBQUEsUUFHQSxJQUFDLENBQUEsS0FBRCxHQUFTLGNBQWMsQ0FBQyxrQkFBZixDQUFrQyxJQUFDLENBQUEsVUFBbkMsQ0FIVCxDQUFBO0FBQUEsUUFLQSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQUFD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
//# sourceURL=/Users/daniel/.atom/packages/minimap-color-highlight/lib/minimap-color-highlight-view.coffee