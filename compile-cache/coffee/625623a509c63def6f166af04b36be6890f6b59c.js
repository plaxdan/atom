(function() {
  var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  module.exports = {
    positionHistory: [],
    positionFuture: [],
    wasrewinding: false,
    rewinding: false,
    wasforwarding: false,
    forwarding: false,
    editorSubscription: null,
    activate: function() {
      var ed, pos;
      atom.workspaceView.on('cursor:moved', (function(_this) {
        return function() {
          var ed, lastEd, lastPos, pos, _ref;
          ed = atom.workspace.getActiveEditor();
          if ((ed != null) && _this.rewinding === false && _this.forwarding === false) {
            pos = ed.getCursorBufferPosition();
            if (_this.positionHistory.length) {
              _ref = _this.positionHistory.slice(-1)[0], lastEd = _ref.editor, lastPos = _ref.position;
              if (ed === lastEd && Math.abs(lastPos.serialize()[0] - pos.serialize()[0]) < 3) {
                return;
              }
            }
            _this.positionHistory.push({
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
      ed = atom.workspace.getActiveEditor();
      if (ed != null) {
        pos = ed.getCursorBufferPosition();
        this.positionHistory.push({
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
      var foundeditor, pos, positionHistory, temp, testededitors, _ref;
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
        if (pos.editor !== atom.workspace.getActiveEditor()) {
          testededitors = [atom.workspace.getActiveEditor()];
          while (atom.workspace.getActiveEditor() !== pos.editor) {
            atom.workspaceView.getActivePane().activateNextItem();
            if (_ref = atom.workspace.getActiveEditor(), __indexOf.call(testededitors, _ref) >= 0) {
              positionHistory = [];
              foundeditor = false;
              break;
            }
            testededitors.push(atom.workspace.getActiveEditor());
          }
        }
        if (foundeditor) {
          return atom.workspace.getActiveEditor().setCursorBufferPosition(pos.position);
        }
      }
    },
    next: function() {
      var foundeditor, pos, positionFuture, temp, testededitors, _ref;
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
        if (pos.editor !== atom.workspace.getActiveEditor()) {
          testededitors = [atom.workspace.getActiveEditor()];
          while (atom.workspace.getActiveEditor() !== pos.editor) {
            atom.workspaceView.getActivePane().activateNextItem();
            if (_ref = atom.workspace.getActiveEditor(), __indexOf.call(testededitors, _ref) >= 0) {
              positionFuture = [];
              foundeditor = false;
              break;
            }
            testededitors.push(atom.workspace.getActiveEditor());
          }
        }
        if (foundeditor) {
          return atom.workspace.getActiveEditor().setCursorBufferPosition(pos.position);
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFKQUFBOztBQUFBLEVBQUEsTUFBTSxDQUFDLE9BQVAsR0FDRztBQUFBLElBQUEsZUFBQSxFQUFpQixFQUFqQjtBQUFBLElBQ0EsY0FBQSxFQUFnQixFQURoQjtBQUFBLElBRUEsWUFBQSxFQUFjLEtBRmQ7QUFBQSxJQUdBLFNBQUEsRUFBVyxLQUhYO0FBQUEsSUFJQSxhQUFBLEVBQWMsS0FKZDtBQUFBLElBS0EsVUFBQSxFQUFZLEtBTFo7QUFBQSxJQU1BLGtCQUFBLEVBQW9CLElBTnBCO0FBQUEsSUFRQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBRVAsVUFBQSxPQUFBO0FBQUEsTUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQW5CLENBQXNCLGNBQXRCLEVBQXNDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDbkMsY0FBQSw4QkFBQTtBQUFBLFVBQUEsRUFBQSxHQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZixDQUFBLENBQUwsQ0FBQTtBQUNBLFVBQUEsSUFBRyxZQUFBLElBQVEsS0FBQyxDQUFBLFNBQUQsS0FBYyxLQUF0QixJQUFnQyxLQUFDLENBQUEsVUFBRCxLQUFlLEtBQWxEO0FBQ0csWUFBQSxHQUFBLEdBQU0sRUFBRSxDQUFDLHVCQUFILENBQUEsQ0FBTixDQUFBO0FBQ0EsWUFBQSxJQUFHLEtBQUMsQ0FBQSxlQUFlLENBQUMsTUFBcEI7QUFDRSxjQUFBLE9BQXNDLEtBQUMsQ0FBQSxlQUFnQixVQUFRLENBQUEsQ0FBQSxDQUEvRCxFQUFTLGNBQVIsTUFBRCxFQUEyQixlQUFWLFFBQWpCLENBQUE7QUFDQSxjQUFBLElBQUcsRUFBQSxLQUFNLE1BQU4sSUFDRyxJQUFJLENBQUMsR0FBTCxDQUFTLE9BQU8sQ0FBQyxTQUFSLENBQUEsQ0FBb0IsQ0FBQSxDQUFBLENBQXBCLEdBQXlCLEdBQUcsQ0FBQyxTQUFKLENBQUEsQ0FBZ0IsQ0FBQSxDQUFBLENBQWxELENBQUEsR0FBd0QsQ0FEOUQ7QUFFRSxzQkFBQSxDQUZGO2VBRkY7YUFEQTtBQUFBLFlBTUEsS0FBQyxDQUFBLGVBQWUsQ0FBQyxJQUFqQixDQUFzQjtBQUFBLGNBQUMsTUFBQSxFQUFRLEVBQVQ7QUFBQSxjQUFhLFFBQUEsRUFBVSxHQUF2QjthQUF0QixDQU5BLENBQUE7QUFBQSxZQVFBLEtBQUMsQ0FBQSxjQUFELEdBQWtCLEVBUmxCLENBQUE7QUFBQSxZQVNBLEtBQUMsQ0FBQSxZQUFELEdBQWdCLEtBVGhCLENBQUE7QUFBQSxZQVVBLEtBQUMsQ0FBQSxhQUFELEdBQWlCLEtBVmpCLENBREg7V0FEQTtBQUFBLFVBYUEsS0FBQyxDQUFBLFNBQUQsR0FBYSxLQWJiLENBQUE7aUJBY0EsS0FBQyxDQUFBLFVBQUQsR0FBYyxNQWZxQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRDLENBQUEsQ0FBQTtBQUFBLE1BaUJBLEVBQUEsR0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWYsQ0FBQSxDQWpCTCxDQUFBO0FBa0JBLE1BQUEsSUFBRyxVQUFIO0FBQ0csUUFBQSxHQUFBLEdBQU0sRUFBRSxDQUFDLHVCQUFILENBQUEsQ0FBTixDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsZUFBZSxDQUFDLElBQWpCLENBQXNCO0FBQUEsVUFBQyxNQUFBLEVBQVEsRUFBVDtBQUFBLFVBQWEsUUFBQSxFQUFVLEdBQXZCO1NBQXRCLENBREEsQ0FESDtPQWxCQTtBQUFBLE1Bc0JBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsK0JBQTNCLEVBQTRELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLFFBQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUQsQ0F0QkEsQ0FBQTthQXVCQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLDJCQUEzQixFQUF3RCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxJQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhELEVBekJPO0lBQUEsQ0FSVjtBQUFBLElBbUNBLFFBQUEsRUFBVSxTQUFBLEdBQUE7QUFFUCxVQUFBLDREQUFBO0FBQUEsTUFBQSxJQUFHLElBQUMsQ0FBQSxhQUFELElBQWtCLElBQUMsQ0FBQSxZQUFELEtBQWlCLEtBQXRDO0FBQ0csUUFBQSxJQUFBLEdBQU8sSUFBQyxDQUFBLGVBQWUsQ0FBQyxHQUFqQixDQUFBLENBQVAsQ0FBQTtBQUNBLFFBQUEsSUFBRyxZQUFIO0FBQ0csVUFBQSxJQUFDLENBQUEsY0FBYyxDQUFDLElBQWhCLENBQXFCLElBQXJCLENBQUEsQ0FESDtTQUZIO09BQUE7QUFBQSxNQUtBLEdBQUEsR0FBTSxJQUFDLENBQUEsZUFBZSxDQUFDLEdBQWpCLENBQUEsQ0FMTixDQUFBO0FBTUEsTUFBQSxJQUFHLFdBQUg7QUFFRyxRQUFBLElBQUMsQ0FBQSxjQUFjLENBQUMsSUFBaEIsQ0FBcUIsR0FBckIsQ0FBQSxDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsU0FBRCxHQUFhLElBRGIsQ0FBQTtBQUFBLFFBRUEsSUFBQyxDQUFBLFlBQUQsR0FBZ0IsSUFGaEIsQ0FBQTtBQUFBLFFBR0EsSUFBQyxDQUFBLGFBQUQsR0FBaUIsS0FIakIsQ0FBQTtBQUFBLFFBSUEsV0FBQSxHQUFjLElBSmQsQ0FBQTtBQU1BLFFBQUEsSUFBRyxHQUFHLENBQUMsTUFBSixLQUFnQixJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWYsQ0FBQSxDQUFuQjtBQUNHLFVBQUEsYUFBQSxHQUFnQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZixDQUFBLENBQUQsQ0FBaEIsQ0FBQTtBQUNBLGlCQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZixDQUFBLENBQUEsS0FBb0MsR0FBRyxDQUFDLE1BQTlDLEdBQUE7QUFDRyxZQUFBLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBbkIsQ0FBQSxDQUFrQyxDQUFDLGdCQUFuQyxDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsV0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWYsQ0FBQSxDQUFBLEVBQUEsZUFBb0MsYUFBcEMsRUFBQSxJQUFBLE1BQUg7QUFFRyxjQUFBLGVBQUEsR0FBa0IsRUFBbEIsQ0FBQTtBQUFBLGNBQ0EsV0FBQSxHQUFjLEtBRGQsQ0FBQTtBQUVBLG9CQUpIO2FBREE7QUFBQSxZQU1BLGFBQWEsQ0FBQyxJQUFkLENBQW1CLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZixDQUFBLENBQW5CLENBTkEsQ0FESDtVQUFBLENBRkg7U0FOQTtBQWdCQSxRQUFBLElBQUcsV0FBSDtpQkFFRyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWYsQ0FBQSxDQUFnQyxDQUFDLHVCQUFqQyxDQUF5RCxHQUFHLENBQUMsUUFBN0QsRUFGSDtTQWxCSDtPQVJPO0lBQUEsQ0FuQ1Y7QUFBQSxJQWlFQSxJQUFBLEVBQU0sU0FBQSxHQUFBO0FBRUgsVUFBQSwyREFBQTtBQUFBLE1BQUEsSUFBRyxJQUFDLENBQUEsWUFBRCxJQUFpQixJQUFDLENBQUEsYUFBRCxLQUFrQixLQUF0QztBQUNHLFFBQUEsSUFBQSxHQUFPLElBQUMsQ0FBQSxjQUFjLENBQUMsR0FBaEIsQ0FBQSxDQUFQLENBQUE7QUFDQSxRQUFBLElBQUcsWUFBSDtBQUNHLFVBQUEsSUFBQyxDQUFBLGVBQWUsQ0FBQyxJQUFqQixDQUFzQixJQUF0QixDQUFBLENBREg7U0FGSDtPQUFBO0FBQUEsTUFLQSxHQUFBLEdBQU0sSUFBQyxDQUFBLGNBQWMsQ0FBQyxHQUFoQixDQUFBLENBTE4sQ0FBQTtBQU1BLE1BQUEsSUFBRyxXQUFIO0FBRUcsUUFBQSxJQUFDLENBQUEsZUFBZSxDQUFDLElBQWpCLENBQXNCLEdBQXRCLENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQURkLENBQUE7QUFBQSxRQUVBLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBRmpCLENBQUE7QUFBQSxRQUdBLElBQUMsQ0FBQSxZQUFELEdBQWdCLEtBSGhCLENBQUE7QUFBQSxRQUlBLFdBQUEsR0FBYyxJQUpkLENBQUE7QUFNQSxRQUFBLElBQUcsR0FBRyxDQUFDLE1BQUosS0FBZ0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFmLENBQUEsQ0FBbkI7QUFDRyxVQUFBLGFBQUEsR0FBZ0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWYsQ0FBQSxDQUFELENBQWhCLENBQUE7QUFDQSxpQkFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWYsQ0FBQSxDQUFBLEtBQW9DLEdBQUcsQ0FBQyxNQUE5QyxHQUFBO0FBQ0csWUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQW5CLENBQUEsQ0FBa0MsQ0FBQyxnQkFBbkMsQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLFdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFmLENBQUEsQ0FBQSxFQUFBLGVBQW9DLGFBQXBDLEVBQUEsSUFBQSxNQUFIO0FBRUcsY0FBQSxjQUFBLEdBQWlCLEVBQWpCLENBQUE7QUFBQSxjQUNBLFdBQUEsR0FBYyxLQURkLENBQUE7QUFFQSxvQkFKSDthQURBO0FBQUEsWUFNQSxhQUFhLENBQUMsSUFBZCxDQUFtQixJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWYsQ0FBQSxDQUFuQixDQU5BLENBREg7VUFBQSxDQUZIO1NBTkE7QUFnQkEsUUFBQSxJQUFHLFdBQUg7aUJBRUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFmLENBQUEsQ0FBZ0MsQ0FBQyx1QkFBakMsQ0FBeUQsR0FBRyxDQUFDLFFBQTdELEVBRkg7U0FsQkg7T0FSRztJQUFBLENBakVOO0dBREgsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/last-cursor-position/lib/last-cursor-position.coffee