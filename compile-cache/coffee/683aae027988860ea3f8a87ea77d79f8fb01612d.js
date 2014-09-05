(function() {
  "use strict";
  var prettydiff;

  prettydiff = require("prettydiff");

  module.exports = function(text, options, callback) {
    var args, output, result;
    args = {
      source: text,
      lang: "css",
      mode: "beautify",
      inchar: options.indent_character,
      insize: options.indent_size
    };
    output = prettydiff.api(args);
    result = output[0];
    callback(result);
    return result;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFlBQUEsQ0FBQTtBQUFBLE1BQUEsVUFBQTs7QUFBQSxFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsWUFBUixDQURiLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQsRUFBTyxPQUFQLEVBQWdCLFFBQWhCLEdBQUE7QUFDZixRQUFBLG9CQUFBO0FBQUEsSUFBQSxJQUFBLEdBQ0U7QUFBQSxNQUFBLE1BQUEsRUFBUSxJQUFSO0FBQUEsTUFDQSxJQUFBLEVBQU0sS0FETjtBQUFBLE1BRUEsSUFBQSxFQUFNLFVBRk47QUFBQSxNQUdBLE1BQUEsRUFBUSxPQUFPLENBQUMsZ0JBSGhCO0FBQUEsTUFJQSxNQUFBLEVBQVEsT0FBTyxDQUFDLFdBSmhCO0tBREYsQ0FBQTtBQUFBLElBT0EsTUFBQSxHQUFTLFVBQVUsQ0FBQyxHQUFYLENBQWUsSUFBZixDQVBULENBQUE7QUFBQSxJQVFBLE1BQUEsR0FBUyxNQUFPLENBQUEsQ0FBQSxDQVJoQixDQUFBO0FBQUEsSUFTQSxRQUFBLENBQVMsTUFBVCxDQVRBLENBQUE7V0FVQSxPQVhlO0VBQUEsQ0FGakIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atom-beautify/lib/langs/less-beautify.coffee