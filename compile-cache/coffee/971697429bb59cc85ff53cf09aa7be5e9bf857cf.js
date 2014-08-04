(function() {
  var $, Debug, EditorView, Emitter, MinimapEditorView, ScrollView, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('atom'), EditorView = _ref.EditorView, ScrollView = _ref.ScrollView, $ = _ref.$;

  Emitter = require('emissary').Emitter;

  Debug = require('prolix');

  module.exports = MinimapEditorView = (function(_super) {
    __extends(MinimapEditorView, _super);

    Emitter.includeInto(MinimapEditorView);

    Debug('minimap').includeInto(MinimapEditorView);

    MinimapEditorView.content = function() {
      return this.div({
        "class": 'minimap-editor editor editor-colors'
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'scroll-view',
            outlet: 'scrollView'
          }, function() {
            return _this.div({
              "class": 'lines',
              outlet: 'lines'
            });
          });
        };
      })(this));
    };

    MinimapEditorView.prototype.frameRequested = false;

    function MinimapEditorView() {
      this.update = __bind(this.update, this);
      this.registerBufferChanges = __bind(this.registerBufferChanges, this);
      MinimapEditorView.__super__.constructor.apply(this, arguments);
      this.pendingChanges = [];
      this.lineClasses = {};
    }

    MinimapEditorView.prototype.initialize = function() {
      this.lineOverdraw = atom.config.get('minimap.lineOverdraw');
      atom.config.observe('minimap.lineOverdraw', (function(_this) {
        return function() {
          return _this.lineOverdraw = atom.config.get('minimap.lineOverdraw');
        };
      })(this));
      this.lines.css('line-height', atom.config.get('editor.lineHeight') + 'em');
      return atom.config.observe('editor.lineHeight', (function(_this) {
        return function() {
          return _this.lines.css('line-height', atom.config.get('editor.lineHeight') + 'em');
        };
      })(this));
    };

    MinimapEditorView.prototype.destroy = function() {
      this.unsubscribe();
      return this.editorView = null;
    };

    MinimapEditorView.prototype.setEditorView = function(editorView) {
      this.editorView = editorView;
      this.editor = this.editorView.getModel();
      this.buffer = this.editorView.getEditor().buffer;
      return this.subscribe(this.editor, 'screen-lines-changed.minimap', (function(_this) {
        return function(changes) {
          _this.pendingChanges.push(changes);
          return _this.requestUpdate();
        };
      })(this));
    };

    MinimapEditorView.prototype.requestUpdate = function() {
      if (this.frameRequested) {
        return;
      }
      this.frameRequested = true;
      return setImmediate((function(_this) {
        return function() {
          _this.startBench();
          _this.update();
          _this.endBench('minimpap update');
          return _this.frameRequested = false;
        };
      })(this));
    };

    MinimapEditorView.prototype.scrollTop = function(scrollTop, options) {
      if (options == null) {
        options = {};
      }
      if (scrollTop == null) {
        return this.cachedScrollTop || 0;
      }
      if (scrollTop === this.cachedScrollTop) {
        return;
      }
      this.cachedScrollTop = scrollTop;
      return this.requestUpdate();
    };

    MinimapEditorView.prototype.addLineClass = function(line, cls) {
      var index, _base;
      (_base = this.lineClasses)[line] || (_base[line] = []);
      this.lineClasses[line].push(cls);
      if ((this.firstRenderedScreenRow != null) && line >= this.firstRenderedScreenRow && line <= this.lastRenderedScreenRow) {
        index = line - this.firstRenderedScreenRow - 1;
        return this.lines.children()[index].classList.add(cls);
      }
    };

    MinimapEditorView.prototype.removeLineClass = function(line, cls) {
      var index;
      if (this.lineClasses[line] && (index = this.lineClasses[line].indexOf(cls)) !== -1) {
        this.lineClasses[line].splice(index, 1);
      }
      if ((this.firstRenderedScreenRow != null) && line >= this.firstRenderedScreenRow && line <= this.lastRenderedScreenRow) {
        index = line - this.firstRenderedScreenRow - 1;
        return this.lines.children()[index].classList.remove(cls);
      }
    };

    MinimapEditorView.prototype.removeAllLineClasses = function() {
      var classes, classesToRemove, cls, k, _i, _len, _ref1;
      classesToRemove = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _ref1 = this.lineClasses;
      for (k in _ref1) {
        classes = _ref1[k];
        for (_i = 0, _len = classes.length; _i < _len; _i++) {
          cls = classes[_i];
          if (classesToRemove.length === 0 || __indexOf.call(classesToRemove, cls) >= 0) {
            this.find("." + cls).removeClass(cls);
          }
        }
      }
      return this.lineClasses = {};
    };

    MinimapEditorView.prototype.registerBufferChanges = function(event) {
      return this.pendingChanges.push(event);
    };

    MinimapEditorView.prototype.getMinimapHeight = function() {
      return this.getLinesCount() * this.getLineHeight();
    };

    MinimapEditorView.prototype.getLineHeight = function() {
      return this.lineHeight || (this.lineHeight = parseInt(this.editorView.css('line-height')));
    };

    MinimapEditorView.prototype.getLinesCount = function() {
      return this.editorView.getEditor().getScreenLineCount();
    };

    MinimapEditorView.prototype.getMinimapScreenHeight = function() {
      return this.minimapView.height() / this.minimapView.scaleY;
    };

    MinimapEditorView.prototype.getMinimapHeightInLines = function() {
      return Math.ceil(this.getMinimapScreenHeight() / this.getLineHeight());
    };

    MinimapEditorView.prototype.getFirstVisibleScreenRow = function() {
      var screenRow;
      screenRow = Math.floor(this.scrollTop() / this.getLineHeight());
      if (isNaN(screenRow)) {
        screenRow = 0;
      }
      return screenRow;
    };

    MinimapEditorView.prototype.getLastVisibleScreenRow = function() {
      var calculatedRow, screenRow;
      calculatedRow = Math.ceil((this.scrollTop() + this.getMinimapScreenHeight()) / this.getLineHeight()) - 1;
      screenRow = Math.max(0, Math.min(this.editor.getScreenLineCount() - 1, calculatedRow));
      if (isNaN(screenRow)) {
        screenRow = 0;
      }
      return screenRow;
    };

    MinimapEditorView.prototype.update = function() {
      var changes, firstVisibleScreenRow, has_no_changes, intactRanges, lastScreenRow, lastScreenRowToRender, renderFrom, renderTo;
      if (this.editorView == null) {
        return;
      }
      firstVisibleScreenRow = this.getFirstVisibleScreenRow();
      lastScreenRowToRender = firstVisibleScreenRow + this.getMinimapHeightInLines() - 1;
      lastScreenRow = this.editor.getLastScreenRow();
      this.lines.css({
        fontSize: "" + (this.editorView.getFontSize()) + "px"
      });
      if ((this.firstRenderedScreenRow != null) && firstVisibleScreenRow >= this.firstRenderedScreenRow && lastScreenRowToRender <= this.lastRenderedScreenRow) {
        renderFrom = Math.min(lastScreenRow, this.firstRenderedScreenRow);
        renderTo = Math.min(lastScreenRow, this.lastRenderedScreenRow);
      } else {
        renderFrom = Math.min(lastScreenRow, Math.max(0, firstVisibleScreenRow - this.lineOverdraw));
        renderTo = Math.min(lastScreenRow, lastScreenRowToRender + this.lineOverdraw);
      }
      has_no_changes = this.pendingChanges.length === 0 && this.firstRenderedScreenRow && this.firstRenderedScreenRow <= renderFrom && renderTo <= this.lastRenderedScreenRow;
      if (has_no_changes) {
        return;
      }
      changes = this.pendingChanges;
      intactRanges = this.computeIntactRanges(renderFrom, renderTo);
      this.clearDirtyRanges(intactRanges);
      this.fillDirtyRanges(intactRanges, renderFrom, renderTo);
      this.firstRenderedScreenRow = renderFrom;
      this.lastRenderedScreenRow = renderTo;
      this.updatePaddingOfRenderedLines();
      return this.emit('minimap:updated');
    };

    MinimapEditorView.prototype.computeIntactRanges = function(renderFrom, renderTo) {
      var change, changes, emptyLineChanges, intactRanges, newIntactRanges, range, _i, _j, _k, _len, _len1, _len2, _ref1, _ref2, _ref3;
      if ((this.firstRenderedScreenRow == null) && (this.lastRenderedScreenRow == null)) {
        return [];
      }
      intactRanges = [
        {
          start: this.firstRenderedScreenRow,
          end: this.lastRenderedScreenRow,
          domStart: 0
        }
      ];
      if (this.editorView.showIndentGuide) {
        emptyLineChanges = [];
        _ref1 = this.pendingChanges;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          change = _ref1[_i];
          changes = this.computeSurroundingEmptyLineChanges(change);
          emptyLineChanges.push.apply(emptyLineChanges, changes);
        }
        (_ref2 = this.pendingChanges).push.apply(_ref2, emptyLineChanges);
      }
      _ref3 = this.pendingChanges;
      for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
        change = _ref3[_j];
        newIntactRanges = [];
        for (_k = 0, _len2 = intactRanges.length; _k < _len2; _k++) {
          range = intactRanges[_k];
          if (change.end < range.start && change.screenDelta !== 0) {
            newIntactRanges.push({
              start: range.start + change.screenDelta,
              end: range.end + change.screenDelta,
              domStart: range.domStart
            });
          } else if (change.end < range.start || change.start > range.end) {
            newIntactRanges.push(range);
          } else {
            if (change.start > range.start) {
              newIntactRanges.push({
                start: range.start,
                end: change.start - 1,
                domStart: range.domStart
              });
            }
            if (change.end < range.end) {
              newIntactRanges.push({
                start: change.end + change.screenDelta + 1,
                end: range.end + change.screenDelta,
                domStart: range.domStart + change.end + 1 - range.start
              });
            }
          }
        }
        intactRanges = newIntactRanges;
      }
      this.truncateIntactRanges(intactRanges, renderFrom, renderTo);
      this.pendingChanges = [];
      return intactRanges;
    };

    MinimapEditorView.prototype.truncateIntactRanges = function(intactRanges, renderFrom, renderTo) {
      var i, range;
      i = 0;
      while (i < intactRanges.length) {
        range = intactRanges[i];
        if (range.start < renderFrom) {
          range.domStart += renderFrom - range.start;
          range.start = renderFrom;
        }
        if (range.end > renderTo) {
          range.end = renderTo;
        }
        if (range.start >= range.end) {
          intactRanges.splice(i--, 1);
        }
        i++;
      }
      return intactRanges.sort(function(a, b) {
        return a.domStart - b.domStart;
      });
    };

    MinimapEditorView.prototype.computeSurroundingEmptyLineChanges = function(change) {
      var afterEnd, afterStart, beforeEnd, beforeStart, emptyLineChanges;
      emptyLineChanges = [];
      if (change.bufferDelta != null) {
        afterStart = change.end + change.bufferDelta + 1;
        if (this.editor.lineForBufferRow(afterStart) === '') {
          afterEnd = afterStart;
          while (this.editor.lineForBufferRow(afterEnd + 1) === '') {
            afterEnd++;
          }
          emptyLineChanges.push({
            start: afterStart,
            end: afterEnd,
            screenDelta: 0
          });
        }
        beforeEnd = change.start - 1;
        if (this.editor.lineForBufferRow(beforeEnd) === '') {
          beforeStart = beforeEnd;
          while (this.editor.lineForBufferRow(beforeStart - 1) === '') {
            beforeStart--;
          }
          emptyLineChanges.push({
            start: beforeStart,
            end: beforeEnd,
            screenDelta: 0
          });
        }
      }
      return emptyLineChanges;
    };

    MinimapEditorView.prototype.clearDirtyRanges = function(intactRanges) {
      var currentLine, domPosition, i, intactRange, _i, _j, _len, _ref1, _ref2, _results;
      if (intactRanges.length === 0) {
        return this.lines[0].innerHTML = '';
      } else if (currentLine = this.lines[0].firstChild) {
        domPosition = 0;
        for (_i = 0, _len = intactRanges.length; _i < _len; _i++) {
          intactRange = intactRanges[_i];
          while (intactRange.domStart > domPosition) {
            currentLine = this.clearLine(currentLine);
            domPosition++;
          }
          for (i = _j = _ref1 = intactRange.start, _ref2 = intactRange.end; _ref1 <= _ref2 ? _j <= _ref2 : _j >= _ref2; i = _ref1 <= _ref2 ? ++_j : --_j) {
            currentLine = currentLine.nextSibling;
            domPosition++;
          }
        }
        _results = [];
        while (currentLine) {
          _results.push(currentLine = this.clearLine(currentLine));
        }
        return _results;
      }
    };

    MinimapEditorView.prototype.clearLine = function(lineElement) {
      var next;
      next = lineElement.nextSibling;
      this.lines[0].removeChild(lineElement);
      return next;
    };

    MinimapEditorView.prototype.fillDirtyRanges = function(intactRanges, renderFrom, renderTo) {
      var classes, currentLine, dirtyRangeEnd, i, lineElement, nextIntact, row, _results;
      i = 0;
      nextIntact = intactRanges[i];
      currentLine = this.lines[0].firstChild;
      row = renderFrom;
      _results = [];
      while (row <= renderTo) {
        if (row === (nextIntact != null ? nextIntact.end : void 0) + 1) {
          nextIntact = intactRanges[++i];
        }
        if (!nextIntact || row < nextIntact.start) {
          if (nextIntact) {
            dirtyRangeEnd = nextIntact.start - 1;
          } else {
            dirtyRangeEnd = renderTo;
          }
          _results.push((function() {
            var _i, _len, _ref1, _ref2, _results1;
            _ref1 = this.editorView.buildLineElementsForScreenRows(row, dirtyRangeEnd);
            _results1 = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              lineElement = _ref1[_i];
              classes = this.lineClasses[row + 1];
              if (classes != null) {
                (_ref2 = lineElement.classList).add.apply(_ref2, classes);
              }
              this.lines[0].insertBefore(lineElement, currentLine);
              _results1.push(row++);
            }
            return _results1;
          }).call(this));
        } else {
          currentLine = currentLine != null ? currentLine.nextSibling : void 0;
          _results.push(row++);
        }
      }
      return _results;
    };

    MinimapEditorView.prototype.updatePaddingOfRenderedLines = function() {
      var paddingBottom, paddingTop;
      paddingTop = this.firstRenderedScreenRow * this.lineHeight;
      this.lines.css('padding-top', paddingTop);
      paddingBottom = (this.editor.getLastScreenRow() - this.lastRenderedScreenRow) * this.lineHeight;
      return this.lines.css('padding-bottom', paddingBottom);
    };

    MinimapEditorView.prototype.getClientRect = function() {
      var sv;
      sv = this.scrollView[0];
      return {
        width: sv.scrollWidth,
        height: sv.scrollHeight
      };
    };

    return MinimapEditorView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtFQUFBO0lBQUE7Ozs7eUpBQUE7O0FBQUEsRUFBQSxPQUE4QixPQUFBLENBQVEsTUFBUixDQUE5QixFQUFDLGtCQUFBLFVBQUQsRUFBYSxrQkFBQSxVQUFiLEVBQXlCLFNBQUEsQ0FBekIsQ0FBQTs7QUFBQSxFQUNDLFVBQVcsT0FBQSxDQUFRLFVBQVIsRUFBWCxPQURELENBQUE7O0FBQUEsRUFFQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFFBQVIsQ0FGUixDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHdDQUFBLENBQUE7O0FBQUEsSUFBQSxPQUFPLENBQUMsV0FBUixDQUFvQixpQkFBcEIsQ0FBQSxDQUFBOztBQUFBLElBQ0EsS0FBQSxDQUFNLFNBQU4sQ0FBZ0IsQ0FBQyxXQUFqQixDQUE2QixpQkFBN0IsQ0FEQSxDQUFBOztBQUFBLElBR0EsaUJBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLHFDQUFQO09BQUwsRUFBbUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDakQsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLGFBQVA7QUFBQSxZQUFzQixNQUFBLEVBQVEsWUFBOUI7V0FBTCxFQUFpRCxTQUFBLEdBQUE7bUJBQy9DLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxjQUFBLE9BQUEsRUFBTyxPQUFQO0FBQUEsY0FBZ0IsTUFBQSxFQUFRLE9BQXhCO2FBQUwsRUFEK0M7VUFBQSxDQUFqRCxFQURpRDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5ELEVBRFE7SUFBQSxDQUhWLENBQUE7O0FB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
//# sourceURL=/Users/daniel/.atom/packages/minimap/lib/minimap-editor-view.coffee