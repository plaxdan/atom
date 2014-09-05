
/*
Requires http://pear.php.net/package/PHP_Beautifier
 */

(function() {
  var cliBeautify, getCmd;

  getCmd = function(inputPath, outputPath, options) {
    var phpBeautifierPath;
    phpBeautifierPath = options.beautifier_path;
    if (phpBeautifierPath) {
      return "php \"" + phpBeautifierPath + "\" \"" + inputPath + "\" \"" + outputPath + "\"";
    } else {
      return "php_beautifier \"" + inputPath + "\" \"" + outputPath + "\"";
    }
  };

  "use strict";

  cliBeautify = require("./cli-beautify");

  module.exports = cliBeautify(getCmd);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7R0FBQTtBQUFBO0FBQUE7QUFBQSxNQUFBLG1CQUFBOztBQUFBLEVBR0EsTUFBQSxHQUFTLFNBQUMsU0FBRCxFQUFZLFVBQVosRUFBd0IsT0FBeEIsR0FBQTtBQUNQLFFBQUEsaUJBQUE7QUFBQSxJQUFBLGlCQUFBLEdBQW9CLE9BQU8sQ0FBQyxlQUE1QixDQUFBO0FBQ0EsSUFBQSxJQUFHLGlCQUFIO2FBR0UsUUFBQSxHQUFXLGlCQUFYLEdBQStCLE9BQS9CLEdBQXlDLFNBQXpDLEdBQXFELE9BQXJELEdBQStELFVBQS9ELEdBQTRFLEtBSDlFO0tBQUEsTUFBQTthQU9FLG1CQUFBLEdBQXNCLFNBQXRCLEdBQWtDLE9BQWxDLEdBQTRDLFVBQTVDLEdBQXlELEtBUDNEO0tBRk87RUFBQSxDQUhULENBQUE7O0FBQUEsRUFhQSxZQWJBLENBQUE7O0FBQUEsRUFjQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSLENBZGQsQ0FBQTs7QUFBQSxFQWVBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFdBQUEsQ0FBWSxNQUFaLENBZmpCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/atom-beautify/lib/langs/php-beautify.coffee