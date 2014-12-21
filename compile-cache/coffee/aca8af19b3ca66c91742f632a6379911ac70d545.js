(function() {
  var $, CompositeDisposable, MinimapGitDiffBinding,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $ = require('atom').$;

  CompositeDisposable = require('event-kit').CompositeDisposable;

  module.exports = MinimapGitDiffBinding = (function() {
    MinimapGitDiffBinding.prototype.active = false;

    function MinimapGitDiffBinding(editorView, gitDiff, minimapView) {
      this.editorView = editorView;
      this.gitDiff = gitDiff;
      this.minimapView = minimapView;
      this.subscribeToBuffer = __bind(this.subscribeToBuffer, this);
      this.updateDiffs = __bind(this.updateDiffs, this);
      this.scheduleUpdate = __bind(this.scheduleUpdate, this);
      this.editor = this.editorView.getModel();
      this.decorations = {};
      this.markers = null;
      this.subscriptions = new CompositeDisposable;
    }

    MinimapGitDiffBinding.prototype.activate = function() {
      var repository;
      this.subscriptions.add(this.editor.onDidChangePath(this.subscribeToBuffer));
      if (this.editor.onDidChangeScreenLines != null) {
        this.subscriptions.add(this.editor.onDidChangeScreenLines(this.updateDiffs));
      } else {
        this.subscriptions.add(this.editor.onDidChange(this.updateDiffs));
      }
      repository = this.getRepo();
      this.subscriptions.add(repository.onDidChangeStatuses(this.scheduleUpdate));
      this.subscriptions.add(repository.onDidChangeStatus(this.scheduleUpdate));
      this.subscribeToBuffer();
      return this.updateDiffs();
    };

    MinimapGitDiffBinding.prototype.deactivate = function() {
      this.removeDecorations();
      this.subscriptions.dispose();
      return this.diffs = null;
    };

    MinimapGitDiffBinding.prototype.scheduleUpdate = function() {
      return setImmediate(this.updateDiffs);
    };

    MinimapGitDiffBinding.prototype.updateDiffs = function() {
      this.removeDecorations();
      if (this.getPath() && (this.diffs = this.getDiffs())) {
        return this.addDecorations(this.diffs);
      }
    };

    MinimapGitDiffBinding.prototype.addDecorations = function(diffs) {
      var endRow, newLines, newStart, oldLines, oldStart, startRow, _i, _len, _ref, _results;
      _results = [];
      for (_i = 0, _len = diffs.length; _i < _len; _i++) {
        _ref = diffs[_i], oldStart = _ref.oldStart, newStart = _ref.newStart, oldLines = _ref.oldLines, newLines = _ref.newLines;
        startRow = newStart - 1;
        endRow = newStart + newLines - 2;
        if (oldLines === 0 && newLines > 0) {
          _results.push(this.markRange(startRow, endRow, '.minimap .git-line-added'));
        } else if (newLines === 0 && oldLines > 0) {
          _results.push(this.markRange(startRow, startRow, '.minimap .git-line-removed'));
        } else {
          _results.push(this.markRange(startRow, endRow, '.minimap .git-line-modified'));
        }
      }
      return _results;
    };

    MinimapGitDiffBinding.prototype.removeDecorations = function() {
      var marker, _i, _len, _ref;
      if (this.markers == null) {
        return;
      }
      _ref = this.markers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        marker = _ref[_i];
        marker.destroy();
      }
      return this.markers = null;
    };

    MinimapGitDiffBinding.prototype.markRange = function(startRow, endRow, scope) {
      var marker;
      if (this.editor.displayBuffer.isDestroyed()) {
        return;
      }
      marker = this.editor.markBufferRange([[startRow, 0], [endRow, Infinity]], {
        invalidate: 'never'
      });
      this.minimapView.decorateMarker(marker, {
        type: 'line',
        scope: scope
      });
      if (this.markers == null) {
        this.markers = [];
      }
      return this.markers.push(marker);
    };

    MinimapGitDiffBinding.prototype.destroy = function() {
      this.removeDecorations();
      return this.deactivate();
    };

    MinimapGitDiffBinding.prototype.getPath = function() {
      var _ref;
      return (_ref = this.buffer) != null ? _ref.getPath() : void 0;
    };

    MinimapGitDiffBinding.prototype.getRepositories = function() {
      var _ref;
      return (_ref = atom.project) != null ? _ref.getRepositories() : void 0;
    };

    MinimapGitDiffBinding.prototype.getRepo = function() {
      var _ref;
      return (_ref = this.getRepositories()) != null ? _ref[0] : void 0;
    };

    MinimapGitDiffBinding.prototype.getDiffs = function() {
      var _ref;
      return (_ref = this.getRepo()) != null ? _ref.getLineDiffs(this.getPath(), this.buffer.getText()) : void 0;
    };

    MinimapGitDiffBinding.prototype.unsubscribeFromBuffer = function() {
      if (this.buffer != null) {
        this.bufferSubscription.dispose();
        this.removeDecorations();
        return this.buffer = null;
      }
    };

    MinimapGitDiffBinding.prototype.subscribeToBuffer = function() {
      this.unsubscribeFromBuffer();
      if (this.buffer = this.editor.getBuffer()) {
        return this.bufferSubscription = this.buffer.onDidStopChanging(this.updateDiffs);
      }
    };

    return MinimapGitDiffBinding;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZDQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQyxJQUFLLE9BQUEsQ0FBUSxNQUFSLEVBQUwsQ0FBRCxDQUFBOztBQUFBLEVBQ0Msc0JBQXVCLE9BQUEsQ0FBUSxXQUFSLEVBQXZCLG1CQURELENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBRUosb0NBQUEsTUFBQSxHQUFRLEtBQVIsQ0FBQTs7QUFFYSxJQUFBLCtCQUFFLFVBQUYsRUFBZSxPQUFmLEVBQXlCLFdBQXpCLEdBQUE7QUFDWCxNQURZLElBQUMsQ0FBQSxhQUFBLFVBQ2IsQ0FBQTtBQUFBLE1BRHlCLElBQUMsQ0FBQSxVQUFBLE9BQzFCLENBQUE7QUFBQSxNQURtQyxJQUFDLENBQUEsY0FBQSxXQUNwQyxDQUFBO0FBQUEsbUVBQUEsQ0FBQTtBQUFBLHVEQUFBLENBQUE7QUFBQSw2REFBQSxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsTUFBRCxHQUFVLElBQUMsQ0FBQSxVQUFVLENBQUMsUUFBWixDQUFBLENBQVYsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFdBQUQsR0FBZSxFQURmLENBQUE7QUFBQSxNQUVBLElBQUMsQ0FBQSxPQUFELEdBQVcsSUFGWCxDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsYUFBRCxHQUFpQixHQUFBLENBQUEsbUJBSGpCLENBRFc7SUFBQSxDQUZiOztBQUFBLG9DQVFBLFFBQUEsR0FBVSxTQUFBLEdBQUE7QUFDUixVQUFBLFVBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLGVBQVIsQ0FBd0IsSUFBQyxDQUFBLGlCQUF6QixDQUFuQixDQUFBLENBQUE7QUFDQSxNQUFBLElBQUcsMENBQUg7QUFDRSxRQUFB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
//# sourceURL=/Users/daniel/.atom/packages/minimap-git-diff/lib/minimap-git-diff-binding.coffee