(function() {
  var Omni, OmniSharpServer, Range, SyntaxErrors, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ = require('underscore');

  OmniSharpServer = require('../../omni-sharp-server/omni-sharp-server');

  Omni = require('../../omni-sharp-server/omni');

  Range = require('atom').Range;

  module.exports = SyntaxErrors = (function() {
    function SyntaxErrors(atomSharper) {
      this.getWordAt = __bind(this.getWordAt, this);
      this.codeCheckAllExistingEditors = __bind(this.codeCheckAllExistingEditors, this);
      this.detectSyntaxErrorsIn = __bind(this.detectSyntaxErrorsIn, this);
      this.activate = __bind(this.activate, this);
      this.atomSharper = atomSharper;
      this.decorations = {};
      this.editors = [];
    }

    SyntaxErrors.prototype.activate = function() {
      this.editorSubscription = this.atomSharper.onEditor((function(_this) {
        return function(editor) {
          return _this.detectSyntaxErrorsIn(editor);
        };
      })(this));
      atom.on('omni-sharp-server:state-change-complete', this.codeCheckAllExistingEditors);
      return this.editorDestroyedSubscription = this.atomSharper.onEditorDestroyed((function(_this) {
        return function(filePath) {
          var editorsCount;
          editorsCount = _this.editors.length;
          while (editorsCount--) {
            if (_this.editors[editorsCount].buffer.file.path === filePath) {
              _this.editors.splice(editorsCount, 1);
            }
          }
          return atom.emit('omnisharp-atom:clear-syntax-errors', filePath);
        };
      })(this));
    };

    SyntaxErrors.prototype.detectSyntaxErrorsIn = function(editor) {
      var buffer;
      this.decorations[editor.id] = [];
      buffer = editor.getBuffer();
      buffer.on('changed', _.debounce(Omni.codecheck, 200));
      atom.on("omni:quick-fixes", _.bind(this.drawDecorations, this));
      Omni.codecheck(null, editor);
      return this.editors.push(editor);
    };

    SyntaxErrors.prototype.codeCheckAllExistingEditors = function(state) {
      var editor, _i, _len, _ref, _results;
      if (state === 'ready') {
        _ref = this.editors;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          editor = _ref[_i];
          _results.push(Omni.codecheck(null, editor));
        }
        return _results;
      }
    };

    SyntaxErrors.prototype.getWordAt = function(str, pos) {
      var left, right;
      if (str === void 0) {
        return {
          start: pos,
          end: pos
        };
      }
      while (pos < str.length && /\W/.test(str[pos])) {
        ++pos;
      }
      left = str.slice(0, pos + 1).search(/\W(?!.*\W)/);
      right = str.slice(pos).search(/(\W|$)/);
      return {
        start: left + 1,
        end: left + 1 + right
      };
    };

    SyntaxErrors.prototype.drawDecorations = function(_arg) {
      var QuickFixes, decorations, editor, path, quickFixPath, ranges;
      QuickFixes = _arg.QuickFixes;
      quickFixPath = _.first(_.pluck(QuickFixes, "FileName"));
      editor = _.find(this.editors, function(editor) {
        return editor.buffer.file.path === quickFixPath;
      });
      path = editor != null ? editor.buffer.file.path : void 0;
      if (path !== quickFixPath) {
        return;
      }
      _.each(this.decorations[editor.id], (function(_this) {
        return function(decoration) {
          return decoration.getMarker().destroy();
        };
      })(this));
      ranges = _.map(QuickFixes, (function(_this) {
        return function(error) {
          var column, end, line, start, text, _ref;
          line = error.Line - 1;
          column = error.Column - 1;
          text = editor.lineTextForBufferRow(line);
          _ref = _this.getWordAt(text, column), start = _ref.start, end = _ref.end;
          return {
            type: error.LogLevel,
            range: new Range([line, start], [line, end]),
            message: error.Text
          };
        };
      })(this));
      decorations = _.map(ranges, (function(_this) {
        return function(_arg1) {
          var color, gutter, line, marker, markerL, range, type;
          type = _arg1.type, range = _arg1.range;
          color = (function() {
            switch (false) {
              case type !== 'Warning':
                return "green";
              case type !== 'Error':
                return "red";
              default:
                return "unknown";
            }
          })();
          marker = editor.markBufferRange(range, {
            invalidate: 'never'
          });
          markerL = editor.markBufferRange(range, {
            invalidate: 'never'
          });
          gutter = editor.decorateMarker(marker, {
            type: "gutter",
            "class": "gutter-" + color
          });
          line = editor.decorateMarker(markerL, {
            type: "highlight",
            "class": "highlight-" + color
          });
          return [gutter, line];
        };
      })(this));
      return this.decorations[editor.id] = _.flatten(decorations);
    };

    SyntaxErrors.prototype.deactivate = function() {
      return this.editorSubscription.destroy();
    };

    return SyntaxErrors;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZDQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLFlBQVIsQ0FBSixDQUFBOztBQUFBLEVBQ0EsZUFBQSxHQUFrQixPQUFBLENBQVEsMkNBQVIsQ0FEbEIsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsOEJBQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0MsUUFBUyxPQUFBLENBQVEsTUFBUixFQUFULEtBSEQsQ0FBQTs7QUFBQSxFQUtBLE1BQU0sQ0FBQyxPQUFQLEdBQ1E7QUFFUyxJQUFBLHNCQUFDLFdBQUQsR0FBQTtBQUNYLG1EQUFBLENBQUE7QUFBQSx1RkFBQSxDQUFBO0FBQUEseUVBQUEsQ0FBQTtBQUFBLGlEQUFBLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxXQUFELEdBQWUsV0FBZixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsV0FBRCxHQUFlLEVBRGYsQ0FBQTtBQUFBLE1BRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQUZYLENBRFc7SUFBQSxDQUFiOztBQUFBLDJCQUtBLFFBQUEsR0FBVSxTQUFBLEdBQUE7QUFDUixNQUFBLElBQUMsQ0FBQSxrQkFBRCxHQUFzQixJQUFDLENBQUEsV0FBVyxDQUFDLFFBQWIsQ0FBc0IsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsTUFBRCxHQUFBO2lCQUMxQyxLQUFDLENBQUEsb0JBQUQsQ0FBc0IsTUFBdEIsRUFEMEM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QixDQUF0QixDQUFBO0FBQUEsTUFHQSxJQUFJLENBQUMsRUFBTCxDQUFRLHlDQUFSLEVBQW1ELElBQUMsQ0FBQSwyQkFBcEQsQ0FIQSxDQUFBO2FBTUEsSUFBQyxDQUFBLDJCQUFELEdB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
//# sourceURL=/Users/daniel/.atom/packages/omnisharp-atom/lib/omnisharp-atom/features/syntax-errors.coffee