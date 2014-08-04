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
      var index, _base, _ref1;
      (_base = this.lineClasses)[line] || (_base[line] = []);
      this.lineClasses[line].push(cls);
      if ((this.firstRenderedScreenRow != null) && line >= this.firstRenderedScreenRow && line <= this.lastRenderedScreenRow) {
        index = line - this.firstRenderedScreenRow - 1;
        return (_ref1 = this.lines.children()[index]) != null ? _ref1.classList.add(cls) : void 0;
      }
    };

    MinimapEditorView.prototype.removeLineClass = function(line, cls) {
      var index, _ref1;
      if (this.lineClasses[line] && (index = this.lineClasses[line].indexOf(cls)) !== -1) {
        this.lineClasses[line].splice(index, 1);
      }
      if ((this.firstRenderedScreenRow != null) && line >= this.firstRenderedScreenRow && line <= this.lastRenderedScreenRow) {
        index = line - this.firstRenderedScreenRow - 1;
        return (_ref1 = this.lines.children()[index]) != null ? _ref1.classList.remove(cls) : void 0;
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
                if (lineElement != null) {
                  (_ref2 = lineElement.classList).add.apply(_ref2, classes);
                }
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtFQUFBO0lBQUE7Ozs7eUpBQUE7O0FBQUEsRUFBQSxPQUE4QixPQUFBLENBQVEsTUFBUixDQUE5QixFQUFDLGtCQUFBLFVBQUQsRUFBYSxrQkFBQSxVQUFiLEVBQXlCLFNBQUEsQ0FBekIsQ0FBQTs7QUFBQSxFQUNDLFVBQVcsT0FBQSxDQUFRLFVBQVIsRUFBWCxPQURELENBQUE7O0FBQUEsRUFFQSxLQUFBLEdBQVEsT0FBQSxDQUFRLFFBQVIsQ0FGUixDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLHdDQUFBLENBQUE7O0FBQUEsSUFBQSxPQUFPLENBQUMsV0FBUixDQUFvQixpQkFBcEIsQ0FBQSxDQUFBOztBQUFBLElBQ0EsS0FBQSxDQUFNLFNBQU4sQ0FBZ0IsQ0FBQyxXQUFqQixDQUE2QixpQkFBN0IsQ0FEQSxDQUFBOztBQUFBLElBR0EsaUJBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLHFDQUFQO09BQUwsRUFBbUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDakQsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLGFBQVA7QUFBQSxZQUFzQixNQUFBLEVBQVEsWUFBOUI7V0FBTCxFQUFpRCxTQUFBLEdBQUE7bUJBQy9DLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxjQUFBLE9BQUEsRUFBTyxPQUFQO0FBQUEsY0FBZ0IsTUFBQSxFQUFRLE9BQXhCO2FBQUwsRUFEK0M7VUFBQSxDQUFqRCxFQURpRDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5ELEVBRFE7SUFBQSxDQUhWLENBQUE7O0FBQUEsZ0NBUUEsY0FBQSxHQUFnQixLQVJoQixDQUFBOztBQVVhLElBQUEsMkJBQUEsR0FBQTtBQUNYLDZDQUFBLENBQUE7QUFBQSwyRUFBQSxDQUFBO0FBQUEsTUFBQSxvREFBQSxTQUFBLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGNBQUQsR0FBa0IsRUFEbEIsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxFQUZmLENBRFc7SUFBQSxDQVZiOztBQUFBLGdDQWVBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixNQUFBLElBQUMsQ0FBQSxZQUFELEdBQWdCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixzQkFBaEIsQ0FBaEIsQ0FBQTtBQUFBLE1BQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLHNCQUFwQixFQUE0QyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUMxQyxLQUFDLENBQUEsWUFBRCxHQUFnQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isc0JBQWhCLEVBRDBCO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUMsQ0FEQSxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxhQUFYLEVBQTBCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixtQkFBaEIsQ0FBQSxHQUF1QyxJQUFqRSxDQUpBLENBQUE7YUFLQSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsbUJBQXBCLEVBQXlDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ3ZDLEtBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLGFBQVgsRUFBMEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG1CQUFoQixDQUFBLEdBQXVDLElBQWpFLEVBRHVDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekMsRUFOVTtJQUFBLENBZlosQ0FBQTs7QUFBQSxnQ0F3QkEsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLE1BQUEsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFBLENBQUE7YUFDQSxJQUFDLENBQUEsVUFBRCxHQUFjLEtBRlA7SUFBQSxDQXhCVCxDQUFBOztBQUFBLGdDQTRCQSxhQUFBLEdBQWUsU0FBRSxVQUFGLEdBQUE7QUFDYixNQURjLElBQUMsQ0FBQSxhQUFBLFVBQ2YsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsVUFBVSxDQUFDLFFBQVosQ0FBQSxDQUFWLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxNQUFELEdBQVUsSUFBQyxDQUFBLFVBQVUsQ0FBQyxTQUFaLENBQUEsQ0FBdUIsQ0FBQyxNQURsQyxDQUFBO2FBR0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsTUFBWixFQUFvQiw4QkFBcEIsRUFBb0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsT0FBRCxHQUFBO0FBQ2xELFVBQUEsS0FBQyxDQUFBLGNBQWMsQ0FBQyxJQUFoQixDQUFxQixPQUFyQixDQUFBLENBQUE7aUJBQ0EsS0FBQyxDQUFBLGFBQUQsQ0FBQSxFQUZrRDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBELEVBSmE7SUFBQSxDQTVCZixDQUFBOztBQUFBLGdDQW9DQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ2IsTUFBQSxJQUFVLElBQUMsQ0FBQSxjQUFYO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxjQUFELEdBQWtCLElBRGxCLENBQUE7YUFHQSxZQUFBLENBQWEsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNYLFVBQUEsS0FBQyxDQUFBLFVBQUQsQ0FBQSxDQUFBLENBQUE7QUFBQSxVQUNBLEtBQUMsQ0FBQSxNQUFELENBQUEsQ0FEQSxDQUFBO0FBQUEsVUFFQSxLQUFDLENBQUEsUUFBRCxDQUFVLGlCQUFWLENBRkEsQ0FBQTtpQkFHQSxLQUFDLENBQUEsY0FBRCxHQUFrQixNQUpQO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBYixFQUphO0lBQUEsQ0FwQ2YsQ0FBQTs7QUFBQSxnQ0E4Q0EsU0FBQSxHQUFXLFNBQUMsU0FBRCxFQUFZLE9BQVosR0FBQTs7UUFBWSxVQUFRO09BQzdCO0FBQUEsTUFBQSxJQUFvQyxpQkFBcEM7QUFBQSxlQUFPLElBQUMsQ0FBQSxlQUFELElBQW9CLENBQTNCLENBQUE7T0FBQTtBQUNBLE1BQUEsSUFBVSxTQUFBLEtBQWEsSUFBQyxDQUFBLGVBQXhCO0FBQUEsY0FBQSxDQUFBO09BREE7QUFBQSxNQUdBLElBQUMsQ0FBQSxlQUFELEdBQW1CLFNBSG5CLENBQUE7YUFJQSxJQUFDLENBQUEsYUFBRCxDQUFBLEVBTFM7SUFBQSxDQTlDWCxDQUFBOztBQUFBLGdDQXFEQSxZQUFBLEdBQWMsU0FBQyxJQUFELEVBQU8sR0FBUCxHQUFBO0FBQ1osVUFBQSxtQkFBQTtBQUFBLGVBQUEsSUFBQyxDQUFBLFlBQVksQ0FBQSxJQUFBLFdBQUEsQ0FBQSxJQUFBLElBQVUsR0FBdkIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFdBQVksQ0FBQSxJQUFBLENBQUssQ0FBQyxJQUFuQixDQUF3QixHQUF4QixDQURBLENBQUE7QUFHQSxNQUFBLElBQUcscUNBQUEsSUFBNkIsSUFBQSxJQUFRLElBQUMsQ0FBQSxzQkFBdEMsSUFBaUUsSUFBQSxJQUFRLElBQUMsQ0FBQSxxQkFBN0U7QUFDRSxRQUFBLEtBQUEsR0FBUSxJQUFBLEdBQU8sSUFBQyxDQUFBLHNCQUFSLEdBQWlDLENBQXpDLENBQUE7cUVBQ3dCLENBQUUsU0FBUyxDQUFDLEdBQXBDLENBQXdDLEdBQXhDLFdBRkY7T0FKWTtJQUFBLENBckRkLENBQUE7O0FBQUEsZ0NBNkRBLGVBQUEsR0FBaUIsU0FBQyxJQUFELEVBQU8sR0FBUCxHQUFBO0FBQ2YsVUFBQSxZQUFBO0FBQUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxXQUFZLENBQUEsSUFBQSxDQUFiLElBQXVCLENBQUMsS0FBQSxHQUFRLElBQUMsQ0FBQSxXQUFZLENBQUEsSUFBQSxDQUFLLENBQUMsT0FBbkIsQ0FBMkIsR0FBM0IsQ0FBVCxDQUFBLEtBQThDLENBQUEsQ0FBeEU7QUFDRSxRQUFBLElBQUMsQ0FBQSxXQUFZLENBQUEsSUFBQSxDQUFLLENBQUMsTUFBbkIsQ0FBMEIsS0FBMUIsRUFBaUMsQ0FBakMsQ0FBQSxDQURGO09BQUE7QUFHQSxNQUFBLElBQUcscUNBQUEsSUFBNkIsSUFBQSxJQUFRLElBQUMsQ0FBQSxzQkFBdEMsSUFBaUUsSUFBQSxJQUFRLElBQUMsQ0FBQSxxQkFBN0U7QUFDRSxRQUFBLEtBQUEsR0FBUSxJQUFBLEdBQU8sSUFBQyxDQUFBLHNCQUFSLEdBQWlDLENBQXpDLENBQUE7cUVBQ3dCLENBQUUsU0FBUyxDQUFDLE1BQXBDLENBQTJDLEdBQTNDLFdBRkY7T0FKZTtJQUFBLENBN0RqQixDQUFBOztBQUFBLGdDQXFFQSxvQkFBQSxHQUFzQixTQUFBLEdBQUE7QUFDcEIsVUFBQSxpREFBQTtBQUFBLE1BRHFCLHlFQUNyQixDQUFBO0FBQUE7QUFBQSxXQUFBLFVBQUE7MkJBQUE7QUFDRSxhQUFBLDhDQUFBOzRCQUFBO0FBQ0UsVUFBQSxJQUFHLGVBQWUsQ0FBQyxNQUFoQixLQUEwQixDQUExQixJQUErQixlQUFPLGVBQVAsRUFBQSxHQUFBLE1BQWxDO0FBQ0UsWUFBQSxJQUFDLENBQUEsSUFBRCxDQUFPLEdBQUEsR0FBRSxHQUFULENBQWdCLENBQUMsV0FBakIsQ0FBNkIsR0FBN0IsQ0FBQSxDQURGO1dBREY7QUFBQSxTQURGO0FBQUEsT0FBQTthQUtBLElBQUMsQ0FBQSxXQUFELEdBQWUsR0FOSztJQUFBLENBckV0QixDQUFBOztBQUFBLGdDQTZFQSxxQkFBQSxHQUF1QixTQUFDLEtBQUQsR0FBQTthQUNyQixJQUFDLENBQUEsY0FBYyxDQUFDLElBQWhCLENBQXFCLEtBQXJCLEVBRHFCO0lBQUEsQ0E3RXZCLENBQUE7O0FBQUEsZ0NBZ0ZBLGdCQUFBLEdBQWtCLFNBQUEsR0FBQTthQUFHLElBQUMsQ0FBQSxhQUFELENBQUEsQ0FBQSxHQUFtQixJQUFDLENBQUEsYUFBRCxDQUFBLEVBQXRCO0lBQUEsQ0FoRmxCLENBQUE7O0FBQUEsZ0NBaUZBLGFBQUEsR0FBZSxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsZUFBRCxJQUFDLENBQUEsYUFBZSxRQUFBLENBQVMsSUFBQyxDQUFBLFVBQVUsQ0FBQyxHQUFaLENBQWdCLGFBQWhCLENBQVQsR0FBbkI7SUFBQSxDQWpGZixDQUFBOztBQUFBLGdDQWtGQSxhQUFBLEdBQWUsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLFVBQVUsQ0FBQyxTQUFaLENBQUEsQ0FBdUIsQ0FBQyxrQkFBeEIsQ0FBQSxFQUFIO0lBQUEsQ0FsRmYsQ0FBQTs7QUFBQSxnQ0FvRkEsc0JBQUEsR0FBd0IsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLFdBQVcsQ0FBQyxNQUFiLENBQUEsQ0FBQSxHQUF3QixJQUFDLENBQUEsV0FBVyxDQUFDLE9BQXhDO0lBQUEsQ0FwRnhCLENBQUE7O0FBQUEsZ0NBcUZBLHVCQUFBLEdBQXlCLFNBQUEsR0FBQTthQUFHLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBQyxDQUFBLHNCQUFELENBQUEsQ0FBQSxHQUE0QixJQUFDLENBQUEsYUFBRCxDQUFBLENBQXRDLEVBQUg7SUFBQSxDQXJGekIsQ0FBQTs7QUFBQSxnQ0F1RkEsd0JBQUEsR0FBMEIsU0FBQSxHQUFBO0FBQ3hCLFVBQUEsU0FBQTtBQUFBLE1BQUEsU0FBQSxHQUFZLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFBLEdBQWUsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUExQixDQUFaLENBQUE7QUFDQSxNQUFBLElBQWlCLEtBQUEsQ0FBTSxTQUFOLENBQWpCO0FBQUEsUUFBQSxTQUFBLEdBQVksQ0FBWixDQUFBO09BREE7YUFFQSxVQUh3QjtJQUFBLENBdkYxQixDQUFBOztBQUFBLGdDQTRGQSx1QkFBQSxHQUF5QixTQUFBLEdBQUE7QUFDdkIsVUFBQSx3QkFBQTtBQUFBLE1BQUEsYUFBQSxHQUFnQixJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFBLEdBQWUsSUFBQyxDQUFBLHNCQUFELENBQUEsQ0FBaEIsQ0FBQSxHQUE2QyxJQUFDLENBQUEsYUFBRCxDQUFBLENBQXZELENBQUEsR0FBMkUsQ0FBM0YsQ0FBQTtBQUFBLE1BQ0EsU0FBQSxHQUFZLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBVCxFQUFZLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBUixDQUFBLENBQUEsR0FBK0IsQ0FBeEMsRUFBMkMsYUFBM0MsQ0FBWixDQURaLENBQUE7QUFFQSxNQUFBLElBQWlCLEtBQUEsQ0FBTSxTQUFOLENBQWpCO0FBQUEsUUFBQSxTQUFBLEdBQVksQ0FBWixDQUFBO09BRkE7YUFHQSxVQUp1QjtJQUFBLENBNUZ6QixDQUFBOztBQUFBLGdDQWtHQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sVUFBQSx3SEFBQTtBQUFBLE1BQUEsSUFBYyx1QkFBZDtBQUFBLGNBQUEsQ0FBQTtPQUFBO0FBQUEsTUFFQSxxQkFBQSxHQUF3QixJQUFDLENBQUEsd0JBQUQsQ0FBQSxDQUZ4QixDQUFBO0FBQUEsTUFHQSxxQkFBQSxHQUF3QixxQkFBQSxHQUF3QixJQUFDLENBQUEsdUJBQUQsQ0FBQSxDQUF4QixHQUFxRCxDQUg3RSxDQUFBO0FBQUEsTUFJQSxhQUFBLEdBQWdCLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBQSxDQUpoQixDQUFBO0FBQUEsTUFNQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVztBQUFBLFFBQUEsUUFBQSxFQUFVLEVBQUEsR0FBRSxDQUFBLElBQUMsQ0FBQSxVQUFVLENBQUMsV0FBWixDQUFBLENBQUEsQ0FBRixHQUE2QixJQUF2QztPQUFYLENBTkEsQ0FBQTtBQVFBLE1BQUEsSUFBRyxxQ0FBQSxJQUE2QixxQkFBQSxJQUF5QixJQUFDLENBQUEsc0JBQXZELElBQWtGLHFCQUFBLElBQXlCLElBQUMsQ0FBQSxxQkFBL0c7QUFDRSxRQUFBLFVBQUEsR0FBYSxJQUFJLENBQUMsR0FBTCxDQUFTLGFBQVQsRUFBd0IsSUFBQyxDQUFBLHNCQUF6QixDQUFiLENBQUE7QUFBQSxRQUNBLFFBQUEsR0FBVyxJQUFJLENBQUMsR0FBTCxDQUFTLGFBQVQsRUFBd0IsSUFBQyxDQUFBLHFCQUF6QixDQURYLENBREY7T0FBQSxNQUFBO0FBSUUsUUFBQSxVQUFBLEdBQWEsSUFBSSxDQUFDLEdBQUwsQ0FBUyxhQUFULEVBQXdCLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBVCxFQUFZLHFCQUFBLEdBQXdCLElBQUMsQ0FBQSxZQUFyQyxDQUF4QixDQUFiLENBQUE7QUFBQSxRQUNBLFFBQUEsR0FBVyxJQUFJLENBQUMsR0FBTCxDQUFTLGFBQVQsRUFBd0IscUJBQUEsR0FBd0IsSUFBQyxDQUFBLFlBQWpELENBRFgsQ0FKRjtPQVJBO0FBQUEsTUFlQSxjQUFBLEdBQWlCLElBQUMsQ0FBQSxjQUFjLENBQUMsTUFBaEIsS0FBMEIsQ0FBMUIsSUFBZ0MsSUFBQyxDQUFBLHNCQUFqQyxJQUE0RCxJQUFDLENBQUEsc0JBQUQsSUFBMkIsVUFBdkYsSUFBc0csUUFBQSxJQUFZLElBQUMsQ0FBQSxxQkFmcEksQ0FBQTtBQWdCQSxNQUFBLElBQVUsY0FBVjtBQUFBLGNBQUEsQ0FBQTtPQWhCQTtBQUFBLE1Ba0JBLE9BQUEsR0FBVSxJQUFDLENBQUEsY0FsQlgsQ0FBQTtBQUFBLE1BbUJBLFlBQUEsR0FBZSxJQUFDLENBQUEsbUJBQUQsQ0FBcUIsVUFBckIsRUFBaUMsUUFBakMsQ0FuQmYsQ0FBQTtBQUFBLE1BcUJBLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixZQUFsQixDQXJCQSxDQUFBO0FBQUEsTUFzQkEsSUFBQyxDQUFBLGVBQUQsQ0FBaUIsWUFBakIsRUFBK0IsVUFBL0IsRUFBMkMsUUFBM0MsQ0F0QkEsQ0FBQTtBQUFBLE1BdUJBLElBQUMsQ0FBQSxzQkFBRCxHQUEwQixVQXZCMUIsQ0FBQTtBQUFBLE1Bd0JBLElBQUMsQ0FBQSxxQkFBRCxHQUF5QixRQXhCekIsQ0FBQTtBQUFBLE1BeUJBLElBQUMsQ0FBQSw0QkFBRCxDQUFBLENBekJBLENBQUE7YUEwQkEsSUFBQyxDQUFBLElBQUQsQ0FBTSxpQkFBTixFQTNCTTtJQUFBLENBbEdSLENBQUE7O0FBQUEsZ0NBK0hBLG1CQUFBLEdBQXFCLFNBQUMsVUFBRCxFQUFhLFFBQWIsR0FBQTtBQUNuQixVQUFBLDRIQUFBO0FBQUEsTUFBQSxJQUFjLHFDQUFELElBQStCLG9DQUE1QztBQUFBLGVBQU8sRUFBUCxDQUFBO09BQUE7QUFBQSxNQUVBLFlBQUEsR0FBZTtRQUFDO0FBQUEsVUFBQyxLQUFBLEVBQU8sSUFBQyxDQUFBLHNCQUFUO0FBQUEsVUFBaUMsR0FBQSxFQUFLLElBQUMsQ0FBQSxxQkFBdkM7QUFBQSxVQUE4RCxRQUFBLEVBQVUsQ0FBeEU7U0FBRDtPQUZmLENBQUE7QUFJQSxNQUFBLElBQUcsSUFBQyxDQUFBLFVBQVUsQ0FBQyxlQUFmO0FBQ0UsUUFBQSxnQkFBQSxHQUFtQixFQUFuQixDQUFBO0FBQ0E7QUFBQSxhQUFBLDRDQUFBOzZCQUFBO0FBQ0UsVUFBQSxPQUFBLEdBQVUsSUFBQyxDQUFBLGtDQUFELENBQW9DLE1BQXBDLENBQVYsQ0FBQTtBQUFBLFVBQ0EsZ0JBQWdCLENBQUMsSUFBakIseUJBQXNCLE9BQXRCLENBREEsQ0FERjtBQUFBLFNBREE7QUFBQSxRQUtBLFNBQUEsSUFBQyxDQUFBLGNBQUQsQ0FBZSxDQUFDLElBQWhCLGNBQXFCLGdCQUFyQixDQUxBLENBREY7T0FKQTtBQVlBO0FBQUEsV0FBQSw4Q0FBQTsyQkFBQTtBQUNFLFFBQUEsZUFBQSxHQUFrQixFQUFsQixDQUFBO0FBQ0EsYUFBQSxxREFBQTttQ0FBQTtBQUNFLFVBQUEsSUFBRyxNQUFNLENBQUMsR0FBUCxHQUFhLEtBQUssQ0FBQyxLQUFuQixJQUE2QixNQUFNLENBQUMsV0FBUCxLQUFzQixDQUF0RDtBQUNFLFlBQUEsZUFBZSxDQUFDLElBQWhCLENBQ0U7QUFBQSxjQUFBLEtBQUEsRUFBTyxLQUFLLENBQUMsS0FBTixHQUFjLE1BQU0sQ0FBQyxXQUE1QjtBQUFBLGNBQ0EsR0FBQSxFQUFLLEtBQUssQ0FBQyxHQUFOLEdBQVksTUFBTSxDQUFDLFdBRHhCO0FBQUEsY0FFQSxRQUFBLEVBQVUsS0FBSyxDQUFDLFFBRmhCO2FBREYsQ0FBQSxDQURGO1dBQUEsTUFNSyxJQUFHLE1BQU0sQ0FBQyxHQUFQLEdBQWEsS0FBSyxDQUFDLEtBQW5CLElBQTRCLE1BQU0sQ0FBQyxLQUFQLEdBQWUsS0FBSyxDQUFDLEdBQXBEO0FBQ0gsWUFBQSxlQUFlLENBQUMsSUFBaEIsQ0FBcUIsS0FBckIsQ0FBQSxDQURHO1dBQUEsTUFBQTtBQUdILFlBQUEsSUFBRyxNQUFNLENBQUMsS0FBUCxHQUFlLEtBQUssQ0FBQyxLQUF4QjtBQUNFLGNBQUEsZUFBZSxDQUFDLElBQWhCLENBQ0U7QUFBQSxnQkFBQSxLQUFBLEVBQU8sS0FBSyxDQUFDLEtBQWI7QUFBQSxnQkFDQSxHQUFBLEVBQUssTUFBTSxDQUFDLEtBQVAsR0FBZSxDQURwQjtBQUFBLGdCQUVBLFFBQUEsRUFBVSxLQUFLLENBQUMsUUFGaEI7ZUFERixDQUFBLENBREY7YUFBQTtBQUtBLFlBQUEsSUFBRyxNQUFNLENBQUMsR0FBUCxHQUFhLEtBQUssQ0FBQyxHQUF0QjtBQUNFLGNBQUEsZUFBZSxDQUFDLElBQWhCLENBQ0U7QUFBQSxnQkFBQSxLQUFBLEVBQU8sTUFBTSxDQUFDLEdBQVAsR0FBYSxNQUFNLENBQUMsV0FBcEIsR0FBa0MsQ0FBekM7QUFBQSxnQkFDQSxHQUFBLEVBQUssS0FBSyxDQUFDLEdBQU4sR0FBWSxNQUFNLENBQUMsV0FEeEI7QUFBQSxnQkFFQSxRQUFBLEVBQVUsS0FBSyxDQUFDLFFBQU4sR0FBaUIsTUFBTSxDQUFDLEdBQXhCLEdBQThCLENBQTlCLEdBQWtDLEtBQUssQ0FBQyxLQUZsRDtlQURGLENBQUEsQ0FERjthQVJHO1dBUFA7QUFBQSxTQURBO0FBQUEsUUF1QkEsWUFBQSxHQUFlLGVBdkJmLENBREY7QUFBQSxPQVpBO0FBQUEsTUFzQ0EsSUFBQyxDQUFBLG9CQUFELENBQXNCLFlBQXRCLEVBQW9DLFVBQXBDLEVBQWdELFFBQWhELENBdENBLENBQUE7QUFBQSxNQXdDQSxJQUFDLENBQUEsY0FBRCxHQUFrQixFQXhDbEIsQ0FBQTthQTBDQSxhQTNDbUI7SUFBQSxDQS9IckIsQ0FBQTs7QUFBQSxnQ0E0S0Esb0JBQUEsR0FBc0IsU0FBQyxZQUFELEVBQWUsVUFBZixFQUEyQixRQUEzQixHQUFBO0FBQ3BCLFVBQUEsUUFBQTtBQUFBLE1BQUEsQ0FBQSxHQUFJLENBQUosQ0FBQTtBQUNBLGFBQU0sQ0FBQSxHQUFJLFlBQVksQ0FBQyxNQUF2QixHQUFBO0FBQ0UsUUFBQSxLQUFBLEdBQVEsWUFBYSxDQUFBLENBQUEsQ0FBckIsQ0FBQTtBQUNBLFFBQUEsSUFBRyxLQUFLLENBQUMsS0FBTixHQUFjLFVBQWpCO0FBQ0UsVUFBQSxLQUFLLENBQUMsUUFBTixJQUFrQixVQUFBLEdBQWEsS0FBSyxDQUFDLEtBQXJDLENBQUE7QUFBQSxVQUNBLEtBQUssQ0FBQyxLQUFOLEdBQWMsVUFEZCxDQURGO1NBREE7QUFJQSxRQUFBLElBQUcsS0FBSyxDQUFDLEdBQU4sR0FBWSxRQUFmO0FBQ0UsVUFBQSxLQUFLLENBQUMsR0FBTixHQUFZLFFBQVosQ0FERjtTQUpBO0FBTUEsUUFBQSxJQUFHLEtBQUssQ0FBQyxLQUFOLElBQWUsS0FBSyxDQUFDLEdBQXhCO0FBQ0UsVUFBQSxZQUFZLENBQUMsTUFBYixDQUFvQixDQUFBLEVBQXBCLEVBQXlCLENBQXpCLENBQUEsQ0FERjtTQU5BO0FBQUEsUUFRQSxDQUFBLEVBUkEsQ0FERjtNQUFBLENBREE7YUFXQSxZQUFZLENBQUMsSUFBYixDQUFrQixTQUFDLENBQUQsRUFBSSxDQUFKLEdBQUE7ZUFBVSxDQUFDLENBQUMsUUFBRixHQUFhLENBQUMsQ0FBQyxTQUF6QjtNQUFBLENBQWxCLEVBWm9CO0lBQUEsQ0E1S3RCLENBQUE7O0FBQUEsZ0NBMExBLGtDQUFBLEdBQW9DLFNBQUMsTUFBRCxHQUFBO0FBQ2xDLFVBQUEsOERBQUE7QUFBQSxNQUFBLGdCQUFBLEdBQW1CLEVBQW5CLENBQUE7QUFFQSxNQUFBLElBQUcsMEJBQUg7QUFDRSxRQUFBLFVBQUEsR0FBYSxNQUFNLENBQUMsR0FBUCxHQUFhLE1BQU0sQ0FBQyxXQUFwQixHQUFrQyxDQUEvQyxDQUFBO0FBQ0EsUUFBQSxJQUFHLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBeUIsVUFBekIsQ0FBQSxLQUF3QyxFQUEzQztBQUNFLFVBQUEsUUFBQSxHQUFXLFVBQVgsQ0FBQTtBQUNXLGlCQUFNLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBeUIsUUFBQSxHQUFXLENBQXBDLENBQUEsS0FBMEMsRUFBaEQsR0FBQTtBQUFYLFlBQUEsUUFBQSxFQUFBLENBQVc7VUFBQSxDQURYO0FBQUEsVUFFQSxnQkFBZ0IsQ0FBQyxJQUFqQixDQUFzQjtBQUFBLFlBQUMsS0FBQSxFQUFPLFVBQVI7QUFBQSxZQUFvQixHQUFBLEVBQUssUUFBekI7QUFBQSxZQUFtQyxXQUFBLEVBQWEsQ0FBaEQ7V0FBdEIsQ0FGQSxDQURGO1NBREE7QUFBQSxRQU1BLFNBQUEsR0FBWSxNQUFNLENBQUMsS0FBUCxHQUFlLENBTjNCLENBQUE7QUFPQSxRQUFBLElBQUcsSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUF5QixTQUF6QixDQUFBLEtBQXVDLEVBQTFDO0FBQ0UsVUFBQSxXQUFBLEdBQWMsU0FBZCxDQUFBO0FBQ2MsaUJBQU0sSUFBQyxDQUFBLE1BQU0sQ0FBQyxnQkFBUixDQUF5QixXQUFBLEdBQWMsQ0FBdkMsQ0FBQSxLQUE2QyxFQUFuRCxHQUFBO0FBQWQsWUFBQSxXQUFBLEVBQUEsQ0FBYztVQUFBLENBRGQ7QUFBQSxVQUVBLGdCQUFnQixDQUFDLElBQWpCLENBQXNCO0FBQUEsWUFBQyxLQUFBLEVBQU8sV0FBUjtBQUFBLFlBQXFCLEdBQUEsRUFBSyxTQUExQjtBQUFBLFlBQXFDLFdBQUEsRUFBYSxDQUFsRDtXQUF0QixDQUZBLENBREY7U0FSRjtPQUZBO2FBZUEsaUJBaEJrQztJQUFBLENBMUxwQyxDQUFBOztBQUFBLGdDQTRNQSxnQkFBQSxHQUFrQixTQUFDLFlBQUQsR0FBQTtBQUNoQixVQUFBLDhFQUFBO0FBQUEsTUFBQSxJQUFHLFlBQVksQ0FBQyxNQUFiLEtBQXVCLENBQTFCO2VBQ0UsSUFBQyxDQUFBLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxTQUFWLEdBQXNCLEdBRHhCO09BQUEsTUFFSyxJQUFHLFdBQUEsR0FBYyxJQUFDLENBQUEsS0FBTSxDQUFBLENBQUEsQ0FBRSxDQUFDLFVBQTNCO0FBQ0gsUUFBQSxXQUFBLEdBQWMsQ0FBZCxDQUFBO0FBQ0EsYUFBQSxtREFBQTt5Q0FBQTtBQUNFLGlCQUFNLFdBQVcsQ0FBQyxRQUFaLEdBQXVCLFdBQTdCLEdBQUE7QUFDRSxZQUFBLFdBQUEsR0FBYyxJQUFDLENBQUEsU0FBRCxDQUFXLFdBQVgsQ0FBZCxDQUFBO0FBQUEsWUFDQSxXQUFBLEVBREEsQ0FERjtVQUFBLENBQUE7QUFJQSxlQUFTLHlJQUFULEdBQUE7QUFDRSxZQUFBLFdBQUEsR0FBYyxXQUFXLENBQUMsV0FBMUIsQ0FBQTtBQUFBLFlBQ0EsV0FBQSxFQURBLENBREY7QUFBQSxXQUxGO0FBQUEsU0FEQTtBQVVBO2VBQU0sV0FBTixHQUFBO0FBQ0Usd0JBQUEsV0FBQSxHQUFjLElBQUMsQ0FBQSxTQUFELENBQVcsV0FBWCxFQUFkLENBREY7UUFBQSxDQUFBO3dCQVhHO09BSFc7SUFBQSxDQTVNbEIsQ0FBQTs7QUFBQSxnQ0E2TkEsU0FBQSxHQUFXLFNBQUMsV0FBRCxHQUFBO0FBQ1QsVUFBQSxJQUFBO0FBQUEsTUFBQSxJQUFBLEdBQU8sV0FBVyxDQUFDLFdBQW5CLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsV0FBVixDQUFzQixXQUF0QixDQURBLENBQUE7YUFFQSxLQUhTO0lBQUEsQ0E3TlgsQ0FBQTs7QUFBQSxnQ0FtT0EsZUFBQSxHQUFpQixTQUFDLFlBQUQsRUFBZSxVQUFmLEVBQTJCLFFBQTNCLEdBQUE7QUFDZixVQUFBLDhFQUFBO0FBQUEsTUFBQSxDQUFBLEdBQUksQ0FBSixDQUFBO0FBQUEsTUFDQSxVQUFBLEdBQWEsWUFBYSxDQUFBLENBQUEsQ0FEMUIsQ0FBQTtBQUFBLE1BRUEsV0FBQSxHQUFjLElBQUMsQ0FBQSxLQUFNLENBQUEsQ0FBQSxDQUFFLENBQUMsVUFGeEIsQ0FBQTtBQUFBLE1BSUEsR0FBQSxHQUFNLFVBSk4sQ0FBQTtBQUtBO2FBQU0sR0FBQSxJQUFPLFFBQWIsR0FBQTtBQUNFLFFBQUEsSUFBRyxHQUFBLDJCQUFPLFVBQVUsQ0FBRSxhQUFaLEdBQWtCLENBQTVCO0FBQ0UsVUFBQSxVQUFBLEdBQWEsWUFBYSxDQUFBLEVBQUEsQ0FBQSxDQUExQixDQURGO1NBQUE7QUFHQSxRQUFBLElBQUcsQ0FBQSxVQUFBLElBQWUsR0FBQSxHQUFNLFVBQVUsQ0FBQyxLQUFuQztBQUNFLFVBQUEsSUFBRyxVQUFIO0FBQ0UsWUFBQSxhQUFBLEdBQWdCLFVBQVUsQ0FBQyxLQUFYLEdBQW1CLENBQW5DLENBREY7V0FBQSxNQUFBO0FBR0UsWUFBQSxhQUFBLEdBQWdCLFFBQWhCLENBSEY7V0FBQTtBQUFBOztBQUtBO0FBQUE7aUJBQUEsNENBQUE7c0NBQUE7QUFDRSxjQUFBLE9BQUEsR0FBVSxJQUFDLENBQUEsV0FBWSxDQUFBLEdBQUEsR0FBSSxDQUFKLENBQXZCLENBQUE7QUFDQSxjQUFBLElBQTBDLGVBQTFDOztrQkFBQSxTQUFBLFdBQVcsQ0FBRSxTQUFiLENBQXNCLENBQUMsR0FBdkIsY0FBMkIsT0FBM0I7aUJBQUE7ZUFEQTtBQUFBLGNBRUEsSUFBQyxDQUFBLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxZQUFWLENBQXVCLFdBQXZCLEVBQW9DLFdBQXBDLENBRkEsQ0FBQTtBQUFBLDZCQUdBLEdBQUEsR0FIQSxDQURGO0FBQUE7O3dCQUxBLENBREY7U0FBQSxNQUFBO0FBWUUsVUFBQSxXQUFBLHlCQUFjLFdBQVcsQ0FBRSxvQkFBM0IsQ0FBQTtBQUFBLHdCQUNBLEdBQUEsR0FEQSxDQVpGO1NBSkY7TUFBQSxDQUFBO3NCQU5lO0lBQUEsQ0FuT2pCLENBQUE7O0FBQUEsZ0NBNFBBLDRCQUFBLEdBQThCLFNBQUEsR0FBQTtBQUM1QixVQUFBLHlCQUFBO0FBQUEsTUFBQSxVQUFBLEdBQWEsSUFBQyxDQUFBLHNCQUFELEdBQTBCLElBQUMsQ0FBQSxVQUF4QyxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxhQUFYLEVBQTBCLFVBQTFCLENBREEsQ0FBQTtBQUFBLE1BR0EsYUFBQSxHQUFnQixDQUFDLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBQSxDQUFBLEdBQTZCLElBQUMsQ0FBQSxxQkFBL0IsQ0FBQSxHQUF3RCxJQUFDLENBQUEsVUFIekUsQ0FBQTthQUlBLElBQUMsQ0FBQSxLQUFLLENBQUMsR0FBUCxDQUFXLGdCQUFYLEVBQTZCLGFBQTdCLEVBTDRCO0lBQUEsQ0E1UDlCLENBQUE7O0FBQUEsZ0NBbVFBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFDYixVQUFBLEVBQUE7QUFBQSxNQUFBLEVBQUEsR0FBSyxJQUFDLENBQUEsVUFBVyxDQUFBLENBQUEsQ0FBakIsQ0FBQTthQUNBO0FBQUEsUUFDRSxLQUFBLEVBQU8sRUFBRSxDQUFDLFdBRFo7QUFBQSxRQUVFLE1BQUEsRUFBUSxFQUFFLENBQUMsWUFGYjtRQUZhO0lBQUEsQ0FuUWYsQ0FBQTs7NkJBQUE7O0tBRDhCLFdBTGhDLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/minimap/lib/minimap-editor-view.coffee