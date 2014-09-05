
/*
Requires https://github.com/hhatto/autopep8
 */

(function() {
  var cliBeautify, getCmd, isStdout;

  getCmd = function(inputPath, outputPath, options) {
    var optionsStr, path;
    path = options.autopep8_path;
    optionsStr = "--max-line-length " + options.max_line_length + " --indent-size " + options.indent_size + " --ignore " + options.ignore.join(",");
    if (path) {
      return "python \"" + path + "\" \"" + inputPath + "\" " + optionsStr;
    } else {
      return "autopep8 \"" + inputPath + "\" " + optionsStr;
    }
  };

  "use strict";

  cliBeautify = require("./cli-beautify");

  isStdout = true;

  module.exports = cliBeautify(getCmd, isStdout);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7R0FBQTtBQUFBO0FBQUE7QUFBQSxNQUFBLDZCQUFBOztBQUFBLEVBR0EsTUFBQSxHQUFTLFNBQUMsU0FBRCxFQUFZLFVBQVosRUFBd0IsT0FBeEIsR0FBQTtBQUNQLFFBQUEsZ0JBQUE7QUFBQSxJQUFBLElBQUEsR0FBTyxPQUFPLENBQUMsYUFBZixDQUFBO0FBQUEsSUFHQSxVQUFBLEdBQWEsb0JBQUEsR0FBdUIsT0FBTyxDQUFDLGVBQS9CLEdBQWlELGlCQUFqRCxHQUFxRSxPQUFPLENBQUMsV0FBN0UsR0FBMkYsWUFBM0YsR0FBMEcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFmLENBQW9CLEdBQXBCLENBSHZILENBQUE7QUFJQSxJQUFBLElBQUcsSUFBSDthQUdFLFdBQUEsR0FBYyxJQUFkLEdBQXFCLE9BQXJCLEdBQStCLFNBQS9CLEdBQTJDLEtBQTNDLEdBQW1ELFdBSHJEO0tBQUEsTUFBQTthQU9FLGFBQUEsR0FBZ0IsU0FBaEIsR0FBNEIsS0FBNUIsR0FBb0MsV0FQdEM7S0FMTztFQUFBLENBSFQsQ0FBQTs7QUFBQSxFQWdCQSxZQWhCQSxDQUFBOztBQUFBLEVBaUJBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FqQmQsQ0FBQTs7QUFBQSxFQWtCQSxRQUFBLEdBQVcsSUFsQlgsQ0FBQTs7QUFBQSxFQW1CQSxNQUFNLENBQUMsT0FBUCxHQUFpQixXQUFBLENBQVksTUFBWixFQUFvQixRQUFwQixDQW5CakIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atom-beautify/lib/langs/python-beautify.coffee