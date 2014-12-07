(function() {
  var CompositeDisposable, MarkerMixin, Mixin,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Mixin = require('mixto');

  CompositeDisposable = require('event-kit').CompositeDisposable;

  module.exports = MarkerMixin = (function(_super) {
    __extends(MarkerMixin, _super);

    function MarkerMixin() {
      return MarkerMixin.__super__.constructor.apply(this, arguments);
    }

    MarkerMixin.prototype.addClass = function(cls) {
      return this.element.classList.add(cls);
    };

    MarkerMixin.prototype.removeClass = function(cls) {
      return this.element.classList.remove(cls);
    };

    MarkerMixin.prototype.remove = function() {
      this.unsubscribe();
      this.subscriptions.dispose();
      this.marker = null;
      this.editorView = null;
      this.editor = null;
      return this.element.remove();
    };

    MarkerMixin.prototype.show = function() {
      if (!this.hidden()) {
        return this.element.style.display = "";
      }
    };

    MarkerMixin.prototype.hide = function() {
      return this.element.style.display = "none";
    };

    MarkerMixin.prototype.subscribeToMarker = function() {
      if (this.subscriptions == null) {
        this.subscriptions = new CompositeDisposable;
      }
      this.subscriptions.add(this.marker.onDidChange((function(_this) {
        return function(e) {
          return _this.onMarkerChanged(e);
        };
      })(this)));
      this.subscriptions.add(this.marker.onDidDestroy((function(_this) {
        return function(e) {
          return _this.remove(e);
        };
      })(this)));
      return this.subscribe(this.editorView, 'editor:display-updated', (function(_this) {
        return function(e) {
          return _this.updateDisplay(e);
        };
      })(this));
    };

    MarkerMixin.prototype.onMarkerChanged = function(_arg) {
      var isValid;
      isValid = _arg.isValid;
      this.updateNeeded = isValid;
      if (isValid) {
        return this.show();
      } else {
        return this.hide();
      }
    };

    MarkerMixin.prototype.isUpdateNeeded = function() {
      var newScreenRange, oldScreenRange;
      if (!(this.updateNeeded && this.editor === this.editorView.editor)) {
        return false;
      }
      oldScreenRange = this.oldScreenRange;
      newScreenRange = this.getScreenRange();
      this.oldScreenRange = newScreenRange;
      return this.intersectsRenderedScreenRows(oldScreenRange) || this.intersectsRenderedScreenRows(newScreenRange);
    };

    MarkerMixin.prototype.intersectsRenderedScreenRows = function(range) {
      return range.intersectsRowRange(this.editorView.firstRenderedScreenRow, this.editorView.lastRenderedScreenRow);
    };

    MarkerMixin.prototype.hidden = function() {
      return this.hiddenDueToComment() || this.hiddenDueToString();
    };

    MarkerMixin.prototype.getScope = function(bufferRange) {
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

    MarkerMixin.prototype.hiddenDueToComment = function() {
      var bufferRange, scope;
      bufferRange = this.getBufferRange();
      scope = this.getScope(bufferRange);
      return atom.config.get('atom-color-highlight.hideMarkersInComments') && (scope.match(/comment/) != null);
    };

    MarkerMixin.prototype.hiddenDueToString = function() {
      var bufferRange, scope;
      bufferRange = this.getBufferRange();
      scope = this.getScope(bufferRange);
      return atom.config.get('atom-color-highlight.hideMarkersInStrings') && (scope.match(/string/) != null);
    };

    MarkerMixin.prototype.getColor = function() {
      return this.marker.bufferMarker.properties.cssColor;
    };

    MarkerMixin.prototype.getColorText = function() {
      return this.marker.bufferMarker.properties.color;
    };

    MarkerMixin.prototype.getColorTextColor = function() {
      return this.marker.bufferMarker.properties.textColor;
    };

    MarkerMixin.prototype.getScreenRange = function() {
      return this.marker.getScreenRange();
    };

    MarkerMixin.prototype.getBufferRange = function() {
      return this.marker.getBufferRange();
    };

    return MarkerMixin;

  })(Mixin);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHVDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVIsQ0FBUixDQUFBOztBQUFBLEVBQ0Msc0JBQXVCLE9BQUEsQ0FBUSxXQUFSLEVBQXZCLG1CQURELENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osa0NBQUEsQ0FBQTs7OztLQUFBOztBQUFBLDBCQUFBLFFBQUEsR0FBVSxTQUFDLEdBQUQsR0FBQTthQUFTLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQW5CLENBQXVCLEdBQXZCLEVBQVQ7SUFBQSxDQUFWLENBQUE7O0FBQUEsMEJBQ0EsV0FBQSxHQUFhLFNBQUMsR0FBRCxHQUFBO2FBQVMsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBbkIsQ0FBMEIsR0FBMUIsRUFBVDtJQUFBLENBRGIsQ0FBQTs7QUFBQSwwQkFHQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sTUFBQSxJQUFDLENBQUEsV0FBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUEsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBRlYsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUhkLENBQUE7QUFBQSxNQUlBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFKVixDQUFBO2FBS0EsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQUEsRUFOTTtJQUFBLENBSFIsQ0FBQTs7QUFBQSwwQkFXQSxJQUFBLEdBQU0sU0FBQSxHQUFBO0FBQ0osTUFBQSxJQUFBLENBQUEsSUFBb0MsQ0FBQSxNQUFELENBQUEsQ0FBbkM7ZUFBQSxJQUFDLENB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
//# sourceURL=/Users/daniel/.atom/packages/atom-color-highlight/lib/marker-mixin.coffee