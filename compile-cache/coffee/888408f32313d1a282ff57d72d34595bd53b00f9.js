(function() {
  var AtomColorHighlight, AtomColorHighlightEditor, Emitter,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Emitter = require('emissary').Emitter;

  AtomColorHighlightEditor = null;

  AtomColorHighlight = (function() {
    function AtomColorHighlight() {}

    Emitter.includeInto(AtomColorHighlight);

    AtomColorHighlight.prototype.config = {
      markersAtEndOfLine: {
        type: 'boolean',
        "default": false
      },
      hideMarkersInComments: {
        type: 'boolean',
        "default": false
      },
      hideMarkersInStrings: {
        type: 'boolean',
        "default": false
      },
      dotMarkersSize: {
        type: 'number',
        "default": 16,
        min: 2
      },
      dotMarkersSpacing: {
        type: 'number',
        "default": 4,
        min: 0
      },
      excludedGrammars: {
        type: 'array',
        "default": [],
        description: "Prevents files matching the specified grammars scopes from having their colors highligted. Changing this setting may need a restart to take effect. This setting takes a list of scope strings separated with commas. Scope for a grammar can be found in the corresponding package description in the settings view.",
        items: {
          type: 'string'
        }
      }
    };

    AtomColorHighlight.prototype.editors = {};

    AtomColorHighlight.prototype.activate = function(state) {
      return atom.workspaceView.eachEditorView((function(_this) {
        return function(editor) {
          var colorEditor, _ref;
          if (_ref = editor.editor.getGrammar().scopeName, __indexOf.call(atom.config.get('atom-color-highlight.excludedGrammars'), _ref) >= 0) {
            return;
          }
          AtomColorHighlightEditor || (AtomColorHighlightEditor = require('./atom-color-highlight-editor'));
          colorEditor = new AtomColorHighlightEditor(editor);
          _this.editors[editor.editor.id] = colorEditor;
          return _this.emit('color-highlight:editor-created', colorEditor);
        };
      })(this));
    };

    AtomColorHighlight.prototype.eachColorHighlightEditor = function(callback) {
      var editor, id, _ref;
      if (callback != null) {
        _ref = this.editors;
        for (id in _ref) {
          editor = _ref[id];
          if (typeof callback === "function") {
            callback(editor);
          }
        }
      }
      return this.on('color-highlight:editor-created', callback);
    };

    AtomColorHighlight.prototype.viewForEditorView = function(editorView) {
      if (editorView != null ? editorView.hasClass('editor') : void 0) {
        return this.viewForEditor(editorView.getEditor());
      }
    };

    AtomColorHighlight.prototype.modelForEditorView = function(editorView) {
      if (editorView != null ? editorView.hasClass('editor') : void 0) {
        return this.modelForEditor(editorView.getEditor());
      }
    };

    AtomColorHighlight.prototype.modelForEditor = function(editor) {
      var _ref;
      return (_ref = this.editors[editor.id]) != null ? _ref.getActiveModel() : void 0;
    };

    AtomColorHighlight.prototype.viewForEditor = function(editor) {
      var _ref;
      return (_ref = this.editors[editor.id]) != null ? _ref.getactiveView() : void 0;
    };

    AtomColorHighlight.prototype.deactivate = function() {
      var editor, id, _ref, _results;
      _ref = this.editors;
      _results = [];
      for (id in _ref) {
        editor = _ref[id];
        this.emit('color-highlight:editor-will-be-destroyed', editor);
        _results.push(editor.destroy());
      }
      return _results;
    };

    return AtomColorHighlight;

  })();

  module.exports = new AtomColorHighlight;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHFEQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQyxVQUFXLE9BQUEsQ0FBUSxVQUFSLEVBQVgsT0FBRCxDQUFBOztBQUFBLEVBQ0Esd0JBQUEsR0FBMkIsSUFEM0IsQ0FBQTs7QUFBQSxFQUdNO29DQUNKOztBQUFBLElBQUEsT0FBTyxDQUFDLFdBQVIsQ0FBb0Isa0JBQXBCLENBQUEsQ0FBQTs7QUFBQSxpQ0FFQSxNQUFBLEdBQ0U7QUFBQSxNQUFBLGtCQUFBLEVBQ0U7QUFBQSxRQUFBLElBQUEsRUFBTSxTQUFOO0FBQUEsUUFDQSxTQUFBLEVBQVMsS0FEVDtPQURGO0FBQUEsTUFHQSxxQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sU0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEtBRFQ7T0FKRjtBQUFBLE1BTUEsb0JBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFNBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxLQURUO09BUEY7QUFBQSxNQVNBLGNBQUEsRUFDRTtBQUFBLFFBQUEsSUFBQSxFQUFNLFFBQU47QUFBQSxRQUNBLFNBQUEsRUFBUyxFQURUO0FBQUEsUUFFQSxHQUFBLEVBQUssQ0FGTDtPQVZGO0FBQUEsTUFhQSxpQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sUUFBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLENBRFQ7QUFBQSxRQUVBLEdBQUEsRUFBSyxDQUZMO09BZEY7QUFBQSxNQWlCQSxnQkFBQSxFQUNFO0FBQUEsUUFBQSxJQUFBLEVBQU0sT0FBTjtBQUFBLFFBQ0EsU0FBQSxFQUFTLEVBRFQ7QUFBQSxRQUVBLFdBQUEsRUFBYSx1VEFGYjtBQUFBLFFBR0EsS0FBQSxFQUNFO0FBQUEsVUFBQSxJQUFBLEVBQU0sUUFBTjtTQUpGO09BbEJGO0tBSEYsQ0FB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
//# sourceURL=/Users/daniel/.atom/packages/atom-color-highlight/lib/atom-color-highlight.coffee