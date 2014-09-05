(function() {
  var Linter, LinterCoffeelint, findFile, linterPath,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  linterPath = atom.packages.getLoadedPackage('linter').path;

  Linter = require("" + linterPath + "/lib/linter");

  findFile = require("" + linterPath + "/lib/util");

  LinterCoffeelint = (function(_super) {
    __extends(LinterCoffeelint, _super);

    LinterCoffeelint.syntax = ['source.coffee', 'source.litcoffee'];

    LinterCoffeelint.prototype.cmd = 'coffeelint --reporter jslint';

    LinterCoffeelint.prototype.linterName = 'coffeelint';

    LinterCoffeelint.prototype.regex = '<issue line="(?<line>\\d+)"' + '.+?reason="\\[((?<error>error)|(?<warning>warn))\\] (?<message>.+?)"';

    LinterCoffeelint.prototype.regexFlags = 's';

    LinterCoffeelint.prototype.isNodeExecutable = true;

    LinterCoffeelint.prototype.configPath = null;

    function LinterCoffeelint(editor) {
      var configPathLocal;
      LinterCoffeelint.__super__.constructor.call(this, editor);
      atom.config.observe('linter-coffeelint.coffeelintConfigPath', (function(_this) {
        return function() {
          return _this.configPath = atom.config.get('linter-coffeelint.coffeelintConfigPath');
        };
      })(this));
      if (configPathLocal = findFile(this.cwd, ['coffeelint.json'])) {
        this.cmd += " -f " + configPathLocal;
      } else if (this.configPath) {
        this.cmd += " -f " + this.configPath;
      }
      atom.config.observe('linter-coffeelint.coffeelintExecutablePath', (function(_this) {
        return function() {
          return _this.executablePath = atom.config.get('linter-coffeelint.coffeelintExecutablePath');
        };
      })(this));
      if (editor.getGrammar().scopeName === 'source.litcoffee') {
        this.cmd += ' --literate';
      }
    }

    LinterCoffeelint.prototype.destroy = function() {
      atom.config.unobserve('linter-coffeelint.coffeelintExecutablePath');
      return atom.config.unobserve('linter-coffeelint.coffeelintConfigPath');
    };

    return LinterCoffeelint;

  })(Linter);

  module.exports = LinterCoffeelint;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhDQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxVQUFBLEdBQWEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixRQUEvQixDQUF3QyxDQUFDLElBQXRELENBQUE7O0FBQUEsRUFDQSxNQUFBLEdBQVMsT0FBQSxDQUFRLEVBQUEsR0FBRSxVQUFGLEdBQWMsYUFBdEIsQ0FEVCxDQUFBOztBQUFBLEVBRUEsUUFBQSxHQUFXLE9BQUEsQ0FBUSxFQUFBLEdBQUUsVUFBRixHQUFjLFdBQXRCLENBRlgsQ0FBQTs7QUFBQSxFQUlNO0FBR0osdUNBQUEsQ0FBQTs7QUFBQSxJQUFBLGdCQUFDLENBQUEsTUFBRCxHQUFTLENBQUMsZUFBRCxFQUFrQixrQkFBbEIsQ0FBVCxDQUFBOztBQUFBLCtCQUlBLEdBQUEsR0FBSyw4QkFKTCxDQUFBOztBQUFBLCtCQU1BLFVBQUEsR0FBWSxZQU5aLENBQUE7O0FBQUEsK0JBU0EsS0FBQSxHQUNFLDZCQUFBLEdBRUEsc0VBWkYsQ0FBQTs7QUFBQSwrQkFjQSxVQUFBLEdBQVksR0FkWixDQUFBOztBQUFBLCtCQWdCQSxnQkFBQSxHQUFrQixJQWhCbEIsQ0FBQTs7QUFBQSwrQkFrQkEsVUFBQSxHQUFZLElBbEJaLENBQUE7O0FBb0JhLElBQUEsMEJBQUMsTUFBRCxHQUFBO0FBQ1gsVUFBQSxlQUFBO0FBQUEsTUFBQSxrREFBTSxNQUFOLENBQUEsQ0FBQTtBQUFBLE1BRUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFaLENBQW9CLHdDQUFwQixFQUE4RCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUM1RCxLQUFDLENBQUEsVUFBRCxHQUFjLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix3Q0FBaEIsRUFEOEM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE5RCxDQUZBLENBQUE7QUFLQSxNQUFBLElBQUcsZUFBQSxHQUFrQixRQUFBLENBQVMsSUFBQyxDQUFBLEdBQVYsRUFBZSxDQUFDLGlCQUFELENBQWYsQ0FBckI7QUFDRSxRQUFBLElBQUMsQ0FBQSxHQUFELElBQVMsTUFBQSxHQUFLLGVBQWQsQ0FERjtPQUFBLE1BRUssSUFBRyxJQUFDLENBQUEsVUFBSjtBQUNILFFBQUEsSUFBQyxDQUFBLEdBQUQsSUFBUyxNQUFBLEdBQUssSUFBQyxDQUFBLFVBQWYsQ0FERztPQVBMO0FBQUEsTUFVQSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQVosQ0FBb0IsNENBQXBCLEVBQWtFLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ2hFLEtBQUMsQ0FBQSxjQUFELEdBQWtCLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQiw0Q0FBaEIsRUFEOEM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsRSxDQVZBLENBQUE7QUFhQSxNQUFBLElBQUcsTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUFtQixDQUFDLFNBQXBCLEtBQWlDLGtCQUFwQztBQUNFLFFBQUEsSUFBQyxDQUFBLEdBQUQsSUFBUSxhQUFSLENBREY7T0FkVztJQUFBLENBcEJiOztBQUFBLCtCQXFDQSxPQUFBLEdBQVMsU0FBQSxHQUFBO0FBQ1AsTUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVosQ0FBc0IsNENBQXRCLENBQUEsQ0FBQTthQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBWixDQUFzQix3Q0FBdEIsRUFGTztJQUFBLENBckNULENBQUE7OzRCQUFBOztLQUg2QixPQUovQixDQUFBOztBQUFBLEVBZ0RBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLGdCQWhEakIsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/linter-coffeelint/lib/linter-coffeelint.coffee