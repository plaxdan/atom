(function() {
  var $, CONFLICT_CLASSES, Conflict, ConflictMarker, DIRTY_CLASSES, EditorAdapter, NavigationView, OUR_CLASSES, RESOLVED_CLASSES, ResolverView, SideView, Subscriber, THEIR_CLASSES, _;

  $ = require('atom').$;

  _ = require('underscore-plus');

  Subscriber = require('emissary').Subscriber;

  Conflict = require('./conflict');

  SideView = require('./side-view');

  NavigationView = require('./navigation-view');

  ResolverView = require('./resolver-view');

  EditorAdapter = require('./editor-adapter').EditorAdapter;

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
      this.adapter = EditorAdapter.adapt(this.editorView);
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
        atom.emit('merge-conflicts:resolved', {
          file: this.editor().getPath(),
          total: 1,
          resolved: 1,
          source: this
        });
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
      this.adapter.linesElement().children().removeClass(CONFLICT_CLASSES);
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
      return this.adapter.linesForMarker(marker);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdMQUFBOztBQUFBLEVBQUMsSUFBSyxPQUFBLENBQVEsTUFBUixFQUFMLENBQUQsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FESixDQUFBOztBQUFBLEVBRUMsYUFBYyxPQUFBLENBQVEsVUFBUixFQUFkLFVBRkQsQ0FBQTs7QUFBQSxFQUlBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUpYLENBQUE7O0FBQUEsRUFLQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FMWCxDQUFBOztBQUFBLEVBTUEsY0FBQSxHQUFpQixPQUFBLENBQVEsbUJBQVIsQ0FOakIsQ0FBQTs7QUFBQSxFQU9BLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVIsQ0FQZixDQUFBOztBQUFBLEVBUUMsZ0JBQWlCLE9BQUEsQ0FBUSxrQkFBUixFQUFqQixhQVJELENBQUE7O0FBQUEsRUFVQSxnQkFBQSxHQUFtQixpREFWbkIsQ0FBQTs7QUFBQSxFQVdBLFdBQUEsR0FBYyxvQkFYZCxDQUFBOztBQUFBLEVBWUEsYUFBQSxHQUFnQixzQkFaaEIsQ0FBQTs7QUFBQSxFQWFBLGdCQUFBLEdBQW1CLHdCQWJuQixDQUFBOztBQUFBLEVBY0EsYUFBQSxHQUFnQixxQkFkaEIsQ0FBQTs7QUFBQSxFQWdCQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBRUosSUFBQSxVQUFVLENBQUMsV0FBWCxDQUF1QixjQUF2QixDQUFBLENBQUE7O0FBRWEsSUFBQSx3QkFBRSxLQUFGLEVBQVUsVUFBVixHQUFBO0FBQ1gsVUFBQSxpQkFBQTtBQUFBLE1BRFksSUFBQyxDQUFBLFFBQUEsS0FDYixDQUFBO0FBQUEsTUFEb0IsSUFBQyxDQUFBLGFBQUEsVUFDckIsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFB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
//# sourceURL=/Users/daniel/.atom/packages/merge-conflicts/lib/conflict-marker.coffee