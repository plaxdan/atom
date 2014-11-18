
/*
Requires http://uncrustify.sourceforge.net/
 */

(function() {
  "use strict";
  var cfg, cliBeautify, getCmd, path;

  cliBeautify = require("../cli-beautify");

  cfg = require("./cfg");

  path = require("path");

  getCmd = function(inputPath, outputPath, options, cb) {
    var basePath, configPath, done, editor, lang, uncrustifyPath;
    uncrustifyPath = options.uncrustifyPath;
    done = function(configPath) {
      var cmd;
      if (uncrustifyPath) {
        cmd = "" + uncrustifyPath + " -c \"" + configPath + "\" -f \"" + inputPath + "\" -o \"" + outputPath + "\" -l \"" + lang + "\"";
      } else {
        cmd = "uncrustify -c \"" + configPath + "\" -f \"" + inputPath + "\" -o \"" + outputPath + "\" -l \"" + lang + "\"";
      }
      return cb(cmd);
    };
    configPath = options.configPath;
    lang = options.languageOverride || "C";
    if (!configPath) {
      cfg(options, function(error, cPath) {
        if (error) {
          throw error;
        }
        return done(cPath);
      });
    } else {
      editor = atom.workspace.getActiveEditor();
      basePath = path.dirname(editor.getPath());
      configPath = path.resolve(basePath, configPath);
      done(configPath);
    }
  };

  module.exports = cliBeautify(getCmd);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7R0FBQTtBQUFBO0FBQUE7QUFBQSxFQUdBLFlBSEEsQ0FBQTtBQUFBLE1BQUEsOEJBQUE7O0FBQUEsRUFJQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGlCQUFSLENBSmQsQ0FBQTs7QUFBQSxFQUtBLEdBQUEsR0FBTSxPQUFBLENBQVEsT0FBUixDQUxOLENBQUE7O0FBQUEsRUFNQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FOUCxDQUFBOztBQUFBLEVBT0EsTUFBQSxHQUFTLFNBQUMsU0FBRCxFQUFZLFVBQVosRUFBd0IsT0FBeEIsRUFBaUMsRUFBakMsR0FBQTtBQUNQLFFBQUEsd0RBQUE7QUFBQSxJQUFBLGNBQUEsR0FBaUIsT0FBTyxDQUFDLGNBQXpCLENBQUE7QUFBQSxJQUlBLElBQUEsR0FBTyxTQUFDLFVBQUQsR0FBQTtBQUVMLFVBQUEsR0FBQTtBQUFBLE1BQUEsSUFBRyxjQUFIO0FBRUUsUUFBQSxHQUFBLEdBQU0sRUFBQSxHQUFFLGNBQUYsR0FBa0IsUUFBbEIsR0FBeUIsVUFBekIsR0FBcUMsVUFBckMsR0FBOEMsU0FBOUMsR0FBeUQsVUFBekQsR0FBa0UsVUFBbEUsR0FBOEUsVUFBOUUsR0FBdUYsSUFBdkYsR0FBNkYsSUFBbkcsQ0FGRjtPQUFBLE1BQUE7QUFLRSxRQUFBLEdBQUEsR0FBTyxrQkFBQSxHQUFpQixVQUFqQixHQUE2QixVQUE3QixHQUFzQyxTQUF0QyxHQUFpRCxVQUFqRCxHQUEwRCxVQUExRCxHQUFzRSxVQUF0RSxHQUErRSxJQUEvRSxHQUFxRixJQUE1RixDQUxGO09BQUE7YUFPQSxFQUFBLENBQUcsR0FBSCxFQVRLO0lBQUEsQ0FKUCxDQUFBO0FBQUEsSUFjQSxVQUFBLEdBQWEsT0FBTyxDQUFDLFVBZHJCLENBQUE7QUFBQSxJQWVBLElBQUEsR0FBTyxPQUFPLENBQUMsZ0JBQVIsSUFBNEIsR0FmbkMsQ0FBQTtBQWdCQSxJQUFBLElBQUEsQ0FBQSxVQUFBO0FBRUUsTUFBQSxHQUFBLENBQUksT0FBSixFQUFhLFNBQUMsS0FBRCxFQUFRLEtBQVIsR0FBQTtBQUNYLFFBQUEsSUFBZ0IsS0FBaEI7QUFBQSxnQkFBTSxLQUFOLENBQUE7U0FBQTtlQUNBLElBQUEsQ0FBSyxLQUFMLEVBRlc7TUFBQSxDQUFiLENBQUEsQ0FGRjtLQUFBLE1BQUE7QUFPRSxNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWYsQ0FBQSxDQUFULENBQUE7QUFBQSxNQUNBLFFBQUEsR0FBVyxJQUFJLENBQUMsT0FBTCxDQUFhLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBYixDQURYLENBQUE7QUFBQSxNQUdBLFVBQUEsR0FBYSxJQUFJLENBQUMsT0FBTCxDQUFhLFFBQWIsRUFBdUIsVUFBdkIsQ0FIYixDQUFBO0FBQUEsTUFJQSxJQUFBLENBQUssVUFBTCxDQUpBLENBUEY7S0FqQk87RUFBQSxDQVBULENBQUE7O0FBQUEsRUFxQ0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsV0FBQSxDQUFZLE1BQVosQ0FyQ2pCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/atom-beautify/lib/langs/uncrustify/index.coffee