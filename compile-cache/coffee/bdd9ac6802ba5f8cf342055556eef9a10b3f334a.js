(function() {
  var ErrorView, EventEmitter2, GutterView, ReferenceView, StatusView, Watcher, locationDataToRange,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  EventEmitter2 = require('eventemitter2').EventEmitter2;

  ReferenceView = require('./background/ReferenceView');

  ErrorView = require('./background/ErrorView');

  GutterView = require('./gutter/GutterView');

  StatusView = require('./status/StatusView');

  locationDataToRange = require('./utils/LocationDataUtil').locationDataToRange;

  module.exports = Watcher = (function(_super) {
    __extends(Watcher, _super);

    function Watcher(moduleManager, editorView) {
      this.moduleManager = moduleManager;
      this.editorView = editorView;
      this.onCursorMoved = __bind(this.onCursorMoved, this);
      this.onContentsModified = __bind(this.onContentsModified, this);
      this.cancel = __bind(this.cancel, this);
      this.updateReferences = __bind(this.updateReferences, this);
      this.onParseEnd = __bind(this.onParseEnd, this);
      this.hideError = __bind(this.hideError, this);
      this.showError = __bind(this.showError, this);
      this.verifyGrammar = __bind(this.verifyGrammar, this);
      this.onDestroyed = __bind(this.onDestroyed, this);
      this.destruct = __bind(this.destruct, this);
      Watcher.__super__.constructor.call(this);
      this.editor = this.editorView.editor;
      this.editor.on('grammar-changed', this.verifyGrammar);
      this.moduleManager.on('changed', this.verifyGrammar);
      this.verifyGrammar();
    }

    Watcher.prototype.destruct = function() {
      this.removeAllListeners();
      this.deactivate();
      this.editor.off('grammar-changed', this.verifyGrammar);
      this.moduleManager.off('changed', this.verifyGrammar);
      delete this.moduleManager;
      delete this.editorView;
      delete this.editor;
      return delete this.module;
    };

    Watcher.prototype.onDestroyed = function() {
      return this.emit('destroyed', this);
    };


    /*
    Grammar checker
    1. Detect grammar changed.
    2. Destroy instances and listeners.
    3. Exit when grammar isn't CoffeeScript.
    4. Create instances and listeners.
     */

    Watcher.prototype.verifyGrammar = function() {
      var scopeName;
      this.deactivate();
      scopeName = this.editor.getGrammar().scopeName;
      this.module = this.moduleManager.getModule(scopeName);
      if (this.module == null) {
        return;
      }
      return this.activate();
    };

    Watcher.prototype.activate = function() {
      this.ripper = new this.module.Ripper(this.editor);
      this.referenceView = new ReferenceView;
      this.editorView.underlayer.append(this.referenceView);
      this.errorView = new ErrorView;
      this.editorView.underlayer.append(this.errorView);
      this.gutterView = new GutterView(this.editorView.gutter);
      this.statusView = new StatusView;
      this.editorView.on('cursor:moved', this.onCursorMoved);
      this.editor.on('destroyed', this.onDestroyed);
      this.editor.on('contents-modified', this.onContentsModified);
      return this.parse();
    };

    Watcher.prototype.deactivate = function() {
      var _ref, _ref1, _ref2, _ref3, _ref4;
      this.editorView.off('cursor:moved', this.onCursorMoved);
      this.editor.off('destroyed', this.onDestroyed);
      this.editor.off('contents-modified', this.onContentsModified);
      if ((_ref = this.ripper) != null) {
        _ref.destruct();
      }
      if ((_ref1 = this.referenceView) != null) {
        _ref1.destruct();
      }
      if ((_ref2 = this.errorView) != null) {
        _ref2.destruct();
      }
      if ((_ref3 = this.gutterView) != null) {
        _ref3.destruct();
      }
      if ((_ref4 = this.statusView) != null) {
        _ref4.destruct();
      }
      delete this.module;
      delete this.ripper;
      delete this.referenceView;
      delete this.errorView;
      delete this.gutterView;
      return delete this.statusView;
    };


    /*
    Reference finder process
    1. Stop listening cursor move event and reset views.
    2. Parse.
    3. Show errors and exit process when compile error is thrown.
    4. Show references.
    5. Start listening cursor move event.
     */

    Watcher.prototype.parse = function() {
      var text;
      this.editorView.off('cursor:moved', this.onCursorMoved);
      this.hideError();
      this.referenceView.update();
      text = this.editor.buffer.getText();
      if (text !== this.cachedText) {
        this.cachedText = text;
        return this.ripper.parse(text, (function(_this) {
          return function(err) {
            if (err != null) {
              _this.showError(err);
              return;
            }
            _this.hideError();
            return _this.onParseEnd();
          };
        })(this));
      } else {
        return this.onParseEnd();
      }
    };

    Watcher.prototype.showError = function(_arg) {
      var err, location, message, range;
      location = _arg.location, message = _arg.message;
      if (location == null) {
        return;
      }
      range = locationDataToRange(location);
      err = {
        range: range,
        message: message
      };
      this.errorView.update([this.rangeToRows(range)]);
      return this.gutterView.update([err]);
    };

    Watcher.prototype.hideError = function() {
      this.errorView.update();
      return this.gutterView.update();
    };

    Watcher.prototype.onParseEnd = function() {
      this.updateReferences();
      this.editorView.off('cursor:moved', this.onCursorMoved);
      return this.editorView.on('cursor:moved', this.onCursorMoved);
    };

    Watcher.prototype.updateReferences = function() {
      var cursor, range, ranges, rowsList;
      ranges = [];
      cursor = this.editor.cursors[0];
      if (cursor != null) {
        range = cursor.getCurrentWordBufferRange({
          includeNonWordCharacters: false
        });
        if (!range.isEmpty()) {
          ranges = this.ripper.find(range);
        }
      }
      rowsList = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = ranges.length; _i < _len; _i++) {
          range = ranges[_i];
          _results.push(this.rangeToRows(range));
        }
        return _results;
      }).call(this);
      return this.referenceView.update(rowsList);
    };


    /*
    Rename process
    1. Detect rename command.
    2. Cancel and exit process when cursor is moved out from the symbol.
    3. Detect done command.
     */

    Watcher.prototype.rename = function() {
      var cursor, range, refRange, refRanges, _i, _len;
      if (!this.isActive()) {
        return false;
      }
      cursor = this.editor.cursors[0];
      range = cursor.getCurrentWordBufferRange({
        includeNonWordCharacters: false
      });
      refRanges = this.ripper.find(range);
      if (refRanges.length === 0) {
        return false;
      }
      this.renameInfo = {
        cursor: cursor,
        range: range
      };
      for (_i = 0, _len = refRanges.length; _i < _len; _i++) {
        refRange = refRanges[_i];
        this.editor.addSelectionForBufferRange(refRange);
      }
      this.editorView.off('cursor:moved', this.cancel);
      this.editorView.on('cursor:moved', this.cancel);
      return true;
    };

    Watcher.prototype.cancel = function() {
      if ((this.renameInfo == null) || this.renameInfo.range.start.isEqual(this.renameInfo.cursor.getCurrentWordBufferRange({
        includeNonWordCharacters: false
      }).start)) {
        return;
      }
      this.editor.setCursorBufferPosition(this.renameInfo.cursor.getBufferPosition());
      this.editorView.off('cursor:moved', this.cancel);
      return delete this.renameInfo;
    };

    Watcher.prototype.done = function() {
      if (!this.isActive()) {
        return false;
      }
      if (this.renameInfo == null) {
        return false;
      }
      this.editor.setCursorBufferPosition(this.renameInfo.cursor.getBufferPosition());
      this.editorView.off('cursor:moved', this.cancel);
      delete this.renameInfo;
      return true;
    };


    /*
    User events
     */

    Watcher.prototype.onContentsModified = function() {
      return this.parse();
    };

    Watcher.prototype.onCursorMoved = function() {
      clearTimeout(this.timeoutId);
      return this.timeoutId = setTimeout(this.updateReferences, 0);
    };


    /*
    Utility
     */

    Watcher.prototype.isActive = function() {
      return (this.module != null) && atom.workspaceView.getActivePaneItem() === this.editor;
    };

    Watcher.prototype.rangeToRows = function(_arg) {
      var end, pixel, point, raw, rowRange, start, _i, _ref, _ref1, _results;
      start = _arg.start, end = _arg.end;
      _results = [];
      for (raw = _i = _ref = start.row, _ref1 = end.row; _i <= _ref1; raw = _i += 1) {
        rowRange = this.editor.buffer.rangeForRow(raw);
        point = {
          left: raw === start.row ? start : rowRange.start,
          right: raw === end.row ? end : rowRange.end
        };
        pixel = {
          tl: this.editorView.pixelPositionForBufferPosition(point.left),
          br: this.editorView.pixelPositionForBufferPosition(point.right)
        };
        pixel.br.top += this.editorView.lineHeight;
        _results.push(pixel);
      }
      return _results;
    };

    return Watcher;

  })(EventEmitter2);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZGQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUUsZ0JBQWtCLE9BQUEsQ0FBUSxlQUFSLEVBQWxCLGFBQUYsQ0FBQTs7QUFBQSxFQUNBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLDRCQUFSLENBRGhCLENBQUE7O0FBQUEsRUFFQSxTQUFBLEdBQVksT0FBQSxDQUFRLHdCQUFSLENBRlosQ0FBQTs7QUFBQSxFQUdBLFVBQUEsR0FBYSxPQUFBLENBQVEscUJBQVIsQ0FIYixDQUFBOztBQUFBLEVBSUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxxQkFBUixDQUpiLENBQUE7O0FBQUEsRUFLRSxzQkFBd0IsT0FBQSxDQUFRLDBCQUFSLEVBQXhCLG1CQUxGLENBQUE7O0FBQUEsRUFPQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBRUosOEJBQUEsQ0FBQTs7QUFBYSxJQUFBLGlCQUFFLGFBQUYsRUFBa0IsVUFBbEIsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLGdCQUFBLGFBQ2IsQ0FBQTtBQUFBLE1BRDRCLElBQUMsQ0FBQSxhQUFBLFVBQzdCLENBQUE7QUFBQSwyREFBQSxDQUFBO0FBQUEscUVBQUEsQ0FBQTtBQUFBLDZDQUFBLENBQUE7QUFBQSxpRUFBQSxDQUFBO0FBQUEscURBQUEsQ0FBQTtBQUFBLG1EQUFBLENBQUE7QUFBQSxtREFBQSxDQUFBO0FBQUEsMkRBQUEsQ0FBQTtBQUFBLHVEQUFBLENBQUE7QUFBQSxpREFBQSxDQUFBO0FBQUEsTUFBQSx1Q0FBQSxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUR0QixDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsTUFBTSxDQUFDLEVBQVIsQ0FBVyxpQkFBWCxFQUE4QixJQUFDLENBQUEsYUFBL0IsQ0FGQSxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsYUFBYSxDQUFDLEVBQWYsQ0FBa0IsU0FBbEIsRUFBNkIsSUFBQyxDQUFBLGFBQTlCLENBSEEsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUpBLENBRFc7SUFBQSxDQUFiOztBQUFBLHNCQU9BLFFBQUEsR0FBVSxTQUFBLEdBQUE7QUFDUixNQUFBLElBQUMsQ0FBQSxrQkFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFVBQUQsQ0FBQSxDQURBLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLGlCQUFaLEVBQStCLElBQUMsQ0FBQSxhQUFoQyxDQUZBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixTQUFuQixFQUE4QixJQUFDLENBQUEsYUFBL0IsQ0FIQSxDQUFBO0FBQUEsTUFLQSxNQUFBLENBQUEsSUFBUSxDQUFBLGFBTFIsQ0FBQTtBQUFBLE1BTUEsTUFBQSxDQUFBLElBQVEsQ0FBQSxVQU5SLENBQUE7QUFBQSxNQU9BLE1BQUEsQ0FBQSxJQUFRLENBQUEsTUFQUixDQUFBO2FBUUEsTUFBQSxDQUFBLElBQVEsQ0FBQSxPQVRBO0lBQUEsQ0FQVixDQUFBOztBQUFBLHNCQWtCQSxXQUFBLEdBQWEsU0FBQSxHQUFBO2FBQ1gsSUFBQyxDQUFBLElBQUQsQ0FBTSxXQUFOLEVBQW1CLElBQW5CLEVBRFc7SUFBQSxDQWxCYixDQUFBOztBQXNCQTtBQUFBOzs7Ozs7T0F0QkE7O0FBQUEsc0JBOEJBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFDYixVQUFBLFNBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxVQUFELENBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxTQUFBLEdBQVksSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQUEsQ0FBb0IsQ0FBQyxTQURqQyxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxhQUFhLENBQUMsU0FBZixDQUF5QixTQUF6QixDQUZWLENBQUE7QUFHQSxNQUFBLElBQWMsbUJBQWQ7QUFBQSxjQUFBLENBQUE7T0FIQTthQUlBLElBQUMsQ0FBQSxRQUFELENBQUEsRUFMYTtJQUFBLENBOUJmLENBQUE7O0FBQUEsc0JBcUNBLFFBQUEsR0FBVSxTQUFBLEdBQUE7QUFFUixNQUFBLElBQUMsQ0FBQSxNQUFELEdBQWMsSUFBQSxJQUFDLENBQUEsTUFBTSxDQUFDLE1BQVIsQ0FBZSxJQUFDLENBQUEsTUFBaEIsQ0FBZCxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsYUFIakIsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxVQUFVLENBQUMsTUFBdkIsQ0FBOEIsSUFBQyxDQUFBLGFBQS9CLENBSkEsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxHQUFBLENBQUEsU0FMYixDQUFBO0FBQUEsTUFNQSxJQUFDLENBQUEsVUFBVSxDQUFDLFVBQVUsQ0FBQyxNQUF2QixDQUE4QixJQUFDLENBQUEsU0FBL0IsQ0FOQSxDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsVUFBRCxHQUFrQixJQUFBLFVBQUEsQ0FBVyxJQUFDLENBQUEsVUFBVSxDQUFDLE1BQXZCLENBUGxCLENBQUE7QUFBQSxNQVFBLElBQUMsQ0FBQSxVQUFELEdBQWMsR0FBQSxDQUFBLFVBUmQsQ0FBQTtBQUFBLE1BV0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxFQUFaLENBQWUsY0FBZixFQUErQixJQUFDLENBQUEsYUFBaEMsQ0FYQSxDQUFBO0FBQUEsTUFZQSxJQUFDLENBQUEsTUFBTSxDQUFDLEVBQVIsQ0FBVyxXQUFYLEVBQXdCLElBQUMsQ0FBQSxXQUF6QixDQVpBLENBQUE7QUFBQSxNQWFBLElBQUMsQ0FBQSxNQUFNLENBQUMsRUFBUixDQUFXLG1CQUFYLEVBQWdDLElBQUMsQ0FBQSxrQkFBakMsQ0FiQSxDQUFBO2FBZ0JBLElBQUMsQ0FBQSxLQUFELENBQUEsRUFsQlE7SUFBQSxDQXJDVixDQUFBOztBQUFBLHNCQXlEQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBRVYsVUFBQSxnQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFaLENBQWdCLGNBQWhCLEVBQWdDLElBQUMsQ0FBQSxhQUFqQyxDQUFBLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxNQUFNLENBQUMsR0FBUixDQUFZLFdBQVosRUFBeUIsSUFBQyxDQUFBLFdBQTFCLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxHQUFSLENBQVksbUJBQVosRUFBaUMsSUFBQyxDQUFBLGtCQUFsQyxDQUZBLENBQUE7O1lBS08sQ0FBRSxRQUFULENBQUE7T0FMQTs7YUFNYyxDQUFFLFFBQWhCLENBQUE7T0FOQTs7YUFPVSxDQUFFLFFBQVosQ0FBQTtPQVBBOzthQVFXLENBQUUsUUFBYixDQUFBO09BUkE7O2FBU1csQ0FBRSxRQUFiLENBQUE7T0FUQTtBQUFBLE1BWUEsTUFBQSxDQUFBLElBQVEsQ0FBQSxNQVpSLENBQUE7QUFBQSxNQWFBLE1BQUEsQ0FBQSxJQUFRLENBQUEsTUFiUixDQUFBO0FBQUEsTUFjQSxNQUFBLENBQUEsSUFBUSxDQUFBLGFBZFIsQ0FBQTtBQUFBLE1BZUEsTUFBQSxDQUFBLElBQVEsQ0FBQSxTQWZSLENBQUE7QUFBQSxNQWdCQSxNQUFBLENBQUEsSUFBUSxDQUFBLFVBaEJSLENBQUE7YUFpQkEsTUFBQSxDQUFBLElBQVEsQ0FBQSxXQW5CRTtJQUFBLENBekRaLENBQUE7O0FBK0VBO0FBQUE7Ozs7Ozs7T0EvRUE7O0FBQUEsc0JBd0ZBLEtBQUEsR0FBTyxTQUFBLEdBQUE7QUFDTCxVQUFBLElBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxVQUFVLENBQUMsR0FBWixDQUFnQixjQUFoQixFQUFnQyxJQUFDLENBQUEsYUFBakMsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsU0FBRCxDQUFBLENBREEsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxNQUFmLENBQUEsQ0FGQSxDQUFBO0FBQUEsTUFJQSxJQUFBLEdBQU8sSUFBQyxDQUFBLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBZixDQUFBLENBSlAsQ0FBQTtBQUtBLE1BQUEsSUFBRyxJQUFBLEtBQVUsSUFBQyxDQUFBLFVBQWQ7QUFDRSxRQUFBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBZCxDQUFBO2VBQ0EsSUFBQyxDQUFBLE1BQU0sQ0FBQyxLQUFSLENBQWMsSUFBZCxFQUFvQixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUMsR0FBRCxHQUFBO0FBQ2xCLFlBQUEsSUFBRyxXQUFIO0FBQ0UsY0FBQSxLQUFDLENBQUEsU0FBRCxDQUFXLEdBQVgsQ0FBQSxDQUFBO0FBQ0Esb0JBQUEsQ0FGRjthQUFBO0FBQUEsWUFHQSxLQUFDLENBQUEsU0FBRCxDQUFBLENBSEEsQ0FBQTttQkFJQSxLQUFDLENBQUEsVUFBRCxDQUFBLEVBTGtCO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBcEIsRUFGRjtPQUFBLE1BQUE7ZUFTRSxJQUFDLENBQUEsVUFBRCxDQUFBLEVBVEY7T0FOSztJQUFBLENBeEZQLENBQUE7O0FBQUEsc0JBeUdBLFNBQUEsR0FBVyxTQUFDLElBQUQsR0FBQTtBQUNULFVBQUEsNkJBQUE7QUFBQSxNQURZLGdCQUFBLFVBQVUsZUFBQSxPQUN0QixDQUFBO0FBQUEsTUFBQSxJQUFjLGdCQUFkO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFBQSxNQUNBLEtBQUEsR0FBUSxtQkFBQSxDQUFvQixRQUFwQixDQURSLENBQUE7QUFBQSxNQUVBLEdBQUEsR0FDRTtBQUFBLFFBQUEsS0FBQSxFQUFTLEtBQVQ7QUFBQSxRQUNBLE9BQUEsRUFBUyxPQURUO09BSEYsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQWtCLENBQUUsSUFBQyxDQUFBLFdBQUQsQ0FBYSxLQUFiLENBQUYsQ0FBbEIsQ0FMQSxDQUFBO2FBTUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQW1CLENBQUUsR0FBRixDQUFuQixFQVBTO0lBQUEsQ0F6R1gsQ0FBQTs7QUFBQSxzQkFrSEEsU0FBQSxHQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsSUFBQyxDQUFBLFNBQVMsQ0FBQyxNQUFYLENBQUEsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFaLENBQUEsRUFGUztJQUFBLENBbEhYLENBQUE7O0FBQUEsc0JBc0hBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxnQkFBRCxDQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFaLENBQWdCLGNBQWhCLEVBQWdDLElBQUMsQ0FBQSxhQUFqQyxDQURBLENBQUE7YUFFQSxJQUFDLENBQUEsVUFBVSxDQUFDLEVBQVosQ0FBZSxjQUFmLEVBQStCLElBQUMsQ0FBQSxhQUFoQyxFQUhVO0lBQUEsQ0F0SFosQ0FBQTs7QUFBQSxzQkEySEEsZ0JBQUEsR0FBa0IsU0FBQSxHQUFBO0FBQ2hCLFVBQUEsK0JBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxFQUFULENBQUE7QUFBQSxNQUNBLE1BQUEsR0FBUyxJQUFDLENBQUEsTUFBTSxDQUFDLE9BQVEsQ0FBQSxDQUFBLENBRHpCLENBQUE7QUFFQSxNQUFBLElBQUcsY0FBSDtBQUNFLFFBQUEsS0FBQSxHQUFRLE1BQU0sQ0FBQyx5QkFBUCxDQUFpQztBQUFBLFVBQUEsd0JBQUEsRUFBMEIsS0FBMUI7U0FBakMsQ0FBUixDQUFBO0FBQ0EsUUFBQSxJQUFBLENBQUEsS0FBWSxDQUFDLE9BQU4sQ0FBQSxDQUFQO0FBQ0UsVUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxJQUFSLENBQWEsS0FBYixDQUFULENBREY7U0FGRjtPQUZBO0FBQUEsTUFNQSxRQUFBOztBQUFXO2FBQUEsNkNBQUE7NkJBQUE7QUFDVCx3QkFBQSxJQUFDLENBQUEsV0FBRCxDQUFhLEtBQWIsRUFBQSxDQURTO0FBQUE7O21CQU5YLENBQUE7YUFRQSxJQUFDLENBQUEsYUFBYSxDQUFDLE1BQWYsQ0FBc0IsUUFBdEIsRUFUZ0I7SUFBQSxDQTNIbEIsQ0FBQTs7QUF1SUE7QUFBQTs7Ozs7T0F2SUE7O0FBQUEsc0JBOElBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixVQUFBLDRDQUFBO0FBQUEsTUFBQSxJQUFBLENBQUEsSUFBcUIsQ0FBQSxRQUFELENBQUEsQ0FBcEI7QUFBQSxlQUFPLEtBQVAsQ0FBQTtPQUFBO0FBQUEsTUFFQSxNQUFBLEdBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFRLENBQUEsQ0FBQSxDQUZ6QixDQUFBO0FBQUEsTUFHQSxLQUFBLEdBQVEsTUFBTSxDQUFDLHlCQUFQLENBQWlDO0FBQUEsUUFBQSx3QkFBQSxFQUEwQixLQUExQjtPQUFqQyxDQUhSLENBQUE7QUFBQSxNQUlBLFNBQUEsR0FBWSxJQUFDLENBQUEsTUFBTSxDQUFDLElBQVIsQ0FBYSxLQUFiLENBSlosQ0FBQTtBQUtBLE1BQUEsSUFBZ0IsU0FBUyxDQUFDLE1BQVYsS0FBb0IsQ0FBcEM7QUFBQSxlQUFPLEtBQVAsQ0FBQTtPQUxBO0FBQUEsTUFVQSxJQUFDLENBQUEsVUFBRCxHQUNFO0FBQUEsUUFBQSxNQUFBLEVBQVEsTUFBUjtBQUFBLFFBQ0EsS0FBQSxFQUFRLEtBRFI7T0FYRixDQUFBO0FBYUEsV0FBQSxnREFBQTtpQ0FBQTtBQUNFLFFBQUEsSUFBQyxDQUFBLE1BQU0sQ0FBQywwQkFBUixDQUFtQyxRQUFuQyxDQUFBLENBREY7QUFBQSxPQWJBO0FBQUEsTUFlQSxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQVosQ0FBZ0IsY0FBaEIsRUFBZ0MsSUFBQyxDQUFBLE1BQWpDLENBZkEsQ0FBQTtBQUFBLE1BZ0JBLElBQUMsQ0FBQSxVQUFVLENBQUMsRUFBWixDQUFlLGNBQWYsRUFBK0IsSUFBQyxDQUFBLE1BQWhDLENBaEJBLENBQUE7YUFpQkEsS0FsQk07SUFBQSxDQTlJUixDQUFBOztBQUFBLHNCQWtLQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sTUFBQSxJQUFjLHlCQUFKLElBQ0ksSUFBQyxDQUFBLFVBQVUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQXhCLENBQWdDLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBTSxDQUFDLHlCQUFuQixDQUE2QztBQUFBLFFBQUEsd0JBQUEsRUFBMEIsS0FBMUI7T0FBN0MsQ0FBNkUsQ0FBQyxLQUE5RyxDQURkO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFBQSxNQU1BLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBZ0MsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFNLENBQUMsaUJBQW5CLENBQUEsQ0FBaEMsQ0FOQSxDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQVosQ0FBZ0IsY0FBaEIsRUFBZ0MsSUFBQyxDQUFBLE1BQWpDLENBUEEsQ0FBQTthQVFBLE1BQUEsQ0FBQSxJQUFRLENBQUEsV0FURjtJQUFBLENBbEtSLENBQUE7O0FBQUEsc0JBNktBLElBQUEsR0FBTSxTQUFBLEdBQUE7QUFDSixNQUFBLElBQUEsQ0FBQSxJQUFxQixDQUFBLFFBQUQsQ0FBQSxDQUFwQjtBQUFBLGVBQU8sS0FBUCxDQUFBO09BQUE7QUFDQSxNQUFBLElBQW9CLHVCQUFwQjtBQUFBLGVBQU8sS0FBUCxDQUFBO09BREE7QUFBQSxNQU1BLElBQUMsQ0FBQSxNQUFNLENBQUMsdUJBQVIsQ0FBZ0MsSUFBQyxDQUFBLFVBQVUsQ0FBQyxNQUFNLENBQUMsaUJBQW5CLENBQUEsQ0FBaEMsQ0FOQSxDQUFBO0FBQUEsTUFPQSxJQUFDLENBQUEsVUFBVSxDQUFDLEdBQVosQ0FBZ0IsY0FBaEIsRUFBZ0MsSUFBQyxDQUFBLE1BQWpDLENBUEEsQ0FBQTtBQUFBLE1BUUEsTUFBQSxDQUFBLElBQVEsQ0FBQSxVQVJSLENBQUE7YUFTQSxLQVZJO0lBQUEsQ0E3S04sQ0FBQTs7QUEwTEE7QUFBQTs7T0ExTEE7O0FBQUEsc0JBOExBLGtCQUFBLEdBQW9CLFNBQUEsR0FBQTthQUNsQixJQUFDLENBQUEsS0FBRCxDQUFBLEVBRGtCO0lBQUEsQ0E5THBCLENBQUE7O0FBQUEsc0JBaU1BLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFDYixNQUFBLFlBQUEsQ0FBYSxJQUFDLENBQUEsU0FBZCxDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsU0FBRCxHQUFhLFVBQUEsQ0FBVyxJQUFDLENBQUEsZ0JBQVosRUFBOEIsQ0FBOUIsRUFGQTtJQUFBLENBak1mLENBQUE7O0FBc01BO0FBQUE7O09BdE1BOztBQUFBLHNCQTBNQSxRQUFBLEdBQVUsU0FBQSxHQUFBO2FBQ1IscUJBQUEsSUFBYSxJQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFuQixDQUFBLENBQUEsS0FBMEMsSUFBQyxDQUFBLE9BRGhEO0lBQUEsQ0ExTVYsQ0FBQTs7QUFBQSxzQkE4TUEsV0FBQSxHQUFhLFNBQUMsSUFBRCxHQUFBO0FBQ1gsVUFBQSxrRUFBQTtBQUFBLE1BRGMsYUFBQSxPQUFPLFdBQUEsR0FDckIsQ0FBQTtBQUFBO1dBQVcsd0VBQVgsR0FBQTtBQUNFLFFBQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBTSxDQUFDLFdBQWYsQ0FBMkIsR0FBM0IsQ0FBWCxDQUFBO0FBQUEsUUFDQSxLQUFBLEdBQ0U7QUFBQSxVQUFBLElBQUEsRUFBVSxHQUFBLEtBQU8sS0FBSyxDQUFDLEdBQWhCLEdBQXlCLEtBQXpCLEdBQW9DLFFBQVEsQ0FBQyxLQUFwRDtBQUFBLFVBQ0EsS0FBQSxFQUFVLEdBQUEsS0FBTyxHQUFHLENBQUMsR0FBZCxHQUF1QixHQUF2QixHQUFnQyxRQUFRLENBQUMsR0FEaEQ7U0FGRixDQUFBO0FBQUEsUUFJQSxLQUFBLEdBQ0U7QUFBQSxVQUFBLEVBQUEsRUFBSSxJQUFDLENBQUEsVUFBVSxDQUFDLDhCQUFaLENBQTJDLEtBQUssQ0FBQyxJQUFqRCxDQUFKO0FBQUEsVUFDQSxFQUFBLEVBQUksSUFBQyxDQUFBLFVBQVUsQ0FBQyw4QkFBWixDQUEyQyxLQUFLLENBQUMsS0FBakQsQ0FESjtTQUxGLENBQUE7QUFBQSxRQU9BLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBVCxJQUFnQixJQUFDLENBQUEsVUFBVSxDQUFDLFVBUDVCLENBQUE7QUFBQSxzQkFRQSxNQVJBLENBREY7QUFBQTtzQkFEVztJQUFBLENBOU1iLENBQUE7O21CQUFBOztLQUZvQixjQVJ0QixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/refactor/lib/Watcher.coffee