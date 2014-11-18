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
    afterEach(function() {
      atom.packages.deactivatePackages();
      return atom.packages.unloadPackages();
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGNBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBREwsQ0FBQTs7QUFBQSxFQUVBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUZQLENBQUE7O0FBQUEsRUFJQSxRQUFBLENBQVMscUJBQVQsRUFBZ0MsU0FBQSxHQUFBO0FBQzlCLElBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsZUFBOUIsRUFEYztNQUFBLENBQWhCLENBQUEsQ0FBQTtBQUFBLE1BR0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIscUJBQTlCLEVBRGM7TUFBQSxDQUFoQixDQUhBLENBQUE7QUFBQSxNQU1BLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2VBQ2QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxlQUFkLENBQThCLHdCQUE5QixFQURjO01BQUEsQ0FBaEIsQ0FOQSxDQUFBO2FBU0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsZUFBOUIsRUFEYztNQUFBLENBQWhCLEVBVlM7SUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLElBYUEsU0FBQSxDQUFVLFNBQUEsR0FBQTtBQUNSLE1BQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBZCxDQUFBLENBQUEsQ0FBQTthQUNBLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBZCxDQUFBLEVBRlE7SUFBQSxDQUFWLENBYkEsQ0FBQTtBQUFBLElBaUJB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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/syntax-spec.coffee