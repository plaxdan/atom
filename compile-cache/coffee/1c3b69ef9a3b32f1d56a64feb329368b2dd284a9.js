
/*
Requires https://github.com/andialbrecht/sqlparse
 */

(function() {
  var cliBeautify, getCmd, isStdout;

  getCmd = function(inputPath, outputPath, options) {
    var optionsStr, path;
    path = options.sqlformat_path;
    optionsStr = " --indent_width={0} --keywords={1} --identifiers={2} --reindent";
    optionsStr = optionsStr.replace("{0}", options.indent_size).replace("{1}", options.keywords).replace("{2}", options.identifiers);
    if (path) {
      return "python \"" + path + "\" \"" + inputPath + "\" " + optionsStr;
    } else {
      return "sqlformat \"" + inputPath + "\" " + optionsStr;
    }
  };

  "use strict";

  cliBeautify = require("./cli-beautify");

  isStdout = true;

  module.exports = cliBeautify(getCmd, isStdout);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7R0FBQTtBQUFBO0FBQUE7QUFBQSxNQUFBLDZCQUFBOztBQUFBLEVBR0EsTUFBQSxHQUFTLFNBQUMsU0FBRCxFQUFZLFVBQVosRUFBd0IsT0FBeEIsR0FBQTtBQUNQLFFBQUEsZ0JBQUE7QUFBQSxJQUFBLElBQUEsR0FBTyxPQUFPLENBQUMsY0FBZixDQUFBO0FBQUEsSUFDQSxVQUFBLEdBQWEsaUVBRGIsQ0FBQTtBQUFBLElBRUEsVUFBQSxHQUFhLFVBQVUsQ0FBQyxPQUFYLENBQW1CLEtBQW5CLEVBQTBCLE9BQU8sQ0FBQyxXQUFsQyxDQUNRLENBQUMsT0FEVCxDQUNpQixLQURqQixFQUN3QixPQUFPLENBQUMsUUFEaEMsQ0FFSyxDQUFDLE9BRk4sQ0FFYyxLQUZkLEVBRXFCLE9BQU8sQ0FBQyxXQUY3QixDQUZiLENBQUE7QUFLQSxJQUFBLElBQUcsSUFBSDthQUVFLFdBQUEsR0FBYyxJQUFkLEdBQXFCLE9BQXJCLEdBQStCLFNBQS9CLEdBQTJDLEtBQTNDLEdBQW1ELFdBRnJEO0tBQUEsTUFBQTthQUtFLGNBQUEsR0FBaUIsU0FBakIsR0FBNkIsS0FBN0IsR0FBcUMsV0FMdkM7S0FOTztFQUFBLENBSFQsQ0FBQTs7QUFBQSxFQWdCQSxZQWhCQSxDQUFBOztBQUFBLEVBaUJBLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVIsQ0FqQmQsQ0FBQTs7QUFBQSxFQWtCQSxRQUFBLEdBQVcsSUFsQlgsQ0FBQTs7QUFBQSxFQW1CQSxNQUFNLENBQUMsT0FBUCxHQUFpQixXQUFBLENBQVksTUFBWixFQUFvQixRQUFwQixDQW5CakIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atom-beautify/lib/langs/sql-beautify.coffee