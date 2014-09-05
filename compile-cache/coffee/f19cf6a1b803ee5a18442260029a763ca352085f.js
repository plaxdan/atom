(function() {
  var BufferedProcess, Linter, Point, Range, XRegExp, log, path, warn, _ref, _ref1;

  XRegExp = require('xregexp').XRegExp;

  path = require('path');

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point, BufferedProcess = _ref.BufferedProcess;

  _ref1 = require('./utils'), log = _ref1.log, warn = _ref1.warn;

  Linter = (function() {
    Linter.syntax = '';

    Linter.prototype.cmd = '';

    Linter.prototype.regex = '';

    Linter.prototype.regexFlags = '';

    Linter.prototype.cwd = null;

    Linter.prototype.defaultLevel = 'error';

    Linter.prototype.linterName = null;

    Linter.prototype.executablePath = null;

    Linter.prototype.isNodeExecutable = false;

    Linter.prototype.errorStream = 'stdout';

    function Linter(editor) {
      this.editor = editor;
      this.cwd = path.dirname(editor.getUri());
    }

    Linter.prototype.getCmdAndArgs = function(filePath) {
      var cmd, cmd_list;
      cmd = this.cmd;
      if (!Array.isArray(cmd)) {
        cmd_list = cmd.split(' ').concat([filePath]);
      } else {
        cmd_list = cmd.concat([filePath]);
      }
      if (this.executablePath) {
        cmd_list[0] = path.join(this.executablePath, cmd_list[0]);
      }
      if (this.isNodeExecutable) {
        cmd_list.unshift(this.getNodeExecutablePath());
      }
      cmd_list = cmd_list.map(function(cmd_item) {
        if (/@filename/i.test(cmd_item)) {
          return cmd_item.replace(/@filename/gi, filePath);
        } else {
          return cmd_item;
        }
      });
      log('command and arguments', cmd_list);
      return {
        command: cmd_list[0],
        args: cmd_list.slice(1)
      };
    };

    Linter.prototype.getNodeExecutablePath = function() {
      return path.join(require.resolve('package'), '..', 'apm/node_modules/atom-package-manager/bin/node');
    };

    Linter.prototype.lintFile = function(filePath, callback) {
      var args, command, dataStderr, dataStdout, exit, options, process, stderr, stdout, _ref2;
      _ref2 = this.getCmdAndArgs(filePath), command = _ref2.command, args = _ref2.args;
      log('is node executable: ' + this.isNodeExecutable);
      options = {
        cwd: this.cwd
      };
      dataStdout = [];
      dataStderr = [];
      stdout = function(output) {
        log('stdout', output);
        return dataStdout += output;
      };
      stderr = function(output) {
        warn('stderr', output);
        return dataStderr += output;
      };
      exit = (function(_this) {
        return function() {
          var data;
          data = _this.errorStream === 'stdout' ? dataStdout : dataStderr;
          return _this.processMessage(data, callback);
        };
      })(this);
      process = new BufferedProcess({
        command: command,
        args: args,
        options: options,
        stdout: stdout,
        stderr: stderr,
        exit: exit
      });
      return setTimeout(function() {
        return process.kill();
      }, 5000);
    };

    Linter.prototype.processMessage = function(message, callback) {
      var messages, regex;
      messages = [];
      regex = XRegExp(this.regex, this.regexFlags);
      XRegExp.forEach(message, regex, (function(_this) {
        return function(match, i) {
          return messages.push(_this.createMessage(match));
        };
      })(this), this);
      return callback(messages);
    };

    Linter.prototype.createMessage = function(match) {
      var level;
      if (match.error) {
        level = 'error';
      } else if (match.warning) {
        level = 'warning';
      } else {
        level = this.defaultLevel;
      }
      return {
        line: match.line,
        col: match.col,
        level: level,
        message: this.formatMessage(match),
        linter: this.linterName,
        range: this.computeRange(match)
      };
    };

    Linter.prototype.formatMessage = function(match) {
      return match.message;
    };

    Linter.prototype.lineLengthForRow = function(row) {
      return this.editor.lineLengthForBufferRow(row);
    };

    Linter.prototype.getEditorScopesForPosition = function(position) {
      try {
        return this.editor.displayBuffer.tokenizedBuffer.scopesForPosition(position);
      } catch (_error) {}
    };

    Linter.prototype.getGetRangeForScopeAtPosition = function(innerMostScope, position) {
      return this.editor.displayBuffer.tokenizedBuffer.bufferRangeForScopeAtPosition(innerMostScope, position);
    };

    Linter.prototype.computeRange = function(match) {
      var colEnd, colStart, decrementParse, innerMostScope, position, range, rowEnd, rowStart, scopes, _ref2, _ref3;
      if (match.line == null) {
        match.line = 0;
      }
      decrementParse = function(x) {
        return Math.max(0, parseInt(x) - 1);
      };
      rowStart = decrementParse((_ref2 = match.lineStart) != null ? _ref2 : match.line);
      rowEnd = decrementParse((_ref3 = match.lineEnd) != null ? _ref3 : match.line);
      if (match.col == null) {
        match.col = 0;
      }
      if (!match.colStart) {
        position = new Point(rowStart, match.col);
        scopes = this.getEditorScopesForPosition(position);
        while (innerMostScope = scopes != null ? scopes.pop() : void 0) {
          range = this.getGetRangeForScopeAtPosition(innerMostScope, position);
          if (range != null) {
            return range;
          }
        }
      }
      if (match.colStart == null) {
        match.colStart = match.col;
      }
      colStart = decrementParse(match.colStart);
      colEnd = match.colEnd != null ? decrementParse(match.colEnd) : parseInt(this.lineLengthForRow(rowEnd));
      if (colStart === colEnd) {
        colStart = decrementParse(colStart);
      }
      return new Range([rowStart, colStart], [rowEnd, colEnd]);
    };

    return Linter;

  })();

  module.exports = Linter;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRFQUFBOztBQUFBLEVBQUMsVUFBVyxPQUFBLENBQVEsU0FBUixFQUFYLE9BQUQsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFFQSxPQUFrQyxPQUFBLENBQVEsTUFBUixDQUFsQyxFQUFDLGFBQUEsS0FBRCxFQUFRLGFBQUEsS0FBUixFQUFlLHVCQUFBLGVBRmYsQ0FBQTs7QUFBQSxFQUdBLFFBQWMsT0FBQSxDQUFRLFNBQVIsQ0FBZCxFQUFDLFlBQUEsR0FBRCxFQUFNLGFBQUEsSUFITixDQUFBOztBQUFBLEVBT007QUFJSixJQUFBLE1BQUMsQ0FBQSxNQUFELEdBQVMsRUFBVCxDQUFBOztBQUFBLHFCQUlBLEdBQUEsR0FBSyxFQUpMLENBQUE7O0FBQUEscUJBaUJBLEtBQUEsR0FBTyxFQWpCUCxDQUFBOztBQUFBLHFCQW1CQSxVQUFBLEdBQVksRUFuQlosQ0FBQTs7QUFBQSxxQkFzQkEsR0FBQSxHQUFLLElBdEJMLENBQUE7O0FBQUEscUJBd0JBLFlBQUEsR0FBYyxPQXhCZCxDQUFBOztBQUFBLHFCQTBCQSxVQUFBLEdBQVksSUExQlosQ0FBQTs7QUFBQSxxQkE0QkEsY0FBQSxHQUFnQixJQTVCaEIsQ0FBQTs7QUFBQSxxQkE4QkEsZ0JBQUEsR0FBa0IsS0E5QmxCLENBQUE7O0FBQUEscUJBaUNBLFdBQUEsR0FBYSxRQWpDYixDQUFBOztBQW9DYSxJQUFBLGdCQUFFLE1BQUYsR0FBQTtBQUNYLE1BRFksSUFBQyxDQUFBLFNBQUEsTUFDYixDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsR0FBRCxHQUFPLElBQUksQ0FBQyxPQUFMLENBQWEsTUFBTSxDQUFDLE1BQVAsQ0FBQSxDQUFiLENBQVAsQ0FEVztJQUFBLENBcENi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
//# sourceURL=/Users/daniel/.atom/packages/linter/lib/linter.coffee