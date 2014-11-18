(function() {
  var BufferedProcess, Point, Q, TagGenerator, path, _ref;

  _ref = require('atom'), BufferedProcess = _ref.BufferedProcess, Point = _ref.Point;

  Q = require('q');

  path = require('path');

  module.exports = TagGenerator = (function() {
    function TagGenerator(path, scopeName) {
      this.path = path;
      this.scopeName = scopeName;
    }

    TagGenerator.prototype.parseTagLine = function(line) {
      var column, sections;
      sections = line.split('\t');
      if (sections.length > 4) {
        column = sections[2].match(/^\/\^(\s*)[\S]/)[1].length;
        return {
          position: new Point(parseInt(sections[4].split(':')[1]) - 1, column),
          name: sections[0],
          kind: sections[3],
          identation: column
        };
      } else {
        return null;
      }
    };

    TagGenerator.prototype.getLanguage = function() {
      var _ref1;
      if ((_ref1 = path.extname(this.path)) === '.cson' || _ref1 === '.gyp') {
        return 'Cson';
      }
      switch (this.scopeName) {
        case 'source.c':
          return 'C';
        case 'source.c++':
          return 'C++';
        case 'source.clojure':
          return 'Lisp';
        case 'source.coffee':
          return 'CoffeeScript';
        case 'source.css':
          return 'Css';
        case 'source.css.less':
          return 'Css';
        case 'source.css.scss':
          return 'Css';
        case 'source.gfm':
          return 'Markdown';
        case 'source.go':
          return 'Go';
        case 'source.java':
          return 'Java';
        case 'source.js':
          return 'JavaScript';
        case 'source.json':
          return 'Json';
        case 'source.makefile':
          return 'Make';
        case 'source.objc':
          return 'C';
        case 'source.objc++':
          return 'C++';
        case 'source.python':
          return 'Python';
        case 'source.ruby':
          return 'Ruby';
        case 'source.sass':
          return 'Sass';
        case 'source.yaml':
          return 'Yaml';
        case 'text.html':
          return 'Html';
        case 'text.html.php':
          return 'Php';
      }
    };

    TagGenerator.prototype.generate = function() {
      var args, command, defaultCtagsFile, deferred, exit, stdout, tags;
      deferred = Q.defer();
      tags = [];
      command = path.resolve(__dirname, '..', 'vendor', "ctags-" + process.platform);
      defaultCtagsFile = require.resolve('./.ctags');
      args = ["--options=" + defaultCtagsFile, '--fields=+KSn'];
      args.push('-Nuf', '-', this.path);
      stdout = (function(_this) {
        return function(lines) {
          var line, tag, _i, _len, _ref1, _results;
          _ref1 = lines.split('\n');
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            line = _ref1[_i];
            tag = _this.parseTagLine(line);
            if (tag) {
              _results.push(tags.push(tag));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
      })(this);
      exit = function() {
        return deferred.resolve(tags);
      };
      new BufferedProcess({
        command: command,
        args: args,
        stdout: stdout,
        exit: exit
      });
      return deferred.promise;
    };

    return TagGenerator;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1EQUFBOztBQUFBLEVBQUEsT0FBMkIsT0FBQSxDQUFRLE1BQVIsQ0FBM0IsRUFBQyx1QkFBQSxlQUFELEVBQWtCLGFBQUEsS0FBbEIsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsR0FBUixDQURKLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNTLElBQUEsc0JBQUUsSUFBRixFQUFTLFNBQVQsR0FBQTtBQUFxQixNQUFwQixJQUFDLENBQUEsT0FBQSxJQUFtQixDQUFBO0FBQUEsTUFBYixJQUFDLENBQUEsWUFBQSxTQUFZLENBQXJCO0lBQUEsQ0FBYjs7QUFBQSwyQkFFQSxZQUFBLEdBQWMsU0FBQyxJQUFELEdBQUE7QUFDWixVQUFBLGdCQUFBO0FBQUEsTUFBQSxRQUFBLEdBQVcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFYLENBQVgsQ0FBQTtBQUVBLE1BQUEsSUFBRyxRQUFRLENBQUMsTUFBVCxHQUFrQixDQUFyQjtBQUNFLFFBQUEsTUFBQSxHQUFTLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFaLENBQWtCLGdCQUFsQixDQUFvQyxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQWhELENBQUE7QUFDQSxlQUFPO0FBQUEsVUFDTCxRQUFBLEVBQWMsSUFBQSxLQUFBLENBQU0sUUFBQSxDQUFTLFFBQVMsQ0FBQSxDQUFBLENBQUUsQ0FBQyxLQUFaLENBQWtCLEdBQWxCLENBQXVCLENBQUEsQ0FBQSxDQUFoQyxDQUFBLEdBQXNDLENBQTVDLEVBQStDLE1BQS9DLENBRFQ7QUFBQSxVQUVMLElBQUEsRUFBTSxRQUFTLENBQUEsQ0FBQSxDQUZWO0FBQUEsVUFH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
//# sourceURL=/Users/daniel/.atom/packages/coffee-navigator/lib/tag-generator.coffee