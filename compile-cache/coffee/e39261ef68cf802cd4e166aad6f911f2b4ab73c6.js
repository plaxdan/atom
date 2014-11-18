(function() {
  module.exports = {
    positionHistory: [],
    positionFuture: [],
    wasrewinding: false,
    rewinding: false,
    wasforwarding: false,
    forwarding: false,
    editorSubscription: null,
    activate: function() {
      var ed, pane, pos;
      atom.workspaceView.on('cursor:moved', (function(_this) {
        return function() {
          var ed, lastEd, lastPane, lastPos, pane, pos, _ref;
          ed = atom.workspace.getActiveEditor();
          pane = atom.workspace.activePane;
          if ((ed != null) && _this.rewinding === false && _this.forwarding === false) {
            pos = ed.getCursorBufferPosition();
            if (_this.positionHistory.length) {
              _ref = _this.positionHistory.slice(-1)[0], lastPane = _ref.pane, lastEd = _ref.editor, lastPos = _ref.position;
              if (pane === lastPane && ed === lastEd && Math.abs(lastPos.serialize()[0] - pos.serialize()[0]) < 3) {
                return;
              }
            }
            _this.positionHistory.push({
              pane: pane,
              editor: ed,
              position: pos
            });
            _this.positionFuture = [];
            _this.wasrewinding = false;
            _this.wasforwarding = false;
          }
          _this.rewinding = false;
          return _this.forwarding = false;
        };
      })(this));
      atom.workspaceView.on('pane:removed', (function(_this) {
        return function(event, removedPaneView) {
          return _this.positionHistory = _this.positionHistory.filter(function(pos) {
            return pos.pane !== removedPaneView.model;
          });
        };
      })(this));
      atom.workspaceView.on('pane:item-removed', (function(_this) {
        return function(event, paneItem) {
          return _this.positionHistory = _this.positionHistory.filter(function(pos) {
            return pos.editor !== paneItem;
          });
        };
      })(this));
      ed = atom.workspace.getActiveEditor();
      pane = atom.workspace.activePane;
      if ((pane != null) && (ed != null)) {
        pos = ed.getCursorBufferPosition();
        this.positionHistory.push({
          pane: pane,
          editor: ed,
          position: pos
        });
      }
      atom.workspaceView.command('last-cursor-position:previous', (function(_this) {
        return function() {
          return _this.previous();
        };
      })(this));
      return atom.workspaceView.command('last-cursor-position:next', (function(_this) {
        return function() {
          return _this.next();
        };
      })(this));
    },
    previous: function() {
      var foundeditor, pos, temp;
      if (this.wasforwarding || this.wasrewinding === false) {
        temp = this.positionHistory.pop();
        if (temp != null) {
          this.positionFuture.push(temp);
        }
      }
      pos = this.positionHistory.pop();
      if (pos != null) {
        this.positionFuture.push(pos);
        this.rewinding = true;
        this.wasrewinding = true;
        this.wasforwarding = false;
        foundeditor = true;
        if (pos.pane !== atom.workspace.activePane) {
          pos.pane.activate();
        }
        if (pos.editor !== atom.workspace.getActiveEditor()) {
          atom.workspace.activePane.activateItem(pos.editor);
        }
        return atom.workspace.getActiveEditor().setCursorBufferPosition(pos.position);
      }
    },
    next: function() {
      var foundeditor, pos, temp;
      if (this.wasrewinding || this.wasforwarding === false) {
        temp = this.positionFuture.pop();
        if (temp != null) {
          this.positionHistory.push(temp);
        }
      }
      pos = this.positionFuture.pop();
      if (pos != null) {
        this.positionHistory.push(pos);
        this.forwarding = true;
        this.wasforwarding = true;
        this.wasrewinding = false;
        foundeditor = true;
        if (pos.pane !== atom.workspace.activePane) {
          pos.pane.activate();
        }
        if (pos.editor !== atom.workspace.getActiveEditor()) {
          atom.workspace.activePane.activateItem(pos.editor);
        }
        return atom.workspace.getActiveEditor().setCursorBufferPosition(pos.position);
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ0c7QUFBQSxJQUFBLGVBQUEsRUFBaUIsRUFBakI7QUFBQSxJQUNBLGNBQUEsRUFBZ0IsRUFEaEI7QUFBQSxJQUVBLFlBQUEsRUFBYyxLQUZkO0FBQUEsSUFHQSxTQUFBLEVBQVcsS0FIWDtBQUFBLElBSUEsYUFBQSxFQUFjLEtBSmQ7QUFBQSxJQUtBLFVBQUEsRUFBWSxLQUxaO0FBQUEsSUFNQSxrQkFBQSxFQUFvQixJQU5wQjtBQUFBLElBUUEsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUVQLFVBQUEsYUFBQTtBQUFBLE1BQUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFuQixDQUFzQixjQUF0QixFQUFzQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQ25DLGNBQUEsOENBQUE7QUFBQSxVQUFBLEVBQUEsR0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWYsQ0FBQSxDQUFMLENBQUE7QUFBQSxVQUNBLElBQUEsR0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBRHRCLENBQUE7QUFFQSxVQUFBLElBQUcsWUFBQSxJQUFRLEtBQUMsQ0FBQSxTQUFELEtBQWMsS0FBdEIsSUFBZ0MsS0FBQyxDQUFBLFVBQUQsS0FBZSxLQUFsRDtBQUNHLFlBQUEsR0FBQSxHQUFNLEVBQUUsQ0FBQyx1QkFBSCxDQUFBLENBQU4sQ0FBQTtBQUNBLFlBQUEsSUFBRyxLQUFDLENBQUEsZUFBZSxDQUFDLE1BQXBCO0FBQ0csY0FBQSxPQUFzRCxLQUFDLENBQUEsZUFBZ0IsVUFBUSxDQUFBLENBQUEsQ0FBL0UsRUFBTyxnQkFBTixJQUFELEVBQXlCLGNBQVIsTUFBakIsRUFBMkMsZUFBVixRQUFqQyxDQUFBO0FBQ0EsY0FBQSxJQUFHLElBQUEsS0FBUSxRQUFS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
//# sourceURL=/Users/daniel/.atom/packages/last-cursor-position/lib/last-cursor-position.coffee