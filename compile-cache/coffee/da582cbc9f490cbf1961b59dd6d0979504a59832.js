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

    MinimapEditorView.prototype.dummyNode = document.createElement('div');

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
      atom.config.observe('editor.lineHeight', (function(_this) {
        return function() {
          if (_this.editorView != null) {
            return _this.lines.css({
              lineHeight: "" + (_this.getLineHeight()) + "px"
            });
          }
        };
      })(this));
      return atom.config.observe('editor.fontSize', (function(_this) {
        return function() {
          if (_this.editorView != null) {
            return _this.lines.css({
              fontSize: "" + (_this.getFontSize()) + "px"
            });
          }
        };
      })(this));
    };

    MinimapEditorView.prototype.pixelPositionForScreenPosition = function(position) {
      var actualRow, column, row, _ref1;
      _ref1 = this.buffer.constructor.Point.fromObject(position), row = _ref1.row, column = _ref1.column;
      actualRow = Math.floor(row);
      return {
        top: row * this.getLineHeight(),
        left: column
      };
    };

    MinimapEditorView.prototype.destroy = function() {
      this.unsubscribe();
      return this.editorView = null;
    };

    MinimapEditorView.prototype.setEditorView = function(editorView) {
      this.editorView = editorView;
      this.editor = this.editorView.getModel();
      this.buffer = this.editorView.getEditor().buffer;
      this.lines.css({
        lineHeight: "" + (this.getLineHeight()) + "px",
        fontSize: "" + (this.getFontSize()) + "px"
      });
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
          _this.endBench('minimap update');
          return _this.frameRequested = false;
        };
      })(this));
    };

    MinimapEditorView.prototype.forceUpdate = function() {
      this.firstRenderedScreenRow = null;
      this.lastRenderedScreenRow = null;
      this.lines.html('');
      return this.requestUpdate();
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
      return this.lineHeight || (this.lineHeight = Math.round(parseInt(this.editorView.find('.lines').css('line-height')) * this.minimapView.scaleY));
    };

    MinimapEditorView.prototype.getFontSize = function() {
      return this.fontSize || (this.fontSize = Math.round(parseInt(this.editorView.find('.lines').css('font-size')) * this.minimapView.scaleY));
    };

    MinimapEditorView.prototype.getLinesCount = function() {
      return this.editorView.getEditor().getScreenLineCount();
    };

    MinimapEditorView.prototype.getMinimapScreenHeight = function() {
      return this.minimapView.height();
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
      var changes, firstVisibleScreenRow, has_no_changes, intactRanges, lastScreenRow, lastScreenRowToRender, node, renderFrom, renderTo;
      if (this.editorView == null) {
        return;
      }
      firstVisibleScreenRow = this.getFirstVisibleScreenRow();
      lastScreenRowToRender = firstVisibleScreenRow + this.getMinimapHeightInLines() - 1;
      lastScreenRow = this.editor.getLastScreenRow();
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
      node = this.lines[0];
      node.classList.add('hidden');
      this.clearDirtyRanges(intactRanges);
      this.fillDirtyRanges(intactRanges, renderFrom, renderTo);
      this.firstRenderedScreenRow = renderFrom;
      this.lastRenderedScreenRow = renderTo;
      this.updatePaddingOfRenderedLines();
      node.classList.remove('hidden');
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
        if (currentLine == null) {
          console.warn("Unexpected undefined first line in clearing dirty ranges");
          return;
        }
        domPosition = 0;
        for (_i = 0, _len = intactRanges.length; _i < _len; _i++) {
          intactRange = intactRanges[_i];
          while (intactRange.domStart > domPosition) {
            if (currentLine == null) {
              console.warn("Unexpected undefined line at dom position " + domPosition + " with range starting at position " + intactRange.domStart + " (" + intactRange.start + ".." + intactRange.end + ")");
              return;
            }
            currentLine = this.clearLine(currentLine);
            domPosition++;
          }
          for (i = _j = _ref1 = intactRange.start, _ref2 = intactRange.end; _ref1 <= _ref2 ? _j <= _ref2 : _j >= _ref2; i = _ref1 <= _ref2 ? ++_j : --_j) {
            if (currentLine == null) {
              console.warn("Unexpected undefined line when clearing dirty range " + intactRange.start + ".." + intactRange.end);
              return;
            }
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
      var classes, currentLine, dirtyRangeEnd, html, i, line, lineElement, lines, linesComponent, nextIntact, re, row, _base, _results;
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
          if (this.editorView.buildLineElementsForScreenRows != null) {
            _results.push((function() {
              var _i, _len, _ref1, _ref2, _results1;
              _ref1 = this.editorView.buildLineElementsForScreenRows(row, dirtyRangeEnd);
              _results1 = [];
              for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                lineElement = _ref1[_i];
                classes = this.classesForRow(row);
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
            linesComponent = this.editorView.component.refs.lines;
            lines = this.editor.linesForScreenRows(row, dirtyRangeEnd);
            (_base = linesComponent.props).lineDecorations || (_base.lineDecorations = {});
            line = lines[0];
            if (line.invisibles != null) {
              re = RegExp("" + line.invisibles.cr + "|" + line.invisibles.eol + "|" + line.invisibles.space + "|" + line.invisibles.tab, "g");
            }
            _results.push((function() {
              var _i, _len, _ref1, _results1;
              _results1 = [];
              for (_i = 0, _len = lines.length; _i < _len; _i++) {
                line = lines[_i];
                if (this.minimapView.displayCodeHighlights) {
                  html = linesComponent.buildLineHTML(line, row);
                  this.dummyNode.innerHTML = html;
                  lineElement = this.dummyNode.childNodes[0];
                } else {
                  if (line.text.length === 0) {
                    html = ' ';
                  } else {
                    html = line.text;
                    if (re != null) {
                      html = html.replace(re, ' ');
                    }
                  }
                  lineElement = document.createElement('div');
                  lineElement.className = 'line';
                  lineElement.textContent = html;
                }
                if (lineElement == null) {
                  console.warn("Unexpected undefined line element at screen row " + screenRow);
                  continue;
                }
                classes = this.classesForRow(row);
                lineElement.className = 'line';
                if (classes != null) {
                  (_ref1 = lineElement.classList).add.apply(_ref1, classes);
                }
                lineElement.style.cssText = "";
                this.lines[0].insertBefore(lineElement, currentLine);
                _results1.push(row++);
              }
              return _results1;
            }).call(this));
          }
        } else {
          currentLine = currentLine != null ? currentLine.nextSibling : void 0;
          _results.push(row++);
        }
      }
      return _results;
    };

    MinimapEditorView.prototype.classesForRow = function(row) {
      return this.lineClasses[row + 1];
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