(function() {
  var fs, path, temp;

  path = require('path');

  fs = require('fs-plus');

  temp = require('temp');

  describe("the `syntax` global", function() {
    beforeEach(function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-text');
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-javascript');
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-coffee-script');
      });
      return waitsForPromise(function() {
        return atom.packages.activatePackage('language-ruby');
      });
    });
    describe("serialization", function() {
      return it("remembers grammar overrides by path", function() {
        var filePath, grammar, syntax2, _i, _len, _ref;
        filePath = '/foo/bar/file.js';
        expect(atom.syntax.selectGrammar(filePath).name).not.toBe('Ruby');
        atom.syntax.setGrammarOverrideForPath(filePath, 'source.ruby');
        syntax2 = atom.deserializers.deserialize(atom.syntax.serialize());
        _ref = atom.syntax.grammars;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          grammar = _ref[_i];
          if (grammar !== atom.syntax.nullGrammar) {
            syntax2.addGrammar(grammar);
          }
        }
        return expect(syntax2.selectGrammar(filePath).name).toBe('Ruby');
      });
    });
    describe(".selectGrammar(filePath)", function() {
      it("can use the filePath to load the correct grammar based on the grammar's filetype", function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-git');
        });
        return runs(function() {
          expect(atom.syntax.selectGrammar("file.js").name).toBe("JavaScript");
          expect(atom.syntax.selectGrammar(path.join(temp.dir, '.git', 'config')).name).toBe("Git Config");
          expect(atom.syntax.selectGrammar("Rakefile").name).toBe("Ruby");
          expect(atom.syntax.selectGrammar("curb").name).toBe("Null Grammar");
          return expect(atom.syntax.selectGrammar("/hu.git/config").name).toBe("Null Grammar");
        });
      });
      it("uses the filePath's shebang line if the grammar cannot be determined by the extension or basename", function() {
        var filePath;
        filePath = require.resolve("./fixtures/shebang");
        return expect(atom.syntax.selectGrammar(filePath).name).toBe("Ruby");
      });
      it("uses the number of newlines in the first line regex to determine the number of lines to test against", function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-property-list');
        });
        return runs(function() {
          var fileContent;
          fileContent = "first-line\n<html>";
          expect(atom.syntax.selectGrammar("dummy.coffee", fileContent).name).toBe("CoffeeScript");
          fileContent = '<?xml version="1.0" encoding="UTF-8"?>';
          expect(atom.syntax.selectGrammar("grammar.tmLanguage", fileContent).name).toBe("Null Grammar");
          fileContent += '\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">';
          return expect(atom.syntax.selectGrammar("grammar.tmLanguage", fileContent).name).toBe("Property List (XML)");
        });
      });
      it("doesn't read the file when the file contents are specified", function() {
        var filePath, filePathContents;
        filePath = require.resolve("./fixtures/shebang");
        filePathContents = fs.readFileSync(filePath, 'utf8');
        spyOn(fs, 'read').andCallThrough();
        expect(atom.syntax.selectGrammar(filePath, filePathContents).name).toBe("Ruby");
        return expect(fs.read).not.toHaveBeenCalled();
      });
      it("allows the default grammar to be overridden for a path", function() {
        var filePath;
        filePath = '/foo/bar/file.js';
        expect(atom.syntax.selectGrammar(filePath).name).not.toBe('Ruby');
        atom.syntax.setGrammarOverrideForPath(filePath, 'source.ruby');
        expect(atom.syntax.selectGrammar(filePath).name).toBe('Ruby');
        atom.syntax.clearGrammarOverrideForPath(filePath);
        return expect(atom.syntax.selectGrammar(filePath).name).not.toBe('Ruby');
      });
      describe("when multiple grammars have matching fileTypes", function() {
        return it("selects the grammar with the longest fileType match", function() {
          var grammar1, grammar2, grammarPath1, grammarPath2;
          grammarPath1 = temp.path({
            suffix: '.json'
          });
          fs.writeFileSync(grammarPath1, JSON.stringify({
            name: 'test1',
            scopeName: 'source1',
            fileTypes: ['test']
          }));
          grammar1 = atom.syntax.loadGrammarSync(grammarPath1);
          expect(atom.syntax.selectGrammar('more.test', '')).toBe(grammar1);
          grammarPath2 = temp.path({
            suffix: '.json'
          });
          fs.writeFileSync(grammarPath2, JSON.stringify({
            name: 'test2',
            scopeName: 'source2',
            fileTypes: ['test', 'more.test']
          }));
          grammar2 = atom.syntax.loadGrammarSync(grammarPath2);
          return expect(atom.syntax.selectGrammar('more.test', '')).toBe(grammar2);
        });
      });
      return describe("when there is no file path", function() {
        return it("does not throw an exception (regression)", function() {
          expect(function() {
            return atom.syntax.selectGrammar(null, '#!/usr/bin/ruby');
          }).not.toThrow();
          expect(function() {
            return atom.syntax.selectGrammar(null, '');
          }).not.toThrow();
          return expect(function() {
            return atom.syntax.selectGrammar(null, null);
          }).not.toThrow();
        });
      });
    });
    describe(".removeGrammar(grammar)", function() {
      return it("removes the grammar, so it won't be returned by selectGrammar", function() {
        var grammar;
        grammar = atom.syntax.selectGrammar('foo.js');
        atom.syntax.removeGrammar(grammar);
        return expect(atom.syntax.selectGrammar('foo.js').name).not.toBe(grammar.name);
      });
    });
    describe(".getProperty(scopeDescriptor)", function() {
      it("returns the property with the most specific scope selector", function() {
        atom.syntax.addProperties(".source.coffee .string.quoted.double.coffee", {
          foo: {
            bar: {
              baz: 42
            }
          }
        });
        atom.syntax.addProperties(".source .string.quoted.double", {
          foo: {
            bar: {
              baz: 22
            }
          }
        });
        atom.syntax.addProperties(".source", {
          foo: {
            bar: {
              baz: 11
            }
          }
        });
        expect(atom.syntax.getProperty([".source.coffee", ".string.quoted.double.coffee"], "foo.bar.baz")).toBe(42);
        expect(atom.syntax.getProperty([".source.js", ".string.quoted.double.js"], "foo.bar.baz")).toBe(22);
        expect(atom.syntax.getProperty([".source.js", ".variable.assignment.js"], "foo.bar.baz")).toBe(11);
        return expect(atom.syntax.getProperty([".text"], "foo.bar.baz")).toBeUndefined();
      });
      return it("favors the most recently added properties in the event of a specificity tie", function() {
        atom.syntax.addProperties(".source.coffee .string.quoted.single", {
          foo: {
            bar: {
              baz: 42
            }
          }
        });
        atom.syntax.addProperties(".source.coffee .string.quoted.double", {
          foo: {
            bar: {
              baz: 22
            }
          }
        });
        expect(atom.syntax.getProperty([".source.coffee", ".string.quoted.single"], "foo.bar.baz")).toBe(42);
        return expect(atom.syntax.getProperty([".source.coffee", ".string.quoted.single.double"], "foo.bar.baz")).toBe(22);
      });
    });
    return describe(".removeProperties(name)", function() {
      return it("allows properties to be removed by name", function() {
        atom.syntax.addProperties("a", ".source.coffee .string.quoted.double.coffee", {
          foo: {
            bar: {
              baz: 42
            }
          }
        });
        atom.syntax.addProperties("b", ".source .string.quoted.double", {
          foo: {
            bar: {
              baz: 22
            }
          }
        });
        atom.syntax.removeProperties("b");
        expect(atom.syntax.getProperty([".source.js", ".string.quoted.double.js"], "foo.bar.baz")).toBeUndefined();
        return expect(atom.syntax.getProperty([".source.coffee", ".string.quoted.double.coffee"], "foo.bar.baz")).toBe(42);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGNBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBREwsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUZQLENBQUE7O0FBQUEsRUFJQSxRQUFBLENBQVMscUJBQVQsRUFBZ0MsU0FBQSxHQUFBO0FBQzlCLElBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUVULE1BQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsZUFBOUIsRUFEYztNQUFBLENBQWhCLENBQUEsQ0FBQTtBQUFBLE1BR0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIscUJBQTlCLEVBRGM7TUFBQSxDQUFoQixDQUhBLENBQUE7QUFBQSxNQU1BLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLHdCQUE5QixFQURjO01BQUEsQ0FBaEIsQ0FOQSxDQUFBO2FBU0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsZUFBOUIsRUFEYztNQUFBLENBQWhCLEVBWFM7SUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLElBY0EsUUFBQSxDQUFTLGVBQVQsRUFBMEIsU0FBQSxHQUFBO2FBQ3hCLEVBQUEsQ0FBRyxxQ0FBSCxFQUEwQyxTQUFBLEdBQUE7QUFDeEMsWUFBQSwwQ0FBQTtBQUFBLFFBQUEsUUFBQSxHQUFXLGtCQUFYLENBQUE7QUFBQSxRQUNBLE1BQUEsQ0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQVosQ0FBMEIsUUFBMUIsQ0FBbUMsQ0FBQyxJQUEzQyxDQUFnRCxDQUFDLEdBQUcsQ0FBQyxJQUFyRCxDQUEwRCxNQUExRCxDQURBLENBQUE7QUFBQSxRQUVBLElBQUksQ0FBQyxNQUFNLENBQUMseUJBQVosQ0FBc0MsUUFBdEMsRUFBZ0QsYUFBaEQsQ0FGQSxDQUFBO0FBQUEsUUFHQSxPQUFBLEdBQVUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFuQixDQUErQixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVosQ0FBQSxDQUEvQixDQUhWLENBQUE7QUFJQTtBQUFBLGFBQUEsMkNBQUE7NkJBQUE7Y0FBcUUsT0FBQSxLQUFhLElBQUksQ0FBQyxNQUFNLENBQUM7QUFBOUYsWUFBQSxPQUFPLENBQUMsVUFBUixDQUFtQixPQUFuQixDQUFBO1dBQUE7QUFBQSxTQUpBO2VBS0EsTUFBQSxDQUFPLE9BQU8sQ0FBQyxhQUFSLENBQXNCLFFBQXRCLENBQStCLENBQUMsSUFBdkMsQ0FBNEMsQ0FBQyxJQUE3QyxDQUFrRCxNQUFsRCxFQU53QztNQUFBLENBQTFDLEVBRHdCO0lBQUEsQ0FBMUIsQ0FkQSxDQUFBO0FBQUEsSUF1QkEsUUFBQSxDQUFTLDBCQUFULEVBQXFDLFNBQUEsR0FBQTtBQUNuQyxNQUFBLEVBQUEsQ0FBRyxrRkFBSCxFQUF1RixTQUFBLEdBQUE7QUFDckYsUUFBQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsY0FBOUIsRUFEYztRQUFBLENBQWhCLENBQUEsQ0FBQTtlQUdBLElBQUEsQ0FBSyxTQUFBLEdBQUE7QUFDSCxVQUFBLE1BQUEsQ0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQVosQ0FBMEIsU0FBMUIsQ0FBb0MsQ0FBQyxJQUE1QyxDQUFpRCxDQUFDLElBQWxELENBQXVELFlBQXZELENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBWixDQUEwQixJQUFJLENBQUMsSUFBTCxDQUFVLElBQUksQ0FBQyxHQUFmLEVBQW9CLE1BQXBCLEVBQTRCLFFBQTVCLENBQTFCLENBQWdFLENBQUMsSUFBeEUsQ0FBNkUsQ0FBQyxJQUE5RSxDQUFtRixZQUFuRixDQURBLENBQUE7QUFBQSxVQUVBLE1BQUEsQ0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQVosQ0FBMEIsVUFBMUIsQ0FBcUMsQ0FBQyxJQUE3QyxDQUFrRCxDQUFDLElBQW5ELENBQXdELE1BQXhELENBRkEsQ0FBQTtBQUFBLFVBR0EsTUFBQSxDQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBWixDQUEwQixNQUExQixDQUFpQyxDQUFDLElBQXpDLENBQThDLENBQUMsSUFBL0MsQ0FBb0QsY0FBcEQsQ0FIQSxDQUFBO2lCQUlBLE1BQUEsQ0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQVosQ0FBMEIsZ0JBQTFCLENBQTJDLENBQUMsSUFBbkQsQ0FBd0QsQ0FBQyxJQUF6RCxDQUE4RCxjQUE5RCxFQUxHO1FBQUEsQ0FBTCxFQUpxRjtNQUFBLENBQXZGLENBQUEsQ0FBQTtBQUFBLE1BV0EsRUFBQSxDQUFHLG1HQUFILEVBQXdHLFNBQUEsR0FBQTtBQUN0RyxZQUFBLFFBQUE7QUFBQSxRQUFBLFFBQUEsR0FBVyxPQUFPLENBQUMsT0FBUixDQUFnQixvQkFBaEIsQ0FBWCxDQUFBO2VBQ0EsTUFBQSxDQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBWixDQUEwQixRQUExQixDQUFtQyxDQUFDLElBQTNDLENBQWdELENBQUMsSUFBakQsQ0FBc0QsTUFBdEQsRUFGc0c7TUFBQSxDQUF4RyxDQVhBLENBQUE7QUFBQSxNQWVBLEVBQUEsQ0FBRyxzR0FBSCxFQUEyRyxTQUFBLEdBQUE7QUFDekcsUUFBQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsd0JBQTlCLEVBRGM7UUFBQSxDQUFoQixDQUFBLENBQUE7ZUFHQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsY0FBQSxXQUFBO0FBQUEsVUFBQSxXQUFBLEdBQWMsb0JBQWQsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBWixDQUEwQixjQUExQixFQUEwQyxXQUExQyxDQUFzRCxDQUFDLElBQTlELENBQW1FLENBQUMsSUFBcEUsQ0FBeUUsY0FBekUsQ0FEQSxDQUFBO0FBQUEsVUFHQSxXQUFBLEdBQWMsd0NBSGQsQ0FBQTtBQUFBLFVBSUEsTUFBQSxDQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBWixDQUEwQixvQkFBMUIsRUFBZ0QsV0FBaEQsQ0FBNEQsQ0FBQyxJQUFwRSxDQUF5RSxDQUFDLElBQTFFLENBQStFLGNBQS9FLENBSkEsQ0FBQTtBQUFBLFVBTUEsV0FBQSxJQUFlLDBHQU5mLENBQUE7aUJBT0EsTUFBQSxDQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBWixDQUEwQixvQkFBMUIsRUFBZ0QsV0FBaEQsQ0FBNEQsQ0FBQyxJQUFwRSxDQUF5RSxDQUFDLElBQTFFLENBQStFLHFCQUEvRSxFQVJHO1FBQUEsQ0FBTCxFQUp5RztNQUFBLENBQTNHLENBZkEsQ0FBQTtBQUFBLE1BNkJBLEVBQUEsQ0FBRyw0REFBSCxFQUFpRSxTQUFBLEdBQUE7QUFDL0QsWUFBQSwwQkFBQTtBQUFBLFFBQUEsUUFBQSxHQUFXLE9BQU8sQ0FBQyxPQUFSLENBQWdCLG9CQUFoQixDQUFYLENBQUE7QUFBQSxRQUNBLGdCQUFBLEdBQW1CLEVBQUUsQ0FBQyxZQUFILENBQWdCLFFBQWhCLEVBQTBCLE1BQTFCLENBRG5CLENBQUE7QUFBQSxRQUVBLEtBQUEsQ0FBTSxFQUFOLEVBQVUsTUFBVixDQUFpQixDQUFDLGNBQWxCLENBQUEsQ0FGQSxDQUFBO0FBQUEsUUFHQSxNQUFBLENBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFaLENBQTBCLFFBQTFCLEVBQW9DLGdCQUFwQyxDQUFxRCxDQUFDLElBQTdELENBQWtFLENBQUMsSUFBbkUsQ0FBd0UsTUFBeEUsQ0FIQSxDQUFBO2VBSUEsTUFBQSxDQUFPLEVBQUUsQ0FBQyxJQUFWLENBQWUsQ0FBQyxHQUFHLENBQUMsZ0JBQXBCLENBQUEsRUFMK0Q7TUFBQSxDQUFqRSxDQTdCQSxDQUFBO0FBQUEsTUFvQ0EsRUFBQSxDQUFHLHdEQUFILEVBQTZELFNBQUEsR0FBQTtBQUMzRCxZQUFBLFFBQUE7QUFBQSxRQUFBLFFBQUEsR0FBVyxrQkFBWCxDQUFBO0FBQUEsUUFDQSxNQUFBLENBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFaLENBQTBCLFFBQTFCLENBQW1DLENBQUMsSUFBM0MsQ0FBZ0QsQ0FBQyxHQUFHLENBQUMsSUFBckQsQ0FBMEQsTUFBMUQsQ0FEQSxDQUFBO0FBQUEsUUFFQSxJQUFJLENBQUMsTUFBTSxDQUFDLHlCQUFaLENBQXNDLFFBQXRDLEVBQWdELGFBQWhELENBRkEsQ0FBQTtBQUFBLFFBR0EsTUFBQSxDQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBWixDQUEwQixRQUExQixDQUFtQyxDQUFDLElBQTNDLENBQWdELENBQUMsSUFBakQsQ0FBc0QsTUFBdEQsQ0FIQSxDQUFBO0FBQUEsUUFJQSxJQUFJLENBQUMsTUFBTSxDQUFDLDJCQUFaLENBQXdDLFFBQXhDLENBSkEsQ0FBQTtlQUtBLE1BQUEsQ0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQVosQ0FBMEIsUUFBMUIsQ0FBbUMsQ0FBQyxJQUEzQyxDQUFnRCxDQUFDLEdBQUcsQ0FBQyxJQUFyRCxDQUEwRCxNQUExRCxFQU4yRDtNQUFBLENBQTdELENBcENBLENBQUE7QUFBQSxNQTRDQSxRQUFBLENBQVMsZ0RBQVQsRUFBMkQsU0FBQSxHQUFBO2VBQ3pELEVBQUEsQ0FBRyxxREFBSCxFQUEwRCxTQUFBLEdBQUE7QUFDeEQsY0FBQSw4Q0FBQTtBQUFBLFVBQUEsWUFBQSxHQUFlLElBQUksQ0FBQyxJQUFMLENBQVU7QUFBQSxZQUFBLE1BQUEsRUFBUSxPQUFSO1dBQVYsQ0FBZixDQUFBO0FBQUEsVUFDQSxFQUFFLENBQUMsYUFBSCxDQUFpQixZQUFqQixFQUErQixJQUFJLENBQUMsU0FBTCxDQUM3QjtBQUFBLFlBQUEsSUFBQSxFQUFNLE9BQU47QUFBQSxZQUNBLFNBQUEsRUFBVyxTQURYO0FBQUEsWUFFQSxTQUFBLEVBQVcsQ0FBQyxNQUFELENBRlg7V0FENkIsQ0FBL0IsQ0FEQSxDQUFBO0FBQUEsVUFNQSxRQUFBLEdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFaLENBQTRCLFlBQTVCLENBTlgsQ0FBQTtBQUFBLFVBT0EsTUFBQSxDQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBWixDQUEwQixXQUExQixFQUF1QyxFQUF2QyxDQUFQLENBQWtELENBQUMsSUFBbkQsQ0FBd0QsUUFBeEQsQ0FQQSxDQUFBO0FBQUEsVUFTQSxZQUFBLEdBQWUsSUFBSSxDQUFDLElBQUwsQ0FBVTtBQUFBLFlBQUEsTUFBQSxFQUFRLE9BQVI7V0FBVixDQVRmLENBQUE7QUFBQSxVQVVBLEVBQUUsQ0FBQyxhQUFILENBQWlCLFlBQWpCLEVBQStCLElBQUksQ0FBQyxTQUFMLENBQzdCO0FBQUEsWUFBQSxJQUFBLEVBQU0sT0FBTjtBQUFBLFlBQ0EsU0FBQSxFQUFXLFNBRFg7QUFBQSxZQUVBLFNBQUEsRUFBVyxDQUFDLE1BQUQsRUFBUyxXQUFULENBRlg7V0FENkIsQ0FBL0IsQ0FWQSxDQUFBO0FBQUEsVUFlQSxRQUFBLEdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFaLENBQTRCLFlBQTVCLENBZlgsQ0FBQTtpQkFnQkEsTUFBQSxDQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBWixDQUEwQixXQUExQixFQUF1QyxFQUF2QyxDQUFQLENBQWtELENBQUMsSUFBbkQsQ0FBd0QsUUFBeEQsRUFqQndEO1FBQUEsQ0FBMUQsRUFEeUQ7TUFBQSxDQUEzRCxDQTVDQSxDQUFBO2FBZ0VBLFFBQUEsQ0FBUyw0QkFBVCxFQUF1QyxTQUFBLEdBQUE7ZUFDckMsRUFBQSxDQUFHLDBDQUFILEVBQStDLFNBQUEsR0FBQTtBQUM3QyxVQUFBLE1BQUEsQ0FBTyxTQUFBLEdBQUE7bUJBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFaLENBQTBCLElBQTFCLEVBQWdDLGlCQUFoQyxFQUFIO1VBQUEsQ0FBUCxDQUE2RCxDQUFDLEdBQUcsQ0FBQyxPQUFsRSxDQUFBLENBQUEsQ0FBQTtBQUFBLFVBQ0EsTUFBQSxDQUFPLFNBQUEsR0FBQTttQkFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQVosQ0FBMEIsSUFBMUIsRUFBZ0MsRUFBaEMsRUFBSDtVQUFBLENBQVAsQ0FBOEMsQ0FBQyxHQUFHLENBQUMsT0FBbkQsQ0FBQSxDQURBLENBQUE7aUJBRUEsTUFBQSxDQUFPLFNBQUEsR0FBQTttQkFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQVosQ0FBMEIsSUFBMUIsRUFBZ0MsSUFBaEMsRUFBSDtVQUFBLENBQVAsQ0FBZ0QsQ0FBQyxHQUFHLENBQUMsT0FBckQsQ0FBQSxFQUg2QztRQUFBLENBQS9DLEVBRHFDO01BQUEsQ0FBdkMsRUFqRW1DO0lBQUEsQ0FBckMsQ0F2QkEsQ0FBQTtBQUFBLElBOEZBLFFBQUEsQ0FBUyx5QkFBVCxFQUFvQyxTQUFBLEdBQUE7YUFDbEMsRUFBQSxDQUFHLCtEQUFILEVBQW9FLFNBQUEsR0FBQTtBQUNsRSxZQUFBLE9BQUE7QUFBQSxRQUFBLE9BQUEsR0FBVSxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQVosQ0FBMEIsUUFBMUIsQ0FBVixDQUFBO0FBQUEsUUFDQSxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQVosQ0FBMEIsT0FBMUIsQ0FEQSxDQUFBO2VBRUEsTUFBQSxDQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBWixDQUEwQixRQUExQixDQUFtQyxDQUFDLElBQTNDLENBQWdELENBQUMsR0FBRyxDQUFDLElBQXJELENBQTBELE9BQU8sQ0FBQyxJQUFsRSxFQUhrRTtNQUFBLENBQXBFLEVBRGtDO0lBQUEsQ0FBcEMsQ0E5RkEsQ0FBQTtBQUFBLElBb0dBLFFBQUEsQ0FBUywrQkFBVCxFQUEwQyxTQUFBLEdBQUE7QUFDeEMsTUFBQSxFQUFBLENBQUcsNERBQUgsRUFBaUUsU0FBQSxHQUFBO0FBQy9ELFFBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFaLENBQTBCLDZDQUExQixFQUF5RTtBQUFBLFVBQUEsR0FBQSxFQUFLO0FBQUEsWUFBQSxHQUFBLEVBQUs7QUFBQSxjQUFBLEdBQUEsRUFBSyxFQUFMO2FBQUw7V0FBTDtTQUF6RSxDQUFBLENBQUE7QUFBQSxRQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBWixDQUEwQiwrQkFBMUIsRUFBMkQ7QUFBQSxVQUFBLEdBQUEsRUFBSztBQUFBLFlBQUEsR0FBQSxFQUFLO0FBQUEsY0FBQSxHQUFBLEVBQUssRUFBTDthQUFMO1dBQUw7U0FBM0QsQ0FEQSxDQUFBO0FBQUEsUUFFQSxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQVosQ0FBMEIsU0FBMUIsRUFBcUM7QUFBQSxVQUFBLEdBQUEsRUFBSztBQUFBLFlBQUEsR0FBQSxFQUFLO0FBQUEsY0FBQSxHQUFBLEVBQUssRUFBTDthQUFMO1dBQUw7U0FBckMsQ0FGQSxDQUFBO0FBQUEsUUFJQSxNQUFBLENBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLENBQUMsZ0JBQUQsRUFBbUIsOEJBQW5CLENBQXhCLEVBQTRFLGFBQTVFLENBQVAsQ0FBa0csQ0FBQyxJQUFuRyxDQUF3RyxFQUF4RyxDQUpBLENBQUE7QUFBQSxRQUtBLE1BQUEsQ0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVosQ0FBd0IsQ0FBQyxZQUFELEVBQWUsMEJBQWYsQ0FBeEIsRUFBb0UsYUFBcEUsQ0FBUCxDQUEwRixDQUFDLElBQTNGLENBQWdHLEVBQWhHLENBTEEsQ0FBQTtBQUFBLFFBTUEsTUFBQSxDQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixDQUFDLFlBQUQsRUFBZSx5QkFBZixDQUF4QixFQUFtRSxhQUFuRSxDQUFQLENBQXlGLENBQUMsSUFBMUYsQ0FBK0YsRUFBL0YsQ0FOQSxDQUFBO2VBT0EsTUFBQSxDQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBWixDQUF3QixDQUFDLE9BQUQsQ0FBeEIsRUFBbUMsYUFBbkMsQ0FBUCxDQUF5RCxDQUFDLGFBQTFELENBQUEsRUFSK0Q7TUFBQSxDQUFqRSxDQUFBLENBQUE7YUFVQSxFQUFBLENBQUcsNkVBQUgsRUFBa0YsU0FBQSxHQUFBO0FBQ2hGLFFBQUEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFaLENBQTBCLHNDQUExQixFQUFrRTtBQUFBLFVBQUEsR0FBQSxFQUFLO0FBQUEsWUFBQSxHQUFBLEVBQUs7QUFBQSxjQUFBLEdBQUEsRUFBSyxFQUFMO2FBQUw7V0FBTDtTQUFsRSxDQUFBLENBQUE7QUFBQSxRQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBWixDQUEwQixzQ0FBMUIsRUFBa0U7QUFBQSxVQUFBLEdBQUEsRUFBSztBQUFBLFlBQUEsR0FBQSxFQUFLO0FBQUEsY0FBQSxHQUFBLEVBQUssRUFBTDthQUFMO1dBQUw7U0FBbEUsQ0FEQSxDQUFBO0FBQUEsUUFHQSxNQUFBLENBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLENBQUMsZ0JBQUQsRUFBbUIsdUJBQW5CLENBQXhCLEVBQXFFLGFBQXJFLENBQVAsQ0FBMkYsQ0FBQyxJQUE1RixDQUFpRyxFQUFqRyxDQUhBLENBQUE7ZUFJQSxNQUFBLENBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLENBQUMsZ0JBQUQsRUFBbUIsOEJBQW5CLENBQXhCLEVBQTRFLGFBQTVFLENBQVAsQ0FBa0csQ0FBQyxJQUFuRyxDQUF3RyxFQUF4RyxFQUxnRjtNQUFBLENBQWxGLEVBWHdDO0lBQUEsQ0FBMUMsQ0FwR0EsQ0FBQTtXQXNIQSxRQUFBLENBQVMseUJBQVQsRUFBb0MsU0FBQSxHQUFBO2FBQ2xDLEVBQUEsQ0FBRyx5Q0FBSCxFQUE4QyxTQUFBLEdBQUE7QUFDNUMsUUFBQSxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQVosQ0FBMEIsR0FBMUIsRUFBK0IsNkNBQS9CLEVBQThFO0FBQUEsVUFBQSxHQUFBLEVBQUs7QUFBQSxZQUFBLEdBQUEsRUFBSztBQUFBLGNBQUEsR0FBQSxFQUFLLEVBQUw7YUFBTDtXQUFMO1NBQTlFLENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFaLENBQTBCLEdBQTFCLEVBQStCLCtCQUEvQixFQUFnRTtBQUFBLFVBQUEsR0FBQSxFQUFLO0FBQUEsWUFBQSxHQUFBLEVBQUs7QUFBQSxjQUFBLEdBQUEsRUFBSyxFQUFMO2FBQUw7V0FBTDtTQUFoRSxDQURBLENBQUE7QUFBQSxRQUdBLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQVosQ0FBNkIsR0FBN0IsQ0FIQSxDQUFBO0FBQUEsUUFJQSxNQUFBLENBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFaLENBQXdCLENBQUMsWUFBRCxFQUFlLDBCQUFmLENBQXhCLEVBQW9FLGFBQXBFLENBQVAsQ0FBMEYsQ0FBQyxhQUEzRixDQUFBLENBSkEsQ0FBQTtlQUtBLE1BQUEsQ0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVosQ0FBd0IsQ0FBQyxnQkFBRCxFQUFtQiw4QkFBbkIsQ0FBeEIsRUFBNEUsYUFBNUUsQ0FBUCxDQUFrRyxDQUFDLElBQW5HLENBQXdHLEVBQXhHLEVBTjRDO01BQUEsQ0FBOUMsRUFEa0M7SUFBQSxDQUFwQyxFQXZIOEI7RUFBQSxDQUFoQyxDQUpBLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/syntax-spec.coffee