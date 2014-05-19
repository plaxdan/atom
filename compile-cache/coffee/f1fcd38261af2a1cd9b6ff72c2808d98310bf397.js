(function() {
  var $, ConflictMarker, GitBridge, MaybeLaterView, MergeConflictsView, MergeState, NothingToMergeView, Subscriber, SuccessView, View, path, _, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), $ = _ref.$, View = _ref.View;

  _ = require('underscore-plus');

  path = require('path');

  Subscriber = require('emissary').Subscriber;

  GitBridge = require('./git-bridge');

  MergeState = require('./merge-state');

  ConflictMarker = require('./conflict-marker');

  _ref1 = require('./message-views'), SuccessView = _ref1.SuccessView, MaybeLaterView = _ref1.MaybeLaterView, NothingToMergeView = _ref1.NothingToMergeView;

  module.exports = MergeConflictsView = (function(_super) {
    __extends(MergeConflictsView, _super);

    function MergeConflictsView() {
      return MergeConflictsView.__super__.constructor.apply(this, arguments);
    }

    Subscriber.includeInto(MergeConflictsView);

    MergeConflictsView.content = function(state) {
      return this.div({
        "class": 'merge-conflicts tool-panel panel-bottom padded'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'panel-heading'
          }, function() {
            _this.text('Conflicts');
            _this.span({
              "class": 'pull-right icon icon-fold',
              click: 'minimize'
            }, 'Hide');
            return _this.span({
              "class": 'pull-right icon icon-unfold',
              click: 'restore'
            }, 'Show');
          });
          return _this.div({
            outlet: 'body'
          }, function() {
            _this.ul({
              "class": 'block list-group',
              outlet: 'pathList'
            }, function() {
              var p, _i, _len, _ref2, _results;
              _ref2 = state.conflicts;
              _results = [];
              for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                p = _ref2[_i];
                _results.push(_this.li({
                  click: 'navigate',
                  "class": 'list-item navigate'
                }, function() {
                  _this.span({
                    "class": 'inline-block icon icon-diff-modified status-modified path'
                  }, p);
                  return _this.div({
                    "class": 'pull-right'
                  }, function() {
                    _this.span({
                      "class": 'inline-block text-subtle'
                    }, "modified by both");
                    _this.progress({
                      "class": 'inline-block',
                      max: 100,
                      value: 0
                    });
                    return _this.span({
                      "class": 'inline-block icon icon-dash staged'
                    });
                  });
                }));
              }
              return _results;
            });
            return _this.div({
              "class": 'block pull-right'
            }, function() {
              return _this.button({
                "class": 'btn btn-sm',
                click: 'quit'
              }, 'Quit');
            });
          });
        };
      })(this));
    };

    MergeConflictsView.prototype.initialize = function(state) {
      this.state = state;
      this.markers = [];
      this.editorSub = null;
      this.subscribe(atom, 'merge-conflicts:resolved', (function(_this) {
        return function(event) {
          var p, progress;
          p = atom.project.getRepo().relativize(event.file);
          progress = _this.pathList.find("li:contains('" + p + "') progress")[0];
          if (progress != null) {
            progress.max = event.total;
            return progress.value = event.resolved;
          } else {
            return console.log("Unrecognized conflict path: " + p);
          }
        };
      })(this));
      this.subscribe(atom, 'merge-conflicts:staged', (function(_this) {
        return function() {
          return _this.refresh();
        };
      })(this));
      this.command('merge-conflicts:entire-file-ours', this.sideResolver('ours'));
      return this.command('merge-conflicts:entire-file-theirs', this.sideResolver('theirs'));
    };

    MergeConflictsView.prototype.navigate = function(event, element) {
      var fullPath, repoPath;
      repoPath = element.find(".path").text();
      fullPath = path.join(atom.project.getRepo().getWorkingDirectory(), repoPath);
      return atom.workspace.open(fullPath);
    };

    MergeConflictsView.prototype.minimize = function() {
      this.addClass('minimized');
      return this.body.hide('fast');
    };

    MergeConflictsView.prototype.restore = function() {
      this.removeClass('minimized');
      return this.body.show('fast');
    };

    MergeConflictsView.prototype.quit = function() {
      atom.emit('merge-conflicts:quit');
      return this.finish(MaybeLaterView);
    };

    MergeConflictsView.prototype.refresh = function() {
      return this.state.reread((function(_this) {
        return function() {
          var icon, item, p, _i, _len, _ref2;
          _ref2 = _this.pathList.find('li');
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            item = _ref2[_i];
            p = $(item).find('.path').text();
            icon = $(item).find('.staged');
            icon.removeClass('icon-dash icon-check text-success');
            if (_.contains(_this.state.conflicts, p)) {
              icon.addClass('icon-dash');
            } else {
              icon.addClass('icon-check text-success');
            }
          }
          if (_this.state.isEmpty()) {
            atom.emit('merge-conflicts:done');
            return _this.finish(SuccessView);
          }
        };
      })(this));
    };

    MergeConflictsView.prototype.finish = function(viewClass) {
      var m, _i, _len, _ref2;
      this.unsubscribe();
      _ref2 = this.markers;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        m = _ref2[_i];
        m.cleanup();
      }
      this.markers = [];
      this.editorSub.off();
      this.hide('fast', (function(_this) {
        return function() {
          MergeConflictsView.instance = null;
          return _this.remove();
        };
      })(this));
      return atom.workspaceView.appendToTop(new viewClass(this.state));
    };

    MergeConflictsView.prototype.sideResolver = function(side) {
      return function(event) {
        var p;
        p = $(event.target).find('.path').text();
        return GitBridge.checkoutSide(side, p, function() {
          var full;
          full = path.join(atom.project.path, p);
          atom.emit('merge-conflicts:resolved', {
            file: full,
            total: 1,
            resolved: 1
          });
          return atom.workspace.open(p);
        });
      };
    };

    MergeConflictsView.prototype.instance = null;

    MergeConflictsView.detect = function() {
      if (!atom.project.getRepo()) {
        return;
      }
      if (this.instance != null) {
        return;
      }
      return MergeState.read((function(_this) {
        return function(state) {
          var view;
          if (!state.isEmpty()) {
            view = new MergeConflictsView(state);
            _this.instance = view;
            atom.workspaceView.appendToBottom(view);
            return _this.instance.editorSub = atom.workspaceView.eachEditorView(function(view) {
              var marker;
              if (view.attached && (view.getPane() != null)) {
                marker = _this.markConflictsIn(state, view);
                if (marker != null) {
                  return _this.instance.markers.push(marker);
                }
              }
            });
          } else {
            return atom.workspaceView.appendToTop(new NothingToMergeView(state));
          }
        };
      })(this));
    };

    MergeConflictsView.markConflictsIn = function(state, editorView) {
      var fullPath, repoPath;
      if (state.isEmpty()) {
        return;
      }
      fullPath = editorView.getEditor().getPath();
      repoPath = atom.project.getRepo().relativize(fullPath);
      if (!_.contains(state.conflicts, repoPath)) {
        return;
      }
      return new ConflictMarker(state, editorView);
    };

    return MergeConflictsView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFKQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUFZLE9BQUEsQ0FBUSxNQUFSLENBQVosRUFBQyxTQUFBLENBQUQsRUFBSSxZQUFBLElBQUosQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVIsQ0FESixDQUFBOztBQUFBLEVBRUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRlAsQ0FBQTs7QUFBQSxFQUdDLGFBQWMsT0FBQSxDQUFRLFVBQVIsRUFBZCxVQUhELENBQUE7O0FBQUEsRUFLQSxTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVIsQ0FMWixDQUFBOztBQUFBLEVBTUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSLENBTmIsQ0FBQTs7QUFBQSxFQU9BLGNBQUEsR0FBaUIsT0FBQSxDQUFRLG1CQUFSLENBUGpCLENBQUE7O0FBQUEsRUFRQSxRQUFvRCxPQUFBLENBQVEsaUJBQVIsQ0FBcEQsRUFBQyxvQkFBQSxXQUFELEVBQWMsdUJBQUEsY0FBZCxFQUE4QiwyQkFBQSxrQkFSOUIsQ0FBQTs7QUFBQSxFQVVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFFSix5Q0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxVQUFVLENBQUMsV0FBWCxDQUF1QixrQkFBdkIsQ0FBQSxDQUFBOztBQUFBLElBRUEsa0JBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxLQUFELEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sZ0RBQVA7T0FBTCxFQUE4RCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQzVELFVBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsT0FBQSxFQUFPLGVBQVA7V0FBTCxFQUE2QixTQUFBLEdBQUE7QUFDM0IsWUFBQSxLQUFDLENBQUEsSUFBRCxDQUFNLFdBQU4sQ0FBQSxDQUFBO0FBQUEsWUFDQSxLQUFDLENBQUEsSUFBRCxDQUFNO0FBQUEsY0FBQSxPQUFBLEVBQU8sMkJBQVA7QUFBQSxjQUFvQyxLQUFBLEVBQU8sVUFBM0M7YUFBTixFQUE2RCxNQUE3RCxDQURBLENBQUE7bUJBRUEsS0FBQyxDQUFBLElBQUQsQ0FBTTtBQUFBLGNBQUEsT0FBQSxFQUFPLDZCQUFQO0FBQUEsY0FBc0MsS0FBQSxFQUFPLFNBQTdDO2FBQU4sRUFBOEQsTUFBOUQsRUFIMkI7VUFBQSxDQUE3QixDQUFBLENBQUE7aUJBSUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsTUFBQSxFQUFRLE1BQVI7V0FBTCxFQUFxQixTQUFBLEdBQUE7QUFDbkIsWUFBQSxLQUFDLENBQUEsRUFBRCxDQUFJO0FBQUEsY0FBQSxPQUFBLEVBQU8sa0JBQVA7QUFBQSxjQUEyQixNQUFBLEVBQVEsVUFBbkM7YUFBSixFQUFtRCxTQUFBLEdBQUE7QUFDakQsa0JBQUEsNEJBQUE7QUFBQTtBQUFBO21CQUFBLDRDQUFBOzhCQUFBO0FBQ0UsOEJBQUEsS0FBQyxDQUFBLEVBQUQsQ0FBSTtBQUFBLGtCQUFBLEtBQUEsRUFBTyxVQUFQO0FBQUEsa0JBQW1CLE9BQUEsRUFBTyxvQkFBMUI7aUJBQUosRUFBb0QsU0FBQSxHQUFBO0FBQ2xELGtCQUFBLEtBQUMsQ0FBQSxJQUFELENBQU07QUFBQSxvQkFBQSxPQUFBLEVBQU8sMkRBQVA7bUJBQU4sRUFBMEUsQ0FBMUUsQ0FBQSxDQUFBO3lCQUNBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxvQkFBQSxPQUFBLEVBQU8sWUFBUDttQkFBTCxFQUEwQixTQUFBLEdBQUE7QUFDeEIsb0JBQUEsS0FBQyxDQUFBLElBQUQsQ0FBTTtBQUFBLHNCQUFBLE9BQUEsRUFBTywwQkFBUDtxQkFBTixFQUF5QyxrQkFBekMsQ0FBQSxDQUFBO0FBQUEsb0JBQ0EsS0FBQyxDQUFBLFFBQUQsQ0FBVTtBQUFBLHNCQUFBLE9BQUEsRUFBTyxjQUFQO0FBQUEsc0JBQXVCLEdBQUEsRUFBSyxHQUE1QjtBQUFBLHNCQUFpQyxLQUFBLEVBQU8sQ0FBeEM7cUJBQVYsQ0FEQSxDQUFBOzJCQUVBLEtBQUMsQ0FBQSxJQUFELENBQU07QUFBQSxzQkFBQSxPQUFBLEVBQU8sb0NBQVA7cUJBQU4sRUFId0I7a0JBQUEsQ0FBMUIsRUFGa0Q7Z0JBQUEsQ0FBcEQsRUFBQSxDQURGO0FBQUE7OEJBRGlEO1lBQUEsQ0FBbkQsQ0FBQSxDQUFBO21CQVFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxjQUFBLE9BQUEsRUFBTyxrQkFBUDthQUFMLEVBQWdDLFNBQUEsR0FBQTtxQkFDOUIsS0FBQyxDQUFBLE1BQUQsQ0FBUTtBQUFBLGdCQUFBLE9BQUEsRUFBTyxZQUFQO0FBQUEsZ0JBQXFCLEtBQUEsRUFBTyxNQUE1QjtlQUFSLEVBQTRDLE1BQTVDLEVBRDhCO1lBQUEsQ0FBaEMsRUFUbUI7VUFBQSxDQUFyQixFQUw0RDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlELEVBRFE7SUFBQSxDQUZWLENBQUE7O0FBQUEsaUNBb0JBLFVBQUEsR0FBWSxTQUFFLEtBQUYsR0FBQTtBQUNWLE1BRFcsSUFBQyxDQUFBLFFBQUEsS0FDWixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLEVBQVgsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQURiLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxTQUFELENBQVcsSUFBWCxFQUFpQiwwQkFBakIsRUFBNkMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsS0FBRCxHQUFBO0FBQzNDLGNBQUEsV0FBQTtBQUFBLFVBQUEsQ0FBQSxHQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBYixDQUFBLENBQXNCLENBQUMsVUFBdkIsQ0FBa0MsS0FBSyxDQUFDLElBQXhDLENBQUosQ0FBQTtBQUFBLFVBQ0EsUUFBQSxHQUFXLEtBQUMsQ0FBQSxRQUFRLENBQUMsSUFBVixDQUFnQixlQUFBLEdBQWMsQ0FBZCxHQUFpQixhQUFqQyxDQUErQyxDQUFBLENBQUEsQ0FEMUQsQ0FBQTtBQUVBLFVBQUEsSUFBRyxnQkFBSDtBQUNFLFlBQUEsUUFBUSxDQUFDLEdBQVQsR0FBZSxLQUFLLENBQUMsS0FBckIsQ0FBQTttQkFDQSxRQUFRLENBQUMsS0FBVCxHQUFpQixLQUFLLENBQUMsU0FGekI7V0FBQSxNQUFBO21CQUlFLE9BQU8sQ0FBQyxHQUFSLENBQWEsOEJBQUEsR0FBNkIsQ0FBMUMsRUFKRjtXQUgyQztRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTdDLENBSEEsQ0FBQTtBQUFBLE1BWUEsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFYLEVBQWlCLHdCQUFqQixFQUEyQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxPQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTNDLENBWkEsQ0FBQTtBQUFBLE1BY0EsSUFBQyxDQUFBLE9BQUQsQ0FBUyxrQ0FBVCxFQUE2QyxJQUFDLENBQUEsWUFBRCxDQUFjLE1BQWQsQ0FBN0MsQ0FkQSxDQUFBO2FBZUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxvQ0FBVCxFQUErQyxJQUFDLENBQUEsWUFBRCxDQUFjLFFBQWQsQ0FBL0MsRUFoQlU7SUFBQSxDQXBCWixDQUFBOztBQUFBLGlDQXNDQSxRQUFBLEdBQVUsU0FBQyxLQUFELEVBQVEsT0FBUixHQUFBO0FBQ1IsVUFBQSxrQkFBQTtBQUFBLE1BQUEsUUFBQSxHQUFXLE9BQU8sQ0FBQyxJQUFSLENBQWEsT0FBYixDQUFxQixDQUFDLElBQXRCLENBQUEsQ0FBWCxDQUFBO0FBQUEsTUFDQSxRQUFBLEdBQVcsSUFBSSxDQUFDLElBQUwsQ0FBVSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQWIsQ0FBQSxDQUFzQixDQUFDLG1CQUF2QixDQUFBLENBQVYsRUFBd0QsUUFBeEQsQ0FEWCxDQUFBO2FBRUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFFBQXBCLEVBSFE7SUFBQSxDQXRDVixDQUFBOztBQUFBLGlDQTJDQSxRQUFBLEdBQVUsU0FBQSxHQUFBO0FBQ1IsTUFBQSxJQUFDLENBQUEsUUFBRCxDQUFVLFdBQVYsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLElBQUksQ0FBQyxJQUFOLENBQVcsTUFBWCxFQUZRO0lBQUEsQ0EzQ1YsQ0FBQTs7QUFBQSxpQ0ErQ0EsT0FBQSxHQUFTLFNBQUEsR0FBQTtBQUNQLE1BQUEsSUFBQyxDQUFBLFdBQUQsQ0FBYSxXQUFiLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxJQUFJLENBQUMsSUFBTixDQUFXLE1BQVgsRUFGTztJQUFBLENBL0NULENBQUE7O0FBQUEsaUNBbURBLElBQUEsR0FBTSxTQUFBLEdBQUE7QUFDSixNQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsc0JBQVYsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBUSxjQUFSLEVBRkk7SUFBQSxDQW5ETixDQUFBOztBQUFBLGlDQXVEQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2FBQ1AsSUFBQyxDQUFBLEtBQUssQ0FBQyxNQUFQLENBQWMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUdaLGNBQUEsOEJBQUE7QUFBQTtBQUFBLGVBQUEsNENBQUE7NkJBQUE7QUFDRSxZQUFBLENBQUEsR0FBSSxDQUFBLENBQUUsSUFBRixDQUFPLENBQUMsSUFBUixDQUFhLE9BQWIsQ0FBcUIsQ0FBQyxJQUF0QixDQUFBLENBQUosQ0FBQTtBQUFBLFlBQ0EsSUFBQSxHQUFPLENBQUEsQ0FBRSxJQUFGLENBQU8sQ0FBQyxJQUFSLENBQWEsU0FBYixDQURQLENBQUE7QUFBQSxZQUVBLElBQUksQ0FBQyxXQUFMLENBQWlCLG1DQUFqQixDQUZBLENBQUE7QUFHQSxZQUFBLElBQUcsQ0FBQyxDQUFDLFFBQUYsQ0FBVyxLQUFDLENBQUEsS0FBSyxDQUFDLFNBQWxCLEVBQTZCLENBQTdCLENBQUg7QUFDRSxjQUFBLElBQUksQ0FBQyxRQUFMLENBQWMsV0FBZCxDQUFBLENBREY7YUFBQSxNQUFBO0FBR0UsY0FBQSxJQUFJLENBQUMsUUFBTCxDQUFjLHlCQUFkLENBQUEsQ0FIRjthQUpGO0FBQUEsV0FBQTtBQVNBLFVBQUEsSUFBRyxLQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FBQSxDQUFIO0FBQ0UsWUFBQSxJQUFJLENBQUMsSUFBTCxDQUFVLHNCQUFWLENBQUEsQ0FBQTttQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFRLFdBQVIsRUFGRjtXQVpZO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBZCxFQURPO0lBQUEsQ0F2RFQsQ0FBQTs7QUFBQSxpQ0F3RUEsTUFBQSxHQUFRLFNBQUMsU0FBRCxHQUFBO0FBQ04sVUFBQSxrQkFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLFdBQUQsQ0FBQSxDQUFBLENBQUE7QUFDQTtBQUFBLFdBQUEsNENBQUE7c0JBQUE7QUFBQSxRQUFBLENBQUMsQ0FBQyxPQUFGLENBQUEsQ0FBQSxDQUFBO0FBQUEsT0FEQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQUZYLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxTQUFTLENBQUMsR0FBWCxDQUFBLENBSEEsQ0FBQTtBQUFBLE1BS0EsSUFBQyxDQUFBLElBQUQsQ0FBTSxNQUFOLEVBQWMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUNaLFVBQUEsa0JBQWtCLENBQUMsUUFBbkIsR0FBOEIsSUFBOUIsQ0FBQTtpQkFDQSxLQUFDLENBQUEsTUFBRCxDQUFBLEVBRlk7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFkLENBTEEsQ0FBQTthQVFBLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBbkIsQ0FBbUMsSUFBQSxTQUFBLENBQVUsSUFBQyxDQUFBLEtBQVgsQ0FBbkMsRUFUTTtJQUFBLENBeEVSLENBQUE7O0FBQUEsaUNBbUZBLFlBQUEsR0FBYyxTQUFDLElBQUQsR0FBQTthQUNaLFNBQUMsS0FBRCxHQUFBO0FBQ0UsWUFBQSxDQUFBO0FBQUEsUUFBQSxDQUFBLEdBQUksQ0FBQSxDQUFFLEtBQUssQ0FBQyxNQUFSLENBQWUsQ0FBQyxJQUFoQixDQUFxQixPQUFyQixDQUE2QixDQUFDLElBQTlCLENBQUEsQ0FBSixDQUFBO2VBQ0EsU0FBUyxDQUFDLFlBQVYsQ0FBdUIsSUFBdkIsRUFBNkIsQ0FBN0IsRUFBZ0MsU0FBQSxHQUFBO0FBQzlCLGNBQUEsSUFBQTtBQUFBLFVBQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxJQUFMLENBQVUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUF2QixFQUE2QixDQUE3QixDQUFQLENBQUE7QUFBQSxVQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsMEJBQVYsRUFBc0M7QUFBQSxZQUFBLElBQUEsRUFBTSxJQUFOO0FBQUEsWUFBWSxLQUFBLEVBQU8sQ0FBbkI7QUFBQSxZQUFzQixRQUFBLEVBQVUsQ0FBaEM7V0FBdEMsQ0FEQSxDQUFBO2lCQUVBLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixDQUFwQixFQUg4QjtRQUFBLENBQWhDLEVBRkY7TUFBQSxFQURZO0lBQUEsQ0FuRmQsQ0FBQTs7QUFBQSxpQ0EyRkEsUUFBQSxHQUFVLElBM0ZWLENBQUE7O0FBQUEsSUE2RkEsa0JBQUMsQ0FBQSxNQUFELEdBQVMsU0FBQSxHQUFBO0FBQ1AsTUFBQSxJQUFBLENBQUEsSUFBa0IsQ0FBQyxPQUFPLENBQUMsT0FBYixDQUFBLENBQWQ7QUFBQSxjQUFBLENBQUE7T0FBQTtBQUNBLE1BQUEsSUFBVSxxQkFBVjtBQUFBLGNBQUEsQ0FBQTtPQURBO2FBR0EsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsS0FBRCxHQUFBO0FBQ2QsY0FBQSxJQUFBO0FBQUEsVUFBQSxJQUFHLENBQUEsS0FBUyxDQUFDLE9BQU4sQ0FBQSxDQUFQO0FBQ0UsWUFBQSxJQUFBLEdBQVcsSUFBQSxrQkFBQSxDQUFtQixLQUFuQixDQUFYLENBQUE7QUFBQSxZQUNBLEtBQUMsQ0FBQSxRQUFELEdBQVksSUFEWixDQUFBO0FBQUEsWUFFQSxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQW5CLENBQWtDLElBQWxDLENBRkEsQ0FBQTttQkFJQSxLQUFDLENBQUEsUUFBUSxDQUFDLFNBQVYsR0FBc0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFuQixDQUFrQyxTQUFDLElBQUQsR0FBQTtBQUN0RCxrQkFBQSxNQUFBO0FBQUEsY0FBQSxJQUFHLElBQUksQ0FBQyxRQUFMLElBQWtCLHdCQUFyQjtBQUNFLGdCQUFBLE1BQUEsR0FBUyxLQUFDLENBQUEsZUFBRCxDQUFpQixLQUFqQixFQUF3QixJQUF4QixDQUFULENBQUE7QUFDQSxnQkFBQSxJQUFpQyxjQUFqQzt5QkFBQSxLQUFDLENBQUEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFsQixDQUF1QixNQUF2QixFQUFBO2lCQUZGO2VBRHNEO1lBQUEsQ0FBbEMsRUFMeEI7V0FBQSxNQUFBO21CQVVFLElBQUksQ0FBQyxhQUFhLENBQUMsV0FBbkIsQ0FBbUMsSUFBQSxrQkFBQSxDQUFtQixLQUFuQixDQUFuQyxFQVZGO1dBRGM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFoQixFQUpPO0lBQUEsQ0E3RlQsQ0FBQTs7QUFBQSxJQThHQSxrQkFBQyxDQUFBLGVBQUQsR0FBa0IsU0FBQyxLQUFELEVBQVEsVUFBUixHQUFBO0FBQ2hCLFVBQUEsa0JBQUE7QUFBQSxNQUFBLElBQVUsS0FBSyxDQUFDLE9BQU4sQ0FBQSxDQUFWO0FBQUEsY0FBQSxDQUFBO09BQUE7QUFBQSxNQUVBLFFBQUEsR0FBVyxVQUFVLENBQUMsU0FBWCxDQUFBLENBQXNCLENBQUMsT0FBdkIsQ0FBQSxDQUZYLENBQUE7QUFBQSxNQUdBLFFBQUEsR0FBVyxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQWIsQ0FBQSxDQUFzQixDQUFDLFVBQXZCLENBQWtDLFFBQWxDLENBSFgsQ0FBQTtBQUlBLE1BQUEsSUFBQSxDQUFBLENBQWUsQ0FBQyxRQUFGLENBQVcsS0FBSyxDQUFDLFNBQWpCLEVBQTRCLFFBQTVCLENBQWQ7QUFBQSxjQUFBLENBQUE7T0FKQTthQU1JLElBQUEsY0FBQSxDQUFlLEtBQWYsRUFBc0IsVUFBdEIsRUFQWTtJQUFBLENBOUdsQixDQUFBOzs4QkFBQTs7S0FGK0IsS0FYakMsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/merge-conflicts/lib/merge-conflicts-view.coffee