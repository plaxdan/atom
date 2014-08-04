(function() {
  var CommandPromptView;

  CommandPromptView = require('./terminal-runner/command-prompt-view');

  module.exports = {
    commandPromptView: null,
    terminalSession: null,
    activate: function(state) {
      this.commandPromptView = new CommandPromptView(this, state.commandPromptState);
      atom.workspaceView.command('terminal-runner:run-command', (function(_this) {
        return function() {
          return _this.activateCommandPrompt();
        };
      })(this));
      return atom.workspaceView.command('terminal-runner:run-last-command', (function(_this) {
        return function() {
          return _this.runLastCommand();
        };
      })(this));
    },
    deactivate: function() {
      return this.commandPromptView.destroy();
    },
    serialize: function() {
      return {
        commandPromptState: this.commandPromptView.serialize()
      };
    },
    activateCommandPrompt: function() {
      return this.commandPromptView.activate();
    },
    createTerminalSession: function() {
      var lastActivePane, lastActivePaneItem, path, _ref;
      lastActivePane = atom.workspace.activePane;
      lastActivePaneItem = atom.workspace.activePaneItem;
      atom.workspace.activePane.splitRight();
      path = (_ref = atom.project.getPath()) != null ? _ref : '~';
      return atom.workspaceView.open("terminal://" + path).then((function(_this) {
        return function(session) {
          _this.terminalSession = session;
          session.on('exit', function() {
            return _this.terminalSession = null;
          });
          lastActivePane.activate();
          return lastActivePane.activateItem(lastActivePaneItem);
        };
      })(this));
    },
    runCommand: function(command) {
      if (!command) {
        return;
      }
      this.lastCommand = command;
      if (!(this.terminalSession && this.terminalSession.process.childProcess)) {
        this.createTerminalSession().then((function(_this) {
          return function() {
            return _this.runCommand(command);
          };
        })(this));
        return;
      }
      return this.terminalSession.emit('input', command + '\x0a');
    },
    runLastCommand: function() {
      if (this.lastCommand) {
        return this.runCommand(this.lastCommand);
      } else {
        return this.toggleCommandPrompt();
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlCQUFBOztBQUFBLEVBQUEsaUJBQUEsR0FBb0IsT0FBQSxDQUFRLHVDQUFSLENBQXBCLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxpQkFBQSxFQUFtQixJQUFuQjtBQUFBLElBQ0EsZUFBQSxFQUFpQixJQURqQjtBQUFBLElBR0EsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO0FBQ1IsTUFBQSxJQUFDLENBQUEsaUJBQUQsR0FBeUIsSUFBQSxpQkFBQSxDQUFrQixJQUFsQixFQUF3QixLQUFLLENBQUMsa0JBQTlCLENBQXpCLENBQUE7QUFBQSxNQUVBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsNkJBQTNCLEVBQTBELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLHFCQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFELENBRkEsQ0FBQTthQUdBLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsa0NBQTNCLEVBQStELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLGNBQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBL0QsRUFKUTtJQUFBLENBSFY7QUFBQSxJQVNBLFVBQUEsRUFBWSxTQUFBLEdBQUE7YUFDVixJQUFDLENBQUEsaUJBQWlCLENBQUMsT0FBbkIsQ0FBQSxFQURVO0lBQUEsQ0FUWjtBQUFBLElBWUEsU0FBQSxFQUFXLFNBQUEsR0FBQTthQUNUO0FBQUEsUUFBQSxrQkFBQSxFQUFvQixJQUFDLENBQUEsaUJBQWlCLENBQUMsU0FBbkIsQ0FBQSxDQUFwQjtRQURTO0lBQUEsQ0FaWDtBQUFBLElBZUEscUJBQUEsRUFBdUIsU0FBQSxHQUFBO2FBQ3JCLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQyxRQUFuQixDQUFBLEVBRHFCO0lBQUEsQ0FmdkI7QUFBQSxJQWtCQSxxQkFBQSxFQUF1QixTQUFBLEdBQUE7QUFDckIsVUFBQSw4Q0FBQTtBQUFBLE1BQUEsY0FBQSxHQUFpQixJQUFJLENBQUMsU0FBUyxDQUFDLFVBQWhDLENBQUE7QUFBQSxNQUNBLGtCQUFBLEdBQXFCLElBQUksQ0FBQyxTQUFTLENBQUMsY0FEcEMsQ0FBQTtBQUFBLE1BRUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsVUFBMUIsQ0FBQSxDQUZBLENBQUE7QUFBQSxNQUlBLElBQUEsb0RBQWdDLEdBSmhDLENBQUE7YUFLQSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQW5CLENBQXlCLGFBQUEsR0FBWSxJQUFyQyxDQUE2QyxDQUFDLElBQTlDLENBQW1ELENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLE9BQUQsR0FBQTtBQUNqRCxVQUFBLEtBQUMsQ0FBQSxlQUFELEdBQW1CLE9BQW5CLENBQUE7QUFBQSxVQUNBLE9BQU8sQ0FBQyxFQUFSLENBQVcsTUFBWCxFQUFtQixTQUFBLEdBQUE7bUJBQUcsS0FBQyxDQUFBLGVBQUQsR0FBbUIsS0FBdEI7VUFBQSxDQUFuQixDQURBLENBQUE7QUFBQSxVQUdBLGNBQWMsQ0FBQyxRQUFmLENBQUEsQ0FIQSxDQUFBO2lCQUlBLGNBQWMsQ0FBQyxZQUFmLENBQTRCLGtCQUE1QixFQUxpRDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5ELEVBTnFCO0lBQUEsQ0FsQnZCO0FBQUEsSUErQkEsVUFBQSxFQUFZLFNBQUMsT0FBRCxHQUFBO0FBQ1YsTUFBQSxJQUFBLENBQUEsT0FBQTtBQUFBLGNBQUEsQ0FBQTtPQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlLE9BRGYsQ0FBQTtBQUdBLE1BQUEsSUFBQSxDQUFBLENBQU8sSUFBQyxDQUFBLGVBQUQsSUFBb0IsSUFBQyxDQUFBLGVBQWUsQ0FBQyxPQUFPLENBQUMsWUFBcEQsQ0FBQTtBQUNFLFFBQUEsSUFBQyxDQUFBLHFCQUFELENBQUEsQ0FBd0IsQ0FBQyxJQUF6QixDQUE4QixDQUFBLFNBQUEsS0FBQSxHQUFBO2lCQUFBLFNBQUEsR0FBQTttQkFDNUIsS0FBQyxDQUFBLFVBQUQsQ0FBWSxPQUFaLEVBRDRCO1VBQUEsRUFBQTtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBOUIsQ0FBQSxDQUFBO0FBRUEsY0FBQSxDQUhGO09BSEE7YUFRQSxJQUFDLENBQUEsZUFBZSxDQUFDLElBQWpCLENBQXNCLE9BQXRCLEVBQStCLE9BQUEsR0FBVSxNQUF6QyxFQVRVO0lBQUEsQ0EvQlo7QUFBQSxJQTBDQSxjQUFBLEVBQWdCLFNBQUEsR0FBQTtBQUNkLE1BQUEsSUFBRyxJQUFDLENBQUEsV0FBSjtlQUNFLElBQUMsQ0FBQSxVQUFELENBQVksSUFBQyxDQUFBLFdBQWIsRUFERjtPQUFBLE1BQUE7ZUFHRSxJQUFDLENBQUEsbUJBQUQsQ0FBQSxFQUhGO09BRGM7SUFBQSxDQTFDaEI7R0FIRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/terminal-runner/lib/terminal-runner.coffee