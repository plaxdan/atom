(function() {
  var $, Conflict, ConflictMarker, EditorAdapter, NavigationView, ResolverView, SideView, Subscriber, _;

  $ = require('atom').$;

  _ = require('underscore-plus');

  Subscriber = require('emissary').Subscriber;

  Conflict = require('./conflict');

  SideView = require('./side-view');

  NavigationView = require('./navigation-view');

  ResolverView = require('./resolver-view');

  EditorAdapter = require('./editor-adapter').EditorAdapter;

  module.exports = ConflictMarker = (function() {
    Subscriber.includeInto(ConflictMarker);

    function ConflictMarker(state, editorView) {
      var c, cv, _i, _j, _len, _len1, _ref, _ref1;
      this.state = state;
      this.editorView = editorView;
      this.conflicts = Conflict.all(this.state, this.editorView.getModel());
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
        _ref1 = this.coveringViews;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          cv = _ref1[_j];
          cv.decorate();
        }
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
      this.editor().onDidStopChanging((function(_this) {
        return function() {
          return _this.detectDirty();
        };
      })(this));
      this.editor().onDidDestroy((function(_this) {
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
      var c, potentials, v, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _results;
      potentials = [];
      _ref = this.editor().getCursors();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        _ref1 = this.coveringViews;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          v = _ref1[_j];
          if (v.includesCursor(c)) {
            potentials.push(v);
          }
        }
      }
      _ref2 = _.uniq(potentials);
      _results = [];
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        v = _ref2[_k];
        _results.push(v.detectDirty());
      }
      return _results;
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

    ConflictMarker.prototype.focusConflict = function(conflict) {
      var st;
      st = conflict.ours.marker.getBufferRange().start;
      this.editor().scrollToBufferPosition(st, {
        center: true
      });
      return this.editor().setCursorBufferPosition(st, {
        autoscroll: false
      });
    };

    return ConflictMarker;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlHQUFBOztBQUFBLEVBQUMsSUFBSyxPQUFBLENBQVEsTUFBUixFQUFMLENBQUQsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FESixDQUFBOztBQUFBLEVBRUMsYUFBYyxPQUFBLENBQVEsVUFBUixFQUFkLFVBRkQsQ0FBQTs7QUFBQSxFQUlBLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUixDQUpYLENBQUE7O0FBQUEsRUFLQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGFBQVIsQ0FMWCxDQUFBOztBQUFBLEVBTUEsY0FBQSxHQUFpQixPQUFBLENBQVEsbUJBQVIsQ0FOakIsQ0FBQTs7QUFBQSxFQU9BLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVIsQ0FQZixDQUFBOztBQUFBLEVBUUMsZ0JBQWlCLE9BQUEsQ0FBUSxrQkFBUixFQUFqQixhQVJELENBQUE7O0FBQUEsRUFVQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBRUosSUFBQSxVQUFVLENBQUMsV0FBWCxDQUF1QixjQUF2QixDQUFBLENBQUE7O0FBRWEsSUFBQSx3QkFBRSxLQUFGLEVBQVUsVUFBVixHQUFBO0FBQ1gsVUFBQSx1Q0FBQTtBQUFBLE1BRFksSUFBQyxDQUFBLFFBQUEsS0FDYixDQUFBO0FBQUEsTUFEb0IsSUFBQyxDQUFBLGFBQUEsVUFDckIsQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFNBQUQsR0FBYSxRQUFRLENBQUMsR0FBVCxDQUFhLElBQUMsQ0FBQSxLQUFkLEVBQXFCLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBWixDQUFBLENBQXJCLENBQWIsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVyxhQUFhLENBQUMsS0FBZCxDQUFvQixJQUFDLENBQUEsVUFBckIsQ0FEWCxDQUFBO0FBR0EsTUFBQSxJQUFxQyxJQUFDLENBQUEsU0FBdEM7QUFBQSxRQUFBLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBWixDQUFxQixZQUFyQixDQUFBLENBQUE7T0FIQTtBQUFBLE1BS0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsRUFMakIsQ0FBQTtBQU1BO0FBQUEsV0FBQSwyQ0FBQTtxQkFBQTtBQUNFLFFBQUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxJQUFmLENBQXdCLElBQUEsUUFBQSxDQUFTLENBQUMsQ0FBQyxJQUFYLEVBQWlCLElBQUMsQ0FBQSxVQUFsQixDQUF4QixDQUFBLENBQUE7QUFBQSxRQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsSUFBZixDQUF3QixJQUFBLGNBQUEsQ0FBZSxDQUFDLENBQUMsU0FBakIsRUFBNEIsSUFBQyxDQUFBLFVBQTdCLENBQXhCLENBREEsQ0FBQTtBQUFBLFFBRUEsSUFBQyxDQUFBLGFBQWEsQ0FBQyxJQUFmLENBQXdCLElBQUEsUUFBQSxDQUFTLENBQUMsQ0FBQyxNQUFYLEVBQW1CLElBQUMsQ0FBQSxVQUFwQixDQUF4QixDQUZBLENBQUE7QUFBQSxRQUlBLENBQUMsQ0FBQyxFQUFGLENBQUssbUJBQUwsRUFBMEIsQ0FBQSxTQUFBLEtBQUEsR0FBQTtpQkFBQSxTQUFBLEdBQUE7QUFDeEIsZ0JBQUEsdUNBQUE7QUFBQSxZQUFBLFVBQUE7O0FBQWM7QUFBQTttQkFBQSw4Q0FBQTs4QkFBQTtvQkFBK0IsQ0FBQSxDQUFLLENBQUMsUUFBRixDQUFBLENBQVksQ0FBQyxVQUFiLENBQUE7QUFBbkMsZ0NBQUEsRUFBQTtpQkFBQTtBQUFBOzswQkFBZCxDQUFBO0FBQ0EsaUJBQUEsbURBQUE7aUNBQUE7QUFBQSxjQUFBLENBQUMsQ0FBQyxVQUFGLENBQUEsQ0FBQSxDQUFBO0FBQUEsYUFEQTtBQUFBLFlBRUEsYUFBQSxHQUFnQixLQUFDLENBQUEsU0FBUyxDQUFDLE1BQVgsR0FBb0IsSUFBSSxDQUFDLEtBQUwsQ0FBVyxVQUFVLENBQUMsTUFBWCxHQUFvQixDQUEvQixDQUZwQyxDQUFBO21CQUdBLElBQUksQ0FBQyxJQUFMLENBQVUsMEJBQVYsRUFDRTtBQUFBLGNBQUEsSUFBQSxFQUFNLEtBQUMsQ0FBQSxNQUFELENBQUEsQ0FBUyxDQUFDLE9BQVYsQ0FBQSxDQUFOO0FBQUEsY0FDQSxLQUFBLEVBQU8sS0FBQyxDQUFBLFNBQVMsQ0FBQyxNQURsQjtBQUFBLGNBQzBCLFFBQUEsRUFBVSxhQURwQztBQUFBLGNBRUEsTUFBQSxFQUFRLEtBRlI7YUFERixFQUp3QjtVQUFBLEVBQUE7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFCLENBSkEsQ0FERjtBQUFBLE9BTkE7QUFvQkEsTUFBQSxJQUFHLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBWCxHQUFvQixDQUF2QjtBQUNFO0FBQUEsYUFBQSw4Q0FBQTt5QkFBQTtBQUFBLFVBQUEsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLENBQUE7QUFBQSxTQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsYUFBRCxDQUFBLENBREEsQ0FBQTtBQUFBLFFBRUEsSUFBQyxDQUFBLGFBQUQsQ0FBZSxJQUFDLENBQUEsU0FBVSxDQUFBLENBQUEsQ0FBMUIsQ0FGQSxDQURGO09BQUEsTUFBQTtBQUtFLFFBQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSwwQkFBVixFQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFTLENBQUMsT0FBVixDQUFBLENBQU47QUFBQSxVQUNBLEtBQUEsRUFBTyxDQURQO0FBQUEsVUFDVSxRQUFBLEVBQVUsQ0FEcEI7QUFBQSxVQUVBLE1BQUEsRUFBUSxJQUZSO1NBREYsQ0FBQSxDQUFBO0FBQUEsUUFJQSxJQUFDLENBQUEsaUJBQUQsQ0FBQSxDQUpBLENBTEY7T0FyQlc7SUFBQSxDQUZiOztBQUFBLDZCQWtDQSxhQUFBLEdBQWUsU0FBQSxHQUFBO0FBQ2IsTUFBQSxJQUFDLENBQUEsTUFBRCxDQUFBLENBQVMsQ0FBQyxpQkFBVixDQUE0QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxXQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVCLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFTLENBQUMsWUFBVixDQUF1QixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxPQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXZCLENBREEsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQW9CLGdDQUFwQixFQUFzRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxhQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRELENBSEEsQ0FBQTtBQUFBLE1BSUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQW9CLDZCQUFwQixFQUFtRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxVQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5ELENBSkEsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQW9CLCtCQUFwQixFQUFxRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxZQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXJELENBTEEsQ0FBQTtBQUFBLE1BTUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQW9CLGtDQUFwQixFQUF3RCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxvQkFBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4RCxDQU5BLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxVQUFVLENBQUMsT0FBWixDQUFvQixrQ0FBcEIsRUFBd0QsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsb0JBQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEQsQ0FQQSxDQUFBO0FBQUEsTUFRQSxJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBb0IsaUNBQXBCLEVBQXVELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLGNBQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBdkQsQ0FSQSxDQUFBO0FBQUEsTUFTQSxJQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBb0IscUNBQXBCLEVBQTJELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLGtCQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNELENBVEEsQ0FBQTtBQUFBLE1BVUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQW9CLGdDQUFwQixFQUFzRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxhQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRELENBVkEsQ0FBQTthQVlBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBWCxFQUFpQiwwQkFBakIsRUFBNkMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsSUFBRCxHQUFBO0FBQzNDLGNBQUEscUJBQUE7QUFBQSxVQUQ2QyxhQUFBLE9BQU8sZ0JBQUEsVUFBVSxZQUFBLElBQzlELENBQUE7QUFBQSxVQUFBLElBQUcsSUFBQSxLQUFRLEtBQUMsQ0FBQSxNQUFELENBQUEsQ0FBUyxDQUFDLE9BQVYsQ0FBQSxDQUFSLElBQWdDLEtBQUEsS0FBUyxRQUE1QzttQkFDRSxLQUFDLENBQUEsaUJBQUQsQ0FBQSxFQURGO1dBRDJDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0MsRUFiYTtJQUFBLENBbENmLENBQUE7O0FBQUEsNkJBbURBLE9BQUEsR0FBUyxTQUFBLEdBQUE7QUFDUCxVQUFBLGlCQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsV0FBRCxDQUFBLENBQUEsQ0FBQTtBQUNBO0FBQUEsV0FBQSwyQ0FBQTtxQkFBQTtBQUFBLFFBQUEsQ0FBQyxDQUFDLE1BQUYsQ0FBQSxDQUFBLENBQUE7QUFBQSxPQURBO2FBRUEsSUFBQyxDQUFBLFVBQVUsQ0FBQyxXQUFaLENBQXdCLFlBQXhCLEVBSE87SUFBQSxDQW5EVCxDQUFBOztBQUFBLDZCQXdEQSxpQkFBQSxHQUFtQixTQUFBLEdBQUE7QUFDakIsTUFBQSxJQUFDLENBQUEsT0FBRCxDQUFBLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsTUFBWixDQUF1QixJQUFBLFlBQUEsQ0FBYSxJQUFDLENBQUEsTUFBRCxDQUFBLENBQWIsQ0FBdkIsRUFGaUI7SUFBQSxDQXhEbkIsQ0FBQTs7QUFBQSw2QkE0REEsV0FBQSxHQUFhLFNBQUEsR0FBQTtBQUVYLFVBQUEsOEVBQUE7QUFBQSxNQUFBLFVBQUEsR0FBYSxFQUFiLENBQUE7QUFDQTtBQUFBLFdBQUEsMkNBQUE7cUJBQUE7QUFDRTtBQUFBLGFBQUEsOENBQUE7d0JBQUE7QUFDRSxVQUFBLElBQXNCLENBQUMsQ0FBQyxjQUFGLENBQWlCLENBQWpCLENBQXRCO0FBQUEsWUFBQSxVQUFVLENBQUMsSUFBWCxDQUFnQixDQUFoQixDQUFBLENBQUE7V0FERjtBQUFBLFNBREY7QUFBQSxPQURBO0FBS0E7QUFBQTtXQUFBLDhDQUFBO3NCQUFBO0FBQUEsc0JBQUEsQ0FBQyxDQUFDLFdBQUYsQ0FBQSxFQUFBLENBQUE7QUFBQTtzQkFQVztJQUFBLENBNURiLENBQUE7O0FBQUEsNkJBcUVBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFDYixVQUFBLDREQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFSLENBQUE7QUFBQSxNQUdBLFVBQUEsR0FBYSxFQUhiLENBQUE7QUFBQSxNQUlBLElBQUEsR0FBTyxFQUpQLENBQUE7QUFLQSxXQUFBLDRDQUFBO3lCQUFBO0FBQ0UsUUFBQSxJQUFHLElBQUksQ0FBQyxRQUFMLElBQWlCLElBQXBCO0FBQ0UsVUFBQSxVQUFVLENBQUMsSUFBWCxDQUFnQixJQUFoQixDQUFBLENBQUE7QUFBQSxVQUNBLFVBQVUsQ0FBQyxJQUFYLENBQWdCLElBQUssQ0FBQSxJQUFJLENBQUMsUUFBTCxDQUFyQixDQURBLENBREY7U0FBQTtBQUFBLFFBR0EsSUFBSyxDQUFBLElBQUksQ0FBQyxRQUFMLENBQUwsR0FBc0IsSUFIdEIsQ0FERjtBQUFBLE9BTEE7QUFBQSxNQVVBLEtBQUEsR0FBUSxDQUFDLENBQUMsVUFBRixDQUFhLEtBQWIsRUFBb0IsVUFBcEIsQ0FWUixDQUFBO0FBWUE7V0FBQSw4Q0FBQTt5QkFBQTtBQUFBLHNCQUFBLElBQUksQ0FBQyxPQUFMLENBQUEsRUFBQSxDQUFBO0FBQUE7c0JBYmE7SUFBQSxDQXJFZixDQUFBOztBQUFBLDZCQW9GQSxVQUFBLEdBQVksU0FBQSxHQUFBO0FBQUcsVUFBQSw4QkFBQTtBQUFBO0FBQUE7V0FBQSwyQ0FBQTt3QkFBQTtBQUFBLHNCQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQW5CLENBQUEsRUFBQSxDQUFBO0FBQUE7c0JBQUg7SUFBQSxDQXBGWixDQUFBOztBQUFBLDZCQXNGQSxZQUFBLEdBQWMsU0FBQSxHQUFBO0FBQUcsVUFBQSw4QkFBQTtBQUFBO0FBQUE7V0FBQSwyQ0FBQTt3QkFBQTtBQUFBLHNCQUFBLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQXJCLENBQUEsRUFBQSxDQUFBO0FBQUE7c0JBQUg7SUFBQSxDQXRGZCxDQUFBOztBQUFBLDZCQXdGQSxvQkFBQSxHQUFzQixTQUFBLEdBQUE7QUFDcEIsVUFBQSw4QkFBQTtBQUFBO0FBQUE7V0FBQSwyQ0FBQTt3QkFBQTtBQUNFLHNCQUFBLElBQUMsQ0FBQSxZQUFELENBQWMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUE1QixFQUFrQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQWhELEVBQUEsQ0FERjtBQUFBO3NCQURvQjtJQUFBLENBeEZ0QixDQUFBOztBQUFBLDZCQTRGQSxvQkFBQSxHQUFzQixTQUFBLEdBQUE7QUFDcEIsVUFBQSw4QkFBQTtBQUFBO0FBQUE7V0FBQSwyQ0FBQTt3QkFBQTtBQUNFLHNCQUFBLElBQUMsQ0FBQSxZQUFELENBQWMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUE1QixFQUFvQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQWxELEVBQUEsQ0FERjtBQUFBO3NCQURvQjtJQUFBLENBNUZ0QixDQUFBOztBQUFBLDZCQWdHQSxjQUFBLEdBQWdCLFNBQUEsR0FBQTtBQUNkLFVBQUEsbUZBQUE7QUFBQSxNQUFBLEtBQUEsR0FBUSxDQUFDLENBQUMsSUFBRixDQUFPLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBUCxDQUFSLENBQUE7QUFDQSxNQUFBLElBQUcsYUFBSDtBQUNFLFFBQUEsQ0FBQSxHQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLGNBQXpCLENBQUEsQ0FBSixDQUFBO0FBQ0EsUUFBQSxJQUFxQixTQUFyQjtpQkFBQSxJQUFDLENBQUEsYUFBRCxDQUFlLENBQWYsRUFBQTtTQUZGO09BQUEsTUFBQTtBQUlFLFFBQUEsY0FBQSxHQUFpQixDQUFDLENBQUMsTUFBRixDQUFTLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBUyxDQUFDLFVBQVYsQ0FBQSxDQUFULEVBQWlDLFNBQUMsQ0FBRCxHQUFBO2lCQUNoRCxDQUFDLENBQUMsaUJBQUYsQ0FBQSxDQUFxQixDQUFDLElBRDBCO1FBQUEsQ0FBakMsQ0FBakIsQ0FBQTtBQUFBLFFBRUEsVUFBQSxHQUFhLENBQUMsQ0FBQyxJQUFGLENBQU8sY0FBUCxDQUZiLENBQUE7QUFHQSxRQUFBLElBQWMsa0JBQWQ7QUFBQSxnQkFBQSxDQUFBO1NBSEE7QUFBQSxRQUtBLEdBQUEsR0FBTSxVQUFVLENBQUMsaUJBQVgsQ0FBQSxDQUxOLENBQUE7QUFBQSxRQU1BLFVBQUEsR0FBYSxJQU5iLENBQUE7QUFPQTtBQUFBLGFBQUEsMkNBQUE7dUJBQUE7QUFDRSxVQUFBLENBQUEsR0FBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFkLENBQUEsQ0FBOEIsQ0FBQyxLQUFuQyxDQUFBO0FBQ0EsVUFBQSxJQUFHLENBQUMsQ0FBQyxvQkFBRixDQUF1QixHQUF2QixDQUFBLElBQW9DLG9CQUF2QztBQUNFLFlBQUEsVUFBQSxHQUFhLENBQWIsQ0FERjtXQUZGO0FBQUEsU0FQQTtBQVdBLFFBQUEsSUFBYyxrQkFBZDtBQUFBLGdCQUFBLENBQUE7U0FYQTtBQWFBLFFBQUEsSUFBRyxVQUFVLENBQUMsVUFBWCxDQUFBLENBQUg7QUFDRSxVQUFBLE1BQUEsR0FBUyxVQUFVLENBQUMsU0FBUyxDQUFDLGNBQXJCLENBQUEsQ0FBVCxDQURGO1NBQUEsTUFBQTtBQUdFLFVBQUEsTUFBQSxHQUFTLFVBQVQsQ0FIRjtTQWJBO2VBaUJBLElBQUMsQ0FBQSxhQUFELENBQWUsTUFBZixFQXJCRjtPQUZjO0lBQUEsQ0FoR2hCLENBQUE7O0FBQUEsNkJBeUhBLGtCQUFBLEdBQW9CLFNBQUEsR0FBQTtBQUNsQixVQUFBLG1GQUFBO0FBQUEsTUFBQSxPQUFBLEdBQVUsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxJQUFDLENBQUEsTUFBRCxDQUFBLENBQVIsQ0FBVixDQUFBO0FBQ0EsTUFBQSxJQUFHLGVBQUg7QUFDRSxRQUFBLENBQUEsR0FBSSxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxrQkFBM0IsQ0FBQSxDQUFKLENBQUE7QUFDQSxRQUFBLElBQXFCLFNBQXJCO2lCQUFBLElBQUMsQ0FBQSxhQUFELENBQWUsQ0FBZixFQUFBO1NBRkY7T0FBQSxNQUFBO0FBSUUsUUFBQSxjQUFBLEdBQWlCLENBQUMsQ0FBQyxNQUFGLENBQVMsSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFTLENBQUMsVUFBVixDQUFBLENBQVQsRUFBaUMsU0FBQyxDQUFELEdBQUE7aUJBQ2hELENBQUMsQ0FBQyxpQkFBRixDQUFBLENBQXFCLENBQUMsSUFEMEI7UUFBQSxDQUFqQyxDQUFqQixDQUFBO0FBQUEsUUFFQSxXQUFBLEdBQWMsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxjQUFSLENBRmQsQ0FBQTtBQUdBLFFBQUEsSUFBYyxtQkFBZDtBQUFBLGdCQUFBLENBQUE7U0FIQTtBQUFBLFFBS0EsR0FBQSxHQUFNLFdBQVcsQ0FBQyxpQkFBWixDQUFBLENBTE4sQ0FBQTtBQUFBLFFBTUEsVUFBQSxHQUFhLElBTmIsQ0FBQTtBQU9BO0FBQUEsYUFBQSwyQ0FBQTt1QkFBQTtBQUNFLFVBQUEsQ0FBQSxHQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWQsQ0FBQSxDQUE4QixDQUFDLEtBQW5DLENBQUE7QUFDQSxVQUFBLElBQUcsQ0FBQyxDQUFDLGlCQUFGLENBQW9CLEdBQXBCLENBQUg7QUFDRSxZQUFBLFVBQUEsR0FBYSxDQUFiLENBREY7V0FGRjtBQUFBLFNBUEE7QUFXQSxRQUFBLElBQWMsa0JBQWQ7QUFBQSxnQkFBQSxDQUFBO1NBWEE7QUFhQSxRQUFBLElBQUcsVUFBVSxDQUFDLFVBQVgsQ0FBQSxDQUFIO0FBQ0UsVUFBQSxNQUFBLEdBQVMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxrQkFBckIsQ0FBQSxDQUFULENBREY7U0FBQSxNQUFBO0FBR0UsVUFBQSxNQUFBLEdBQVMsVUFBVCxDQUhGO1NBYkE7ZUFpQkEsSUFBQyxDQUFBLGFBQUQsQ0FBZSxNQUFmLEVBckJGO09BRmtCO0lBQUEsQ0F6SHBCLENBQUE7O0FBQUEsNkJBa0pBLGFBQUEsR0FBZSxTQUFBLEdBQUE7QUFDYixVQUFBLG9DQUFBO0FBQUE7QUFBQTtXQUFBLDJDQUFBO3dCQUFBO0FBQ0U7O0FBQUE7QUFBQTtlQUFBLDhDQUFBOzZCQUFBO2dCQUFnQyxJQUFJLENBQUMsUUFBTCxDQUFBLENBQUEsS0FBbUIsSUFBSSxDQUFDO0FBQ3RELGNBQUEsSUFBaUIsSUFBSSxDQUFDLE9BQUwsQ0FBQSxDQUFqQjsrQkFBQSxJQUFJLENBQUMsTUFBTCxDQUFBLEdBQUE7ZUFBQSxNQUFBO3VDQUFBOzthQURGO0FBQUE7O3NCQUFBLENBREY7QUFBQTtzQkFEYTtJQUFBLENBbEpmLENBQUE7O0FBQUEsNkJBdUpBLE1BQUEsR0FBUSxTQUFBLEdBQUE7QUFDTixVQUFBLG9EQUFBO0FBQUEsTUFBQSxTQUFBOztBQUFhO0FBQUE7YUFBQSwyQ0FBQTt1QkFBQTtBQUFBLHdCQUFBLENBQUMsQ0FBQyxpQkFBRixDQUFBLEVBQUEsQ0FBQTtBQUFBOzttQkFBYixDQUFBO0FBQUEsTUFDQSxRQUFBLEdBQVcsRUFEWCxDQUFBO0FBRUE7QUFBQSxXQUFBLDJDQUFBO3FCQUFBO0FBQ0UsYUFBQSxrREFBQTs0QkFBQTtBQUNFLFVBQUEsSUFBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFkLENBQUEsQ0FBOEIsQ0FBQyxhQUEvQixDQUE2QyxDQUE3QyxDQUFIO0FBQ0UsWUFBQSxRQUFRLENBQUMsSUFBVCxDQUFjLENBQUMsQ0FBQyxJQUFoQixDQUFBLENBREY7V0FBQTtBQUVBLFVBQUEsSUFBRyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxjQUFoQixDQUFBLENBQWdDLENBQUMsYUFBakMsQ0FBK0MsQ0FBL0MsQ0FBSDtBQUNFLFlBQUEsUUFBUSxDQUFDLElBQVQsQ0FBYyxDQUFDLENBQUMsTUFBaEIsQ0FBQSxDQURGO1dBSEY7QUFBQSxTQURGO0FBQUEsT0FGQTthQVFBLFNBVE07SUFBQSxDQXZKUixDQUFBOztBQUFBLDZCQWtLQSxNQUFBLEdBQVEsU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLFVBQVUsQ0FBQyxTQUFaLENBQUEsRUFBSDtJQUFBLENBbEtSLENBQUE7O0FBQUEsNkJBb0tBLGNBQUEsR0FBZ0IsU0FBQyxNQUFELEdBQUE7YUFBWSxJQUFDLENBQUEsT0FBTyxDQUFDLGNBQVQsQ0FBd0IsTUFBeEIsRUFBWjtJQUFBLENBcEtoQixDQUFBOztBQUFBLDZCQXNLQSxZQUFBLEdBQWMsU0FBQyxLQUFELEVBQVEsTUFBUixHQUFBO0FBQ1osVUFBQSxvQkFBQTtBQUFBLE1BQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBUyxDQUFDLG9CQUFWLENBQStCLE1BQU0sQ0FBQyxNQUFNLENBQUMsY0FBZCxDQUFBLENBQS9CLENBQVAsQ0FBQTtBQUFBLE1BQ0EsQ0FBQSxHQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsY0FBYixDQUFBLENBQTZCLENBQUMsR0FEbEMsQ0FBQTtBQUFBLE1BRUEsV0FBQSxHQUFjLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBUyxDQUFDLG9CQUFWLENBQStCLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBL0IsRUFBdUMsSUFBdkMsQ0FBNEMsQ0FBQyxHQUYzRCxDQUFBO0FBQUEsTUFHQSxLQUFLLENBQUMsTUFBTSxDQUFDLHFCQUFiLENBQW1DLFdBQW5DLENBSEEsQ0FBQTtBQUFBLE1BSUEsS0FBSyxDQUFDLGVBQWUsQ0FBQyxxQkFBdEIsQ0FBNEMsV0FBNUMsQ0FKQSxDQUFBO2FBS0EsS0FBSyxDQUFDLE9BQU4sQ0FBQSxFQU5ZO0lBQUEsQ0F0S2QsQ0FBQTs7QUFBQSw2QkE4S0EsYUFBQSxHQUFlLFNBQUMsUUFBRCxHQUFBO0FBQ2IsVUFBQSxFQUFBO0FBQUEsTUFBQSxFQUFBLEdBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBckIsQ0FBQSxDQUFxQyxDQUFDLEtBQTNDLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FBUyxDQUFDLHNCQUFWLENBQWlDLEVBQWpDLEVBQXFDO0FBQUEsUUFBQSxNQUFBLEVBQVEsSUFBUjtPQUFyQyxDQURBLENBQUE7YUFFQSxJQUFDLENBQUEsTUFBRCxDQUFBLENBQVMsQ0FBQyx1QkFBVixDQUFrQyxFQUFsQyxFQUFzQztBQUFBLFFBQUEsVUFBQSxFQUFZLEtBQVo7T0FBdEMsRUFIYTtJQUFBLENBOUtmLENBQUE7OzBCQUFBOztNQWJGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/merge-conflicts/lib/conflict-marker.coffee