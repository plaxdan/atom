(function() {
  var coffee, fs, path;

  coffee = require('coffee-script');

  fs = require('fs');

  path = require('path');

  module.exports = {

    /*
    @name getTextEditorById
    @param {String} id
    @returns {Editor|null}
     */
    getTextEditorById: function(id) {
      var editor, _i, _len, _ref, _ref1;
      _ref = atom.workspace.getTextEditors();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        editor = _ref[_i];
        if (((_ref1 = editor.id) != null ? _ref1.toString() : void 0) === id.toString()) {
          return editor;
        }
      }
      return null;
    },

    /*
    @name compile
    @param {Editor} editor
    @param {String} code
    @returns {String} Compiled code
     */
    compile: function(code, literate) {
      var bare;
      if (literate == null) {
        literate = false;
      }
      bare = atom.config.get('coffee-compile.noTopLevelFunctionWrapper') || true;
      return coffee.compile(code, {
        bare: bare,
        literate: literate
      });
    },

    /*
    @name getSelectedCode
    @param {Editor} editor
    @returns {String} Selected text
     */
    getSelectedCode: function(editor) {
      var range, text;
      range = editor.getSelectedBufferRange();
      text = range.isEmpty() ? editor.getText() : editor.getTextInBufferRange(range);
      return text;
    },

    /*
    @name isLiterate
    @param {Editor} editor
    @returns {Boolean}
     */
    isLiterate: function(editor) {
      var grammarScopeName;
      grammarScopeName = editor.getGrammar().scopeName;
      return grammarScopeName === "source.litcoffee";
    },

    /*
    @name compileToFile
    @param {Editor} editor
    @param {Function} callback
     */
    compileToFile: function(editor, callback) {
      var destPath, e, literate, srcExt, srcPath, text;
      try {
        literate = this.isLiterate(editor);
        text = this.compile(editor.getText(), literate);
        srcPath = editor.getPath();
        srcExt = path.extname(srcPath);
        destPath = path.join(path.dirname(srcPath), "" + (path.basename(srcPath, srcExt)) + ".js");
        return fs.writeFile(destPath, text, callback);
      } catch (_error) {
        e = _error;
        return console.error("Coffee-compile: " + e.stack);
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdCQUFBOztBQUFBLEVBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxlQUFSLENBQVQsQ0FBQTs7QUFBQSxFQUNBLEVBQUEsR0FBUyxPQUFBLENBQVEsSUFBUixDQURULENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQVMsT0FBQSxDQUFRLE1BQVIsQ0FGVCxDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBO0FBQUE7Ozs7T0FBQTtBQUFBLElBS0EsaUJBQUEsRUFBbUIsU0FBQyxFQUFELEdBQUE7QUFDakIsVUFBQSw2QkFBQTtBQUFBO0FBQUEsV0FBQSwyQ0FBQTswQkFBQTtBQUNFLFFBQUEsd0NBQTBCLENBQUUsUUFBWCxDQUFBLFdBQUEsS0FBeUIsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUExQztBQUFBLGlCQUFPLE1BQVAsQ0FBQTtTQURGO0FBQUEsT0FBQTtBQUdBLGFBQU8sSUFBUCxDQUppQjtJQUFBLENBTG5CO0FBV0E7QUFBQTs7Ozs7T0FYQTtBQUFBLElBaUJBLE9BQUEsRUFBUyxTQUFDLElBQUQsRUFBTyxRQUFQLEdBQUE7QUFDUCxVQUFBLElBQUE7O1FBRGMsV0FBVztPQUN6QjtBQUFBLE1BQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiwwQ0FBaEIsQ0FBQSxJQUErRCxJQUF0RSxDQUFBO0FBRUEsYUFBTyxNQUFNLENBQUMsT0FBUCxDQUFlLElBQWYsRUFBcUI7QUFBQSxRQUFDLE1BQUEsSUFBRDtBQUFBLFFBQU8sVUFBQSxRQUFQO09BQXJCLENBQVAsQ0FITztJQUFBLENBakJUO0FBc0JBO0FBQUE7Ozs7T0F0QkE7QUFBQSxJQTJCQSxlQUFBLEVBQWlCLFNBQUMsTUFBRCxHQUFBO0FBQ2YsVUFBQSxXQUFBO0FBQUEsTUFBQSxLQUFBLEdBQVEsTUFBTSxDQUFDLHNCQUFQLENBQUEsQ0FBUixDQUFBO0FBQUEsTUFDQSxJQUFBLEdBQ0ssS0FBSyxDQUFDLE9BQU4sQ0FBQSxDQUFILEdBQ0UsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQURGLEdBR0UsTUFBTSxDQUFDLG9CQUFQLENBQTRCLEtBQTVCLENBTEosQ0FBQTtBQU9BLGFBQU8sSUFBUCxDQVJlO0lBQUEsQ0EzQmpCO0FBcUNBO0FBQUE7Ozs7T0FyQ0E7QUFBQSxJQTBDQSxVQUFBLEVBQVksU0FBQyxNQUFELEdBQUE7QUFDVixVQUFBLGdCQUFBO0FBQUEsTUFBQSxnQkFBQSxHQUFtQixNQUFNLENBQUMsVUFBUCxDQUFBLENBQW1CLENBQUMsU0FBdkMsQ0FBQTtBQUVBLGFBQU8sZ0JBQUEsS0FBb0Isa0JBQTNCLENBSFU7SUFBQSxDQTFDWjtBQStDQTtBQUFBOzs7O09BL0NBO0FBQUEsSUFvREEsYUFBQSxFQUFlLFNBQUMsTUFBRCxFQUFTLFFBQVQsR0FBQTtBQUNiLFVBQUEsNENBQUE7QUFBQTtBQUNFLFFBQUEsUUFBQSxHQUFXLElBQUMsQ0FBQSxVQUFELENBQVksTUFBWixDQUFYLENBQUE7QUFBQSxRQUNBLElBQUEsR0FBVyxJQUFDLENBQUEsT0FBRCxDQUFTLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBVCxFQUEyQixRQUEzQixDQURYLENBQUE7QUFBQSxRQUVBLE9BQUEsR0FBVyxNQUFNLENBQUMsT0FBUCxDQUFBLENBRlgsQ0FBQTtBQUFBLFFBR0EsTUFBQSxHQUFXLElBQUksQ0FBQyxPQUFMLENBQWEsT0FBYixDQUhYLENBQUE7QUFBQSxRQUlBLFFBQUEsR0FBVyxJQUFJLENBQUMsSUFBTCxDQUNULElBQUksQ0FBQyxPQUFMLENBQWEsT0FBYixDQURTLEVBQ2MsRUFBQSxHQUFFLENBQUEsSUFBSSxDQUFDLFFBQUwsQ0FBYyxPQUFkLEVBQXVCLE1BQXZCLENBQUEsQ0FBRixHQUFrQyxLQURoRCxDQUpYLENBQUE7ZUFPQSxFQUFFLENBQUMsU0FBSCxDQUFhLFFBQWIsRUFBdUIsSUFBdkIsRUFBNkIsUUFBN0IsRUFSRjtPQUFBLGNBQUE7QUFXRSxRQURJLFVBQ0osQ0FBQTtlQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWUsa0JBQUEsR0FBaUIsQ0FBQyxDQUFDLEtBQWxDLEVBWEY7T0FEYTtJQUFBLENBcERmO0dBTEYsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/coffee-compile/lib/util.coffee