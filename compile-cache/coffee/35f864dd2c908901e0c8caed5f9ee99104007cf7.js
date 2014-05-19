(function() {
  var $, CONFLICT_CLASSES, Conflict, ConflictMarker, DIRTY_CLASSES, NavigationView, OUR_CLASSES, RESOLVED_CLASSES, ResolverView, SideView, Subscriber, THEIR_CLASSES, _;

  $ = require('atom').$;

  _ = require('underscore-plus');

  Subscriber = require('emissary').Subscriber;

  Conflict = require('./conflict');

  SideView = require('./side-view');

  NavigationView = require('./navigation-view');

  ResolverView = require('./resolver-view');

  CONFLICT_CLASSES = "conflict-line resolved ours theirs parent dirty";

  OUR_CLASSES = "conflict-line ours";

  THEIR_CLASSES = "conflict-line theirs";

  RESOLVED_CLASSES = "conflict-line resolved";

  DIRTY_CLASSES = "conflict-line dirty";

  module.exports = ConflictMarker = (function() {
    Subscriber.includeInto(ConflictMarker);

    function ConflictMarker(state, editorView) {
      var c, _i, _len, _ref;
      this.state = state;
      this.editorView = editorView;
      this.conflicts = Conflict.all(this.state, this.editorView.getEditor());
      if (this.conflicts) {
        this.editorView.addClass('conflicted');
      }
      this.coveringViews = [];
      _ref = this.conflicts;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        this.coveringViews.push(new SideView(c.ours, this.editorView));
        this.coveringViews.push(new NavigationView(c.navigator, this.editorView));
        this.coveringViews.push(new SideView(c.theirs, this.editorView));
        c.on('conflict:resolved', (function(_this) {
          return function() {
            var resolvedCount, unresolved, v, _j, _len1;
            unresolved = (function() {
              var _j, _len1, _ref1, _results;
              _ref1 = this.coveringViews;
              _results = [];
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                v = _ref1[_j];
                if (!v.conflict().isResolved()) {
                  _results.push(v);
                }
              }
              return _results;
            }).call(_this);
            for (_j = 0, _len1 = unresolved.length; _j < _len1; _j++) {
              v = unresolved[_j];
              v.reposition();
            }
            resolvedCount = _this.conflicts.length - Math.floor(unresolved.length / 3);
            return atom.emit('merge-conflicts:resolved', {
              file: _this.editor().getPath(),
              total: _this.conflicts.length,
              resolved: resolvedCount,
              source: _this
            });
          };
        })(this));
      }
      if (this.conflicts.length > 0) {
        this.remark();
        this.installEvents();
        this.focusConflict(this.conflicts[0]);
      } else {
        this.conflictsResolved();
      }
    }

    ConflictMarker.prototype.installEvents = function() {
      this.editorView.on('editor:display-updated', (function(_this) {
        return function() {
          return _this.remark();
        };
      })(this));
      this.editorView.command('merge-conflicts:accept-current', (function(_this) {
        return function() {
          return _this.acceptCurrent();
        };
      })(this));
      this.editorView.command('merge-conflicts:accept-ours', (function(_this) {
        return function() {
          return _this.acceptOurs();
        };
      })(this));
      this.editorView.command('merge-conflicts:accept-theirs', (function(_this) {
        return function() {
          return _this.acceptTheirs();
        };
      })(this));
      this.editorView.command('merge-conflicts:ours-then-theirs', (function(_this) {
        return function() {
          return _this.acceptOursThenTheirs();
        };
      })(this));
      this.editorView.command('merge-conflicts:theirs-then-ours', (function(_this) {
        return function() {
          return _this.acceptTheirsThenOurs();
        };
      })(this));
      this.editorView.command('merge-conflicts:next-unresolved', (function(_this) {
        return function() {
          return _this.nextUnresolved();
        };
      })(this));
      this.editorView.command('merge-conflicts:previous-unresolved', (function(_this) {
        return function() {
          return _this.previousUnresolved();
        };
      })(this));
      this.editorView.command('merge-conflicts:revert-current', (function(_this) {
        return function() {
          return _this.revertCurrent();
        };
      })(this));
      this.subscribe(atom, 'merge-conflicts:resolved', (function(_this) {
        return function(_arg) {
          var file, resolved, total;
          total = _arg.total, resolved = _arg.resolved, file = _arg.file;
          if (file === _this.editor().getPath() && total === resolved) {
            return _this.conflictsResolved();
          }
        };
      })(this));
      return this.subscribe(this.editorView, 'editor:will-be-removed', (function(_this) {
        return function() {
          return _this.cleanup();
        };
      })(this));
    };

    ConflictMarker.prototype.cleanup = function() {
      var v, _i, _len, _ref;
      this.unsubscribe();
      _ref = this.coveringViews;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        v.remove();
      }
      return this.editorView.removeClass('conflicted');
    };

    ConflictMarker.prototype.conflictsResolved = function() {
      this.cleanup();
      return this.editorView.append(new ResolverView(this.editor()));
    };

    ConflictMarker.prototype.remark = function() {
      this.editorView.renderedLines.children().removeClass(CONFLICT_CLASSES);
      return this.withConflictSideLines(function(lines, classes) {
        return lines.addClass(classes);
      });
    };

    ConflictMarker.prototype.acceptCurrent = function() {
      var duplicates, seen, side, sides, _i, _j, _len, _len1, _results;
      sides = this.active();
      duplicates = [];
      seen = {};
      for (_i = 0, _len = sides.length; _i < _len; _i++) {
        side = sides[_i];
        if (side.conflict in seen) {
          duplicates.push(side);
          duplicates.push(seen[side.conflict]);
        }
        seen[side.conflict] = side;
      }
      sides = _.difference(sides, duplicates);
      _results = [];
      for (_j = 0, _len1 = sides.length; _j < _len1; _j++) {
        side = sides[_j];
        _results.push(side.resolve());
      }
      return _results;
    };

    ConflictMarker.prototype.acceptOurs = function() {
      var side, _i, _len, _ref, _results;
      _ref = this.active();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        side = _ref[_i];
        _results.push(side.conflict.ours.resolve());
      }
      return _results;
    };

    ConflictMarker.prototype.acceptTheirs = function() {
      var side, _i, _len, _ref, _results;
      _ref = this.active();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        side = _ref[_i];
        _results.push(side.conflict.theirs.resolve());
      }
      return _results;
    };

    ConflictMarker.prototype.acceptOursThenTheirs = function() {
      var m, point, side, _i, _len, _ref, _results;
      _ref = this.active();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        side = _ref[_i];
        point = this.combineSides(side.conflict.ours, side.conflict.theirs);
        m = side.conflict.navigator.separatorMarker;
        m.setTailBufferPosition(point);
        _results.push(side.conflict.ours.resolve());
      }
      return _results;
    };

    ConflictMarker.prototype.acceptTheirsThenOurs = function() {
      var m, point, side, _i, _len, _ref, _results;
      _ref = this.active();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        side = _ref[_i];
        point = this.combineSides(side.conflict.theirs, side.conflict.ours);
        m = side.conflict.theirs.refBannerMarker;
        m.setTailBufferPosition(point);
        _results.push(side.conflict.theirs.resolve());
      }
      return _results;
    };

    ConflictMarker.prototype.nextUnresolved = function() {
      var c, final, firstAfter, lastCursor, n, orderedCursors, p, pos, target, _i, _len, _ref;
      final = _.last(this.active());
      if (final != null) {
        n = final.conflict.navigator.nextUnresolved();
        if (n != null) {
          return this.focusConflict(n);
        }
      } else {
        orderedCursors = _.sortBy(this.editor().getCursors(), function(c) {
          return c.getBufferPosition().row;
        });
        lastCursor = _.last(orderedCursors);
        if (lastCursor == null) {
          return;
        }
        pos = lastCursor.getBufferPosition();
        firstAfter = null;
        _ref = this.conflicts;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          p = c.ours.marker.getBufferRange().start;
          if (p.isGreaterThanOrEqual(pos) && (firstAfter == null)) {
            firstAfter = c;
          }
        }
        if (firstAfter == null) {
          return;
        }
        if (firstAfter.isResolved()) {
          target = firstAfter.navigator.nextUnresolved();
        } else {
          target = firstAfter;
        }
        return this.focusConflict(target);
      }
    };

    ConflictMarker.prototype.previousUnresolved = function() {
      var c, firstCursor, initial, lastBefore, orderedCursors, p, pos, target, _i, _len, _ref;
      initial = _.first(this.active());
      if (initial != null) {
        p = initial.conflict.navigator.previousUnresolved();
        if (p != null) {
          return this.focusConflict(p);
        }
      } else {
        orderedCursors = _.sortBy(this.editor().getCursors(), function(c) {
          return c.getBufferPosition().row;
        });
        firstCursor = _.first(orderedCursors);
        if (firstCursor == null) {
          return;
        }
        pos = firstCursor.getBufferPosition();
        lastBefore = null;
        _ref = this.conflicts;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          p = c.ours.marker.getBufferRange().start;
          if (p.isLessThanOrEqual(pos)) {
            lastBefore = c;
          }
        }
        if (lastBefore == null) {
          return;
        }
        if (lastBefore.isResolved()) {
          target = lastBefore.navigator.previousUnresolved();
        } else {
          target = lastBefore;
        }
        return this.focusConflict(target);
      }
    };

    ConflictMarker.prototype.revertCurrent = function() {
      var side, view, _i, _len, _ref, _results;
      _ref = this.active();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        side = _ref[_i];
        _results.push((function() {
          var _j, _len1, _ref1, _results1;
          _ref1 = this.coveringViews;
          _results1 = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            view = _ref1[_j];
            if (view.conflict() === side.conflict) {
              if (view.isDirty()) {
                _results1.push(view.revert());
              } else {
                _results1.push(void 0);
              }
            }
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    ConflictMarker.prototype.active = function() {
      var c, matching, p, positions, _i, _j, _len, _len1, _ref;
      positions = (function() {
        var _i, _len, _ref, _results;
        _ref = this.editor().getCursors();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          _results.push(c.getBufferPosition());
        }
        return _results;
      }).call(this);
      matching = [];
      _ref = this.conflicts;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        for (_j = 0, _len1 = positions.length; _j < _len1; _j++) {
          p = positions[_j];
          if (c.ours.marker.getBufferRange().containsPoint(p)) {
            matching.push(c.ours);
          }
          if (c.theirs.marker.getBufferRange().containsPoint(p)) {
            matching.push(c.theirs);
          }
        }
      }
      return matching;
    };

    ConflictMarker.prototype.editor = function() {
      return this.editorView.getEditor();
    };

    ConflictMarker.prototype.linesForMarker = function(marker) {
      var fromBuffer, fromScreen, high, low, result, row, toBuffer, toScreen, _i, _len, _ref;
      fromBuffer = marker.getTailBufferPosition();
      fromScreen = this.editor().screenPositionForBufferPosition(fromBuffer);
      toBuffer = marker.getHeadBufferPosition();
      toScreen = this.editor().screenPositionForBufferPosition(toBuffer);
      low = this.editorView.getFirstVisibleScreenRow();
      high = this.editorView.getLastVisibleScreenRow();
      result = $();
      _ref = _.range(fromScreen.row, toScreen.row);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        row = _ref[_i];
        if (low <= row && row <= high) {
          result = result.add(this.editorView.lineElementForScreenRow(row));
        }
      }
      return result;
    };

    ConflictMarker.prototype.combineSides = function(first, second) {
      var e, insertPoint, text;
      text = this.editor().getTextInBufferRange(second.marker.getBufferRange());
      e = first.marker.getBufferRange().end;
      insertPoint = this.editor().setTextInBufferRange([e, e], text).end;
      first.marker.setHeadBufferPosition(insertPoint);
      return insertPoint;
    };

    ConflictMarker.prototype.withConflictSideLines = function(callback) {
      var c, _i, _len, _ref, _results;
      _ref = this.conflicts;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        if (c.isResolved()) {
          callback(this.linesForMarker(c.resolution.marker), RESOLVED_CLASSES);
          continue;
        }
        if (c.ours.isDirty) {
          callback(this.linesForMarker(c.ours.marker), DIRTY_CLASSES);
        } else {
          callback(this.linesForMarker(c.ours.marker), OUR_CLASSES);
        }
        if (c.theirs.isDirty) {
          _results.push(callback(this.linesForMarker(c.theirs.marker), DIRTY_CLASSES));
        } else {
          _results.push(callback(this.linesForMarker(c.theirs.marker), THEIR_CLASSES));
        }
      }
      return _results;
    };

    ConflictMarker.prototype.focusConflict = function(conflict) {
      var st;
      st = conflict.ours.marker.getBufferRange().start;
      this.editorView.scrollToBufferPosition(st, {
        center: true
      });
      return this.editor().setCursorBufferPosition(st, {
        autoscroll: false
      });
    };

    return ConflictMarker;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlLQUFBOztBQUFBLEVBQUMsSUFBSyxPQUFBLENBQVEsTUFBUixFQUFMLENBQUQsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FESixDQUFBOztBQUFBLEVBRUMsYUFBYyxPQUFBLENBQVEsVUFBUixFQUFkLFVBRkQsQ0FBQTs7QUFBQSxFQUlBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUpYLENBQUE7O0FBQUEsRUFLQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FMWCxDQUFBOztBQUFBLEVBTUEsY0FBQSxHQUFpQixPQUFBLENBQVEsbUJBQVIsQ0FOakIsQ0FBQTs7QUFBQSxFQU9BLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVIsQ0FQZixDQUFBOztBQUFBLEVBU0EsZ0JBQUEsR0FBbUIsaURBVG5CLENBQUE7O0FBQUEsRUFVQSxXQUFBLEdBQWMsb0JBVmQsQ0FBQTs7QUFBQSxFQVdBLGFBQUEsR0FBZ0Isc0JBWGhCLENBQUE7O0FBQUEsRUFZQSxnQkFBQSxHQUFtQix3QkFabkIsQ0FBQTs7QUFBQSxFQWFBLGFBQUEsR0FBZ0IscUJBYmhCLENBQUE7O0FBQUEsRUFlQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBRUosSUFBQSxVQUFVLENBQUMsV0FBWCxDQUF1QixjQUF2QixDQUFBLENBQUE7O0FBRWEsSUFBQSx3QkFBRSxLQUFGLEVBQVUsVUFBVixHQUFBO0FBQ1gsVUFBQSxpQkFBQTtBQUFBLE1BRFksSUFBQyxDQUFBLFFBQUEsS0FDYixDQUFBO0FBQUEsTUFEb0IsSUFBQyxDQUFBLGFBQUEsVUFDckIsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxRQUFRLENBQUMsR0FBVCxDQUFhLElBQUMsQ0FBQSxLQUFkLEVBQXFC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
//# sourceURL=/Users/daniel/.atom/packages/merge-conflicts/lib/conflict-marker.coffee