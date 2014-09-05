
/*
Requires http://pear.php.net/package/PHP_Beautifier
 */

(function() {
  var cfg, cliBeautify, getCmd, path;

  getCmd = function(inputPath, outputPath, options, cb) {
    var basePath, configPath, done, editor, lang;
    done = function(configPath) {
      var cmd;
      cmd = "uncrustify -c \"" + configPath + "\" -f \"" + inputPath + "\" -o \"" + outputPath + "\" -l \"" + lang + "\"";
      return cb(cmd);
    };
    configPath = options.configPath;
    lang = options.languageOverride || "C";
    if (!configPath) {
      cfg(options, function(error, path) {
        if (error) {
          throw error;
        }
        return done(path);
      });
    } else {
      editor = atom.workspace.getActiveEditor();
      basePath = path.dirname(editor.getPath());
      configPath = path.resolve(basePath, configPath);
      done(configPath);
    }
  };

  "use strict";

  cliBeautify = require("../cli-beautify");

  cfg = require("./cfg");

  path = require("path");

  module.exports = cliBeautify(getCmd);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7R0FBQTtBQUFBO0FBQUE7QUFBQSxNQUFBLDhCQUFBOztBQUFBLEVBR0EsTUFBQSxHQUFTLFNBQUMsU0FBRCxFQUFZLFVBQVosRUFBd0IsT0FBeEIsRUFBaUMsRUFBakMsR0FBQTtBQUdQLFFBQUEsd0NBQUE7QUFBQSxJQUFBLElBQUEsR0FBTyxTQUFDLFVBQUQsR0FBQTtBQUlMLFVBQUEsR0FBQTtBQUFBLE1BQUEsR0FBQSxHQUFNLGtCQUFBLEdBQXFCLFVBQXJCLEdBQWtDLFVBQWxDLEdBQStDLFNBQS9DLEdBQTJELFVBQTNELEdBQXdFLFVBQXhFLEdBQXFGLFVBQXJGLEdBQWtHLElBQWxHLEdBQXlHLElBQS9HLENBQUE7YUFHQSxFQUFBLENBQUcsR0FBSCxFQVBLO0lBQUEsQ0FBUCxDQUFBO0FBQUEsSUFRQSxVQUFBLEdBQWEsT0FBTyxDQUFDLFVBUnJCLENBQUE7QUFBQSxJQVNBLElBQUEsR0FBTyxPQUFPLENBQUMsZ0JBQVIsSUFBNEIsR0FUbkMsQ0FBQTtBQVVBLElBQUEsSUFBQSxDQUFBLFVBQUE7QUFHRSxNQUFBLEdBQUEsQ0FBSSxPQUFKLEVBQWEsU0FBQyxLQUFELEVBQVEsSUFBUixHQUFBO0FBQ1gsUUFBQSxJQUFnQixLQUFoQjtBQUFBLGdCQUFNLEtBQU4sQ0FBQTtTQUFBO2VBQ0EsSUFBQSxDQUFLLElBQUwsRUFGVztNQUFBLENBQWIsQ0FBQSxDQUhGO0tBQUEsTUFBQTtBQVVFLE1BQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsZUFBZixDQUFBLENBQVQsQ0FBQTtBQUFBLE1BQ0EsUUFBQSxHQUFXLElBQUksQ0FBQyxPQUFMLENBQWEsTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFiLENBRFgsQ0FBQTtBQUFBLE1BSUEsVUFBQSxHQUFhLElBQUksQ0FBQyxPQUFMLENBQWEsUUFBYixFQUF1QixVQUF2QixDQUpiLENBQUE7QUFBQSxNQUtBLElBQUEsQ0FBSyxVQUFMLENBTEEsQ0FWRjtLQWJPO0VBQUEsQ0FIVCxDQUFBOztBQUFBLEVBaUNBLFlBakNBLENBQUE7O0FBQUEsRUFrQ0EsV0FBQSxHQUFjLE9BQUEsQ0FBUSxpQkFBUixDQWxDZCxDQUFBOztBQUFBLEVBbUNBLEdBQUEsR0FBTSxPQUFBLENBQVEsT0FBUixDQW5DTixDQUFBOztBQUFBLEVBb0NBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQXBDUCxDQUFBOztBQUFBLEVBcUNBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFdBQUEsQ0FBWSxNQUFaLENBckNqQixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/atom-beautify/lib/langs/uncrustify/index.coffee