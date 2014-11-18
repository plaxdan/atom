
/*
Requires http://pear.php.net/package/PHP_Beautifier
 */

(function() {
  "use strict";
  var exec, fs, temp;

  fs = require("fs");

  temp = require("temp").track();

  exec = require("child_process").exec;

  module.exports = function(getCmd, isStdout) {
    return function(text, options, callback) {
      temp.open("input", function(err, info) {
        if (!err) {
          fs.write(info.fd, text || "", function() {
            fs.close(info.fd, function(err) {
              var cmd, deleteOutputFile, outputPath, processCmd;
              if (!err) {
                outputPath = temp.path();
                deleteOutputFile = function() {
                  temp.cleanup();
                  fs.unlink(outputPath, function(err) {
                    if (err) {
                      console.log("Deleting output file", err);
                    }
                  });
                };
                processCmd = function(cmd) {
                  var $path, config, isWin;
                  if (cmd) {
                    config = {
                      env: process.env
                    };
                    isWin = /^win/.test(process.platform);
                    if (!isWin) {
                      $path = "[ -f ~/.bash_profile ] && source ~/.bash_profile;";
                      $path += "[ -f ~/.bashrc ] && source ~/.bashrc;";
                      cmd = $path + cmd;
                    }
                    exec(cmd, config, function(err, stdout, stderr) {
                      if (!err) {
                        if (isStdout) {
                          callback(stdout);
                          deleteOutputFile();
                        } else {
                          fs.readFile(outputPath, "utf8", function(err, newText) {
                            callback(newText);
                            deleteOutputFile();
                          });
                        }
                      } else {
                        console.log("Beautifcation Error: ", err);
                        callback(err);
                        deleteOutputFile();
                      }
                    });
                  } else {
                    console.log("Beautify CLI command not valid.");
                    callback(new Error("Beautify CLI command not valid."));
                  }
                };
                cmd = getCmd(info.path, outputPath, options, processCmd);
                if (typeof cmd === "string") {
                  processCmd(cmd);
                }
              }
            });
          });
        }
      });
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQTs7R0FBQTtBQUFBO0FBQUE7QUFBQSxFQUdBLFlBSEEsQ0FBQTtBQUFBLE1BQUEsY0FBQTs7QUFBQSxFQUlBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUixDQUpMLENBQUE7O0FBQUEsRUFLQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDLEtBQWhCLENBQUEsQ0FMUCxDQUFBOztBQUFBLEVBTUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxlQUFSLENBQXdCLENBQUMsSUFOaEMsQ0FBQTs7QUFBQSxFQU9BLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsTUFBRCxFQUFTLFFBQVQsR0FBQTtXQUNmLFNBQUMsSUFBRCxFQUFPLE9BQVAsRUFBZ0IsUUFBaEIsR0FBQTtBQUdFLE1BQUEsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLEVBQW1CLFNBQUMsR0FBRCxFQUFNLElBQU4sR0FBQTtBQUNqQixRQUFBLElBQUEsQ0FBQSxHQUFBO0FBR0UsVUFBQSxFQUFFLENBQUMsS0FBSCxDQUFTLElBQUksQ0FBQyxFQUFkLEVBQWtCLElBQUEsSUFBUSxFQUExQixFQUE4QixTQUFBLEdBQUE7QUFDNUIsWUFBQSxFQUFFLENBQUMsS0FBSCxDQUFTLElBQUksQ0FBQyxFQUFkLEVBQWtCLFNBQUMsR0FBRCxHQUFBO0FBQ2hCLGtCQUFBLDZDQUFBO0FBQUEsY0FBQSxJQUFBLENBQUEsR0FBQTtBQUdFLGdCQUFBLFVBQUEsR0FBYSxJQUFJLENBQUMsSUFBTCxDQUFBLENBQWIsQ0FBQTtBQUFBLGdCQUNBLGdCQUFBLEdBQW1CLFNBQUEsR0FBQTtBQUNqQixrQkFBQSxJQUFJLENBQUMsT0FBTCxDQUFBLENBQUEsQ0FBQTtBQUFBLGtCQUVBLEVBQUUsQ0FBQyxNQUFILENBQVUsVUFBVixFQUFzQixTQUFDLEdBQUQsR0FBQTtBQUNwQixvQkFBQSxJQUE0QyxHQUE1QztBQUFBLHNCQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksc0JBQVosRUFBb0MsR0FBcEMsQ0FBQSxDQUFBO3FCQURvQjtrQkFBQSxDQUF0QixDQUZBLENBRGlCO2dCQUFBLENBRG5CLENBQUE7QUFBQSxnQkFVQSxVQUFBLEdBQWEsU0FBQyxHQUFELEdBQUE7QUFDWCxzQkFBQSxvQkFBQTtBQUFBLGtCQUFBLElBQUcsR0FBSDtBQUNFLG9CQUFBLE1BQUEsR0FBUztBQUFBLHNCQUFBLEdBQUEsRUFBSyxPQUFPLENBQUMsR0FBYjtxQkFBVCxDQUFBO0FBQUEsb0JBQ0EsS0FBQSxHQUFRLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBTyxDQUFDLFFBQXBCLENBRFIsQ0FBQTtBQUVBLG9CQUFBLElBQUEsQ0FBQSxLQUFBO0FBTUUsc0JBQUEsS0FBQSxHQUFRLG1EQUFSLENBQUE7QUFBQSxzQkFDQSxLQUFBLElBQVMsdUNBRFQsQ0FBQTtBQUFBLHNCQUtBLEdBQUEsR0FBTSxLQUFBLEdBQVEsR0FMZCxDQU5GO3FCQUZBO0FBQUEsb0JBZ0JBLElBQUEsQ0FBSyxHQUFMLEVBQVUsTUFBVixFQUFrQixTQUFDLEdBQUQsRUFBTSxNQUFOLEVBQWMsTUFBZCxHQUFBO0FBR2hCLHNCQUFBLElBQUEsQ0FBQSxHQUFBO0FBR0Usd0JBQUEsSUFBRyxRQUFIO0FBR0UsMEJBQUEsUUFBQSxDQUFTLE1BQVQsQ0FBQSxDQUFBO0FBQUEsMEJBQ0EsZ0JBQUEsQ0FBQSxDQURBLENBSEY7eUJBQUEsTUFBQTtBQVFFLDBCQUFBLEVBQUUsQ0FBQyxRQUFILENBQVksVUFBWixFQUF3QixNQUF4QixFQUFnQyxTQUFDLEdBQUQsRUFBTSxPQUFOLEdBQUE7QUFHOUIsNEJBQUEsUUFBQSxDQUFTLE9BQVQsQ0FBQSxDQUFBO0FBQUEsNEJBQ0EsZ0JBQUEsQ0FBQSxDQURBLENBSDhCOzBCQUFBLENBQWhDLENBQUEsQ0FSRjt5QkFIRjt1QkFBQSxNQUFBO0FBbUJFLHdCQUFBLE9BQU8sQ0FBQyxHQUFSLENBQVksdUJBQVosRUFBcUMsR0FBckMsQ0FBQSxDQUFBO0FBQUEsd0JBQ0EsUUFBQSxDQUFTLEdBQVQsQ0FEQSxDQUFBO0FBQUEsd0JBRUEsZ0JBQUEsQ0FBQSxDQUZBLENBbkJGO3VCQUhnQjtvQkFBQSxDQUFsQixDQWhCQSxDQURGO21CQUFBLE1BQUE7QUE2Q0Usb0JBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxpQ0FBWixDQUFBLENBQUE7QUFBQSxvQkFDQSxRQUFBLENBQWEsSUFBQSxLQUFBLENBQU0saUNBQU4sQ0FBYixDQURBLENBN0NGO21CQURXO2dCQUFBLENBVmIsQ0FBQTtBQUFBLGdCQThEQSxHQUFBLEdBQU0sTUFBQSxDQUFPLElBQUksQ0FBQyxJQUFaLEVBQWtCLFVBQWxCLEVBQThCLE9BQTlCLEVBQXVDLFVBQXZDLENBOUROLENBQUE7QUErREEsZ0JBQUEsSUFBbUIsTUFBQSxDQUFBLEdBQUEsS0FBYyxRQUFqQztBQUFBLGtCQUFBLFVBQUEsQ0FBVyxHQUFYLENBQUEsQ0FBQTtpQkFsRUY7ZUFEZ0I7WUFBQSxDQUFsQixDQUFBLENBRDRCO1VBQUEsQ0FBOUIsQ0FBQSxDQUhGO1NBRGlCO01BQUEsQ0FBbkIsQ0FBQSxDQUhGO0lBQUEsRUFEZTtFQUFBLENBUGpCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/atom-beautify/lib/langs/cli-beautify.coffee