(function() {
  "use strict";
  var CF;

  CF = require("coffee-formatter");

  module.exports = function(text, options, callback) {
    var curr, i, len, lines, p, result, resultArr;
    lines = text.split("\n");
    resultArr = [];
    i = 0;
    len = lines.length;
    while (i < len) {
      curr = lines[i];
      p = CF.formatTwoSpaceOperator(curr);
      p = CF.formatOneSpaceOperator(p);
      p = CF.shortenSpaces(p);
      resultArr.push(p);
      i++;
    }
    result = resultArr.join("\n");
    callback(result);
    return result;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFlBQUEsQ0FBQTtBQUFBLE1BQUEsRUFBQTs7QUFBQSxFQUNBLEVBQUEsR0FBSyxPQUFBLENBQVEsa0JBQVIsQ0FETCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxJQUFELEVBQU8sT0FBUCxFQUFnQixRQUFoQixHQUFBO0FBQ2YsUUFBQSx5Q0FBQTtBQUFBLElBQUEsS0FBQSxHQUFRLElBQUksQ0FBQyxLQUFMLENBQVcsSUFBWCxDQUFSLENBQUE7QUFBQSxJQUNBLFNBQUEsR0FBWSxFQURaLENBQUE7QUFBQSxJQUVBLENBQUEsR0FBSSxDQUZKLENBQUE7QUFBQSxJQUdBLEdBQUEsR0FBTSxLQUFLLENBQUMsTUFIWixDQUFBO0FBS0EsV0FBTSxDQUFBLEdBQUksR0FBVixHQUFBO0FBQ0UsTUFBQSxJQUFBLEdBQU8sS0FBTSxDQUFBLENBQUEsQ0FBYixDQUFBO0FBQUEsTUFDQSxDQUFBLEdBQUksRUFBRSxDQUFDLHNCQUFILENBQTBCLElBQTFCLENBREosQ0FBQTtBQUFBLE1BRUEsQ0FBQSxHQUFJLEVBQUUsQ0FBQyxzQkFBSCxDQUEwQixDQUExQixDQUZKLENBQUE7QUFBQSxNQUdBLENBQUEsR0FBSSxFQUFFLENBQUMsYUFBSCxDQUFpQixDQUFqQixDQUhKLENBQUE7QUFBQSxNQUlBLFNBQVMsQ0FBQyxJQUFWLENBQWUsQ0FBZixDQUpBLENBQUE7QUFBQSxNQUtBLENBQUEsRUFMQSxDQURGO0lBQUEsQ0FMQTtBQUFBLElBWUEsTUFBQSxHQUFTLFNBQVMsQ0FBQyxJQUFWLENBQWUsSUFBZixDQVpULENBQUE7QUFBQSxJQWFBLFFBQUEsQ0FBUyxNQUFULENBYkEsQ0FBQTtXQWNBLE9BZmU7RUFBQSxDQUZqQixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/atom-beautify/lib/langs/coffeescript-beautify.coffee