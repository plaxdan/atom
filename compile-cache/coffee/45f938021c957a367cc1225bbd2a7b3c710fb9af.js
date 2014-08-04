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
      this.subscribe(this.editor(), 'contents-modified', (function(_this) {
        return function() {
          return _this.detectDirty();
        };
      })(this));
      this.subscribe(this.editorView, 'editor:display-updated', (function(_this) {
        return function() {
          return _this.remark();
        };
      })(this));
      this.subscribe(this.editorView, 'editor:will-be-removed', (function(_this) {
        return function() {
          return _this.cleanup();
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
      return this.subscribe(atom, 'merge-conflicts:resolved', (function(_this) {
        return function(_arg) {
          var file, resolved, total;
          total = _arg.total, resolved = _arg.resolved, file = _arg.file;
          if (file === _this.editor().getPath() && total === resolved) {
            return _this.conflictsResolved();
          }
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

    ConflictMarker.prototype.detectDirty = function() {
      var v, _i, _len, _ref;
      _ref = this.coveringViews;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        v.detectDirty();
      }
      return this.remark();
    };

    ConflictMarker.prototype.remark = function() {
      this.adapter.linesElement().children('.line').removeClass(CONFLICT_CLASSES);
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
      var side, _i, _len, _ref, _results;
      _ref = this.active();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        side = _ref[_i];
        _results.push(this.combineSides(side.conflict.ours, side.conflict.theirs));
      }
      return _results;
    };

    ConflictMarker.prototype.acceptTheirsThenOurs = function() {
      var side, _i, _len, _ref, _results;
      _ref = this.active();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        side = _ref[_i];
        _results.push(this.combineSides(side.conflict.theirs, side.conflict.ours));
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
      first.followingMarker.setTailBufferPosition(insertPoint);
      return first.resolve();
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