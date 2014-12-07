(function() {
  var AtomColorHighlightModel, Color, CompositeDisposable, Emitter, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore-plus');

  Emitter = require('emissary').Emitter;

  CompositeDisposable = require('event-kit').CompositeDisposable;

  Color = require('pigments');

  module.exports = AtomColorHighlightModel = (function() {
    Emitter.includeInto(AtomColorHighlightModel);

    AtomColorHighlightModel.Color = Color;

    AtomColorHighlightModel.markerClass = 'color-highlight';

    AtomColorHighlightModel.bufferRange = [[0, 0], [Infinity, Infinity]];

    function AtomColorHighlightModel(editor, buffer) {
      this.editor = editor;
      this.buffer = buffer;
      this.update = __bind(this.update, this);
      this.subscriptions = new CompositeDisposable;
      try {
        atom.packages.activatePackage('project-palette-finder').then((function(_this) {
          return function(pack) {
            var finder;
            finder = pack.mainModule;
            if (finder != null) {
              _this.constructor.Color = Color = finder.Color;
            }
            return _this.subscriptions.add(finder.onDidUpdatePalette(_this.update));
          };
        })(this));
      } catch (_error) {}
      this.constructor.Color = Color;
    }

    AtomColorHighlightModel.prototype.update = function() {
      if (this.frameRequested) {
        return;
      }
      this.frameRequested = true;
      return requestAnimationFrame((function(_this) {
        return function() {
          _this.frameRequested = false;
          return _this.updateMarkers();
        };
      })(this));
    };

    AtomColorHighlightModel.prototype.subscribeToBuffer = function() {
      return this.subscriptions.add(this.buffer.onDidStopChanging(this.update));
    };

    AtomColorHighlightModel.prototype.unsubscribeFromBuffer = function() {
      this.subscriptions.dispose();
      return this.buffer = null;
    };

    AtomColorHighlightModel.prototype.init = function() {
      if (this.buffer != null) {
        this.subscribeToBuffer();
        this.destroyAllMarkers();
        return this.update();
      }
    };

    AtomColorHighlightModel.prototype.dispose = function() {
      if (this.buffer != null) {
        return this.unsubscribeFromBuffer();
      }
    };

    AtomColorHighlightModel.prototype.eachColor = function(block) {
      if (this.buffer != null) {
        return Color.scanBufferForColors(this.buffer, block);
      }
    };

    AtomColorHighlightModel.prototype.updateMarkers = function() {
      var e, marker, markersToRemoveById, promise, updatedMarkers, _i, _len, _ref;
      if (this.buffer == null) {
        return this.destroyAllMarkers();
      }
      if (this.updating) {
        return;
      }
      this.updating = true;
      updatedMarkers = [];
      markersToRemoveById = {};
      _ref = this.markers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        marker = _ref[_i];
        markersToRemoveById[marker.id] = marker;
      }
      try {
        promise = this.eachColor();
        return promise.then((function(_this) {
          return function(results) {
            var color, id, match, range, res, _j, _len1;
            _this.updating = false;
            if (results == null) {
              results = [];
            }
            for (_j = 0, _len1 = results.length; _j < _len1; _j++) {
              res = results[_j];
              range = res.bufferRange, match = res.match, color = res.color;
              if (color.isInvalid) {
                continue;
              }
              if (marker = _this.findMarker(match, range)) {
                if (marker.bufferMarker.properties.cssColor !== color.toCSS()) {
                  marker = _this.createMarker(match, color, range);
                } else {
                  delete markersToRemoveById[marker.id];
                }
              } else {
                marker = _this.createMarker(match, color, range);
              }
              updatedMarkers.push(marker);
            }
            for (id in markersToRemoveById) {
              marker = markersToRemoveById[id];
              marker.destroy();
            }
            _this.markers = updatedMarkers;
            return _this.emit('updated', _.clone(_this.markers));
          };
        })(this)).fail(function(e) {
          return console.log(e);
        });
      } catch (_error) {
        e = _error;
        this.destroyAllMarkers();
        throw e;
      }
    };

    AtomColorHighlightModel.prototype.findMarker = function(color, range) {
      var attributes;
      attributes = {
        type: this.constructor.markerClass,
        color: color,
        startPosition: range.start,
        endPosition: range.end
      };
      return _.find(this.editor.findMarkers(attributes), function(marker) {
        return marker.isValid();
      });
    };

    AtomColorHighlightModel.prototype.destroyAllMarkers = function() {
      var marker, _i, _len, _ref, _ref1;
      _ref1 = (_ref = this.markers) != null ? _ref : [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        marker = _ref1[_i];
        marker.destroy();
      }
      this.markers = [];
      return this.emit('updated', _.clone(this.markers));
    };

    AtomColorHighlightModel.prototype.createMarker = function(color, colorObject, range) {
      var l, markerAttributes, textColor;
      l = colorObject.luma();
      textColor = l > 0.43 ? 'black' : 'white';
      markerAttributes = {
        type: this.constructor.markerClass,
        color: color,
        cssColor: colorObject.toCSS(),
        textColor: textColor,
        invalidate: 'touch',
        persistent: false
      };
      return this.editor.markBufferRange(range, markerAttributes);
    };

    return AtomColorHighlightModel;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtEQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSLENBQUosQ0FBQTs7QUFBQSxFQUNDLFVBQVcsT0FBQSxDQUFRLFVBQVIsRUFBWCxPQURELENBQUE7O0FBQUEsRUFFQyxzQkFBdUIsT0FBQSxDQUFRLFdBQVIsRUFBdkIsbUJBRkQsQ0FBQTs7QUFBQSxFQUdBLEtBQUEsR0FBUSxPQUFBLENBQVEsVUFBUixDQUhSLENBQUE7O0FBQUEsRUFLQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osSUFBQSxPQUFPLENBQUMsV0FBUixDQUFvQix1QkFBcEIsQ0FBQSxDQUFBOztBQUFBLElBRUEsdUJBQUMsQ0FBQSxLQUFELEdBQVEsS0FGUixDQUFBOztBQUFBLElBSUEsdUJBQUMsQ0FBQSxXQUFELEdBQWMsaUJBSmQsQ0FBQTs7QUFBQSxJQUtBLHVCQUFDLENBQUEsV0FBRCxHQUFjLENBQUMsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFELEVBQVEsQ0FBQyxRQUFELEVBQVUsUUFBVixDQUFSLENBTGQsQ0FBQTs7QUFPYSxJQUFBLGlDQUFFLE1BQUYsRUFBVyxNQUFYLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxTQUFBLE1BQ2IsQ0FBQTtBQUFBLE1BRHFCLElBQUMsQ0FBQSxTQUFBLE1BQ3RCLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBQWpCLENBQUE7QUFDQTtBQUFJLFFBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLHdCQUE5QixDQUF1RCxDQUFDLElBQXhELENBQTZELENBQUEsU0FBQSxLQUFBLEdBQUE7aUJBQUEsU0FBQyxJQUFELEdBQUE7QUFDL0QsZ0JB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
//# sourceURL=/Users/daniel/.atom/packages/atom-color-highlight/lib/atom-color-highlight-model.coffee