
/*
Requires https://github.com/erniebrodeur/ruby-beautify
 */

(function() {
  var cliBeautify, getCmd, isStdout;

  getCmd = function(inputPath, outputPath, options) {
    var path;
    path = options.rbeautify_path;
    if (path) {
      return "ruby \"" + path + "\" \"" + inputPath + "\"";
    } else {
      return "rbeautify \"" + inputPath + "\"";
    }
  };

  "use strict";

  cliBeautify = require("./cli-beautify");

  isStdout = true;

  module.exports = cliBeautify(getCmd, isStdout);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7R0FBQTtBQUFBO0FBQUE7QUFBQSxNQUFBLDZCQUFBOztBQUFBLEVBR0EsTUFBQSxHQUFTLFNBQUMsU0FBRCxFQUFZLFVBQVosRUFBd0IsT0FBeEIsR0FBQTtBQUNQLFFBQUEsSUFBQTtBQUFBLElBQUEsSUFBQSxHQUFPLE9BQU8sQ0FBQyxjQUFmLENBQUE7QUFDQSxJQUFBLElBQUcsSUFBSDthQUdFLFNBQUEsR0FBWSxJQUFaLEdBQW1CLE9BQW5CLEdBQTZCLFNBQTdCLEdBQXlDLEtBSDNDO0tBQUEsTUFBQTthQU9FLGNBQUEsR0FBaUIsU0FBakIsR0FBNkIsS0FQL0I7S0FGTztFQUFBLENBSFQsQ0FBQTs7QUFBQSxFQWFBLFlBYkEsQ0FBQTs7QUFBQSxFQWNBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FkZCxDQUFBOztBQUFBLEVBZUEsUUFBQSxHQUFXLElBZlgsQ0FBQTs7QUFBQSxFQWdCQSxNQUFNLENBQUMsT0FBUCxHQUFpQixXQUFBLENBQVksTUFBWixFQUFvQixRQUFwQixDQWhCakIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atom-beautify/lib/langs/ruby-beautify.coffee