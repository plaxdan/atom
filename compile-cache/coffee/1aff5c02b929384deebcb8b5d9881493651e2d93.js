
/*
Requires http://pear.php.net/package/PHP_Beautifier
 */

(function() {
  "use strict";
  var fs, temp;

  fs = require("fs");

  temp = require("temp").track();

  module.exports = function(options, cb) {
    var ic, k, text, v, vs;
    text = "";
    options.output_tab_size = options.output_tab_size || options.indent_size;
    options.input_tab_size = options.input_tab_size || options.indent_size;
    delete options.indent_size;
    ic = options.indent_char;
    if (options.indent_with_tabs === 0 || options.indent_with_tabs === 1 || options.indent_with_tabs === 2) {

    } else if (ic === " ") {
      options.indent_with_tabs = 0;
    } else if (ic === "\t") {
      options.indent_with_tabs = 2;
    } else {
      options.indent_with_tabs = 1;
    }
    delete options.indent_char;
    delete options.languageOverride;
    delete options.configPath;
    for (k in options) {
      v = options[k];
      vs = v;
      if (typeof vs === "boolean") {
        if (vs === true) {
          vs = "True";
        } else {
          vs = "False";
        }
      }
      text += k + " = " + vs + "\n";
    }
    return temp.open({
      suffix: ".cfg"
    }, function(err, info) {
      if (!err) {
        return fs.write(info.fd, text || "", function(err) {
          if (err) {
            return cb(err);
          }
          return fs.close(info.fd, function(err) {
            if (err) {
              return cb(err);
            }
            return cb(null, info.path);
          });
        });
      } else {
        return cb(err);
      }
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7R0FBQTtBQUFBO0FBQUE7QUFBQSxFQUdBLFlBSEEsQ0FBQTtBQUFBLE1BQUEsUUFBQTs7QUFBQSxFQUlBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUpMLENBQUE7O0FBQUEsRUFLQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDLEtBQWhCLENBQUEsQ0FMUCxDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FBaUIsU0FBQyxPQUFELEVBQVUsRUFBVixHQUFBO0FBQ2YsUUFBQSxrQkFBQTtBQUFBLElBQUEsSUFBQSxHQUFPLEVBQVAsQ0FBQTtBQUFBLElBR0EsT0FBTyxDQUFDLGVBQVIsR0FBMEIsT0FBTyxDQUFDLGVBQVIsSUFBMkIsT0FBTyxDQUFDLFdBSDdELENBQUE7QUFBQSxJQUlBLE9BQU8sQ0FBQyxjQUFSLEdBQXlCLE9BQU8sQ0FBQyxjQUFSLElBQTBCLE9BQU8sQ0FBQyxXQUozRCxDQUFBO0FBQUEsSUFLQSxNQUFBLENBQUEsT0FBYyxDQUFDLFdBTGYsQ0FBQTtBQUFBLElBYUEsRUFBQSxHQUFLLE9BQU8sQ0FBQyxXQWJiLENBQUE7QUFjQSxJQUFBLElBQUcsT0FBTyxDQUFDLGdCQUFSLEtBQTRCLENBQTVCLElBQWlDLE9BQU8sQ0FBQyxnQkFBUixLQUE0QixDQUE3RCxJQUFrRSxPQUFPLENBQUMsZ0JBQVIsS0FBNEIsQ0FBakc7QUFBQTtLQUFBLE1BSUssSUFBRyxFQUFBLEtBQU0sR0FBVDtBQUNILE1BQUEsT0FBTyxDQUFDLGdCQUFSLEdBQTJCLENBQTNCLENBREc7S0FBQSxNQUVBLElBQUcsRUFBQSxLQUFNLElBQVQ7QUFDSCxNQUFBLE9BQU8sQ0FBQyxnQkFBUixHQUEyQixDQUEzQixDQURHO0tBQUEsTUFBQTtBQUdILE1BQUEsT0FBTyxDQUFDLGdCQUFSLEdBQTJCLENBQTNCLENBSEc7S0FwQkw7QUFBQSxJQXdCQSxNQUFBLENBQUEsT0FBYyxDQUFDLFdBeEJmLENBQUE7QUFBQSxJQTZCQSxNQUFBLENBQUEsT0FBYyxDQUFDLGdCQTdCZixDQUFBO0FBQUEsSUErQkEsTUFBQSxDQUFBLE9BQWMsQ0FBQyxVQS9CZixDQUFBO0FBbUNBLFNBQUEsWUFBQSxHQUFBO0FBQ0UsTUFBQSxDQUFBLEdBQUksT0FBUSxDQUFBLENBQUEsQ0FBWixDQUFBO0FBQUEsTUFDQSxFQUFBLEdBQUssQ0FETCxDQUFBO0FBRUEsTUFBQSxJQUFHLE1BQUEsQ0FBQSxFQUFBLEtBQWEsU0FBaEI7QUFDRSxRQUFBLElBQUcsRUFBQSxLQUFNLElBQVQ7QUFDRSxVQUFBLEVBQUEsR0FBSyxNQUFMLENBREY7U0FBQSxNQUFBO0FBR0UsVUFBQSxFQUFBLEdBQUssT0FBTCxDQUhGO1NBREY7T0FGQTtBQUFBLE1BT0EsSUFBQSxJQUFRLENBQUEsR0FBSSxLQUFKLEdBQVksRUFBWixHQUFpQixJQVB6QixDQURGO0FBQUEsS0FuQ0E7V0E4Q0EsSUFBSSxDQUFDLElBQUwsQ0FDRTtBQUFBLE1BQUEsTUFBQSxFQUFRLE1BQVI7S0FERixFQUVFLFNBQUMsR0FBRCxFQUFNLElBQU4sR0FBQTtBQUNBLE1BQUEsSUFBQSxDQUFBLEdBQUE7ZUFHRSxFQUFFLENBQUMsS0FBSCxDQUFTLElBQUksQ0FBQyxFQUFkLEVBQWtCLElBQUEsSUFBUSxFQUExQixFQUE4QixTQUFDLEdBQUQsR0FBQTtBQUc1QixVQUFBLElBQW1CLEdBQW5CO0FBQUEsbUJBQU8sRUFBQSxDQUFHLEdBQUgsQ0FBUCxDQUFBO1dBQUE7aUJBQ0EsRUFBRSxDQUFDLEtBQUgsQ0FBUyxJQUFJLENBQUMsRUFBZCxFQUFrQixTQUFDLEdBQUQsR0FBQTtBQUdoQixZQUFBLElBQW1CLEdBQW5CO0FBQUEscUJBQU8sRUFBQSxDQUFHLEdBQUgsQ0FBUCxDQUFBO2FBQUE7bUJBQ0EsRUFBQSxDQUFHLElBQUgsRUFBUyxJQUFJLENBQUMsSUFBZCxFQUpnQjtVQUFBLENBQWxCLEVBSjRCO1FBQUEsQ0FBOUIsRUFIRjtPQUFBLE1BQUE7ZUFlRSxFQUFBLENBQUcsR0FBSCxFQWZGO09BREE7SUFBQSxDQUZGLEVBL0NlO0VBQUEsQ0FOakIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/atom-beautify/lib/langs/uncrustify/cfg.coffee