(function() {
  describe("TokenizedLine", function() {
    var editor;
    editor = null;
    beforeEach(function() {
      return waitsForPromise(function() {
        return atom.packages.activatePackage('language-coffee-script');
      });
    });
    describe("::isOnlyWhitespace()", function() {
      beforeEach(function() {
        return waitsForPromise(function() {
          return atom.project.open('coffee.coffee').then(function(o) {
            return editor = o;
          });
        });
      });
      it("returns true when the line is only whitespace", function() {
        expect(editor.lineForScreenRow(3).isOnlyWhitespace()).toBe(true);
        expect(editor.lineForScreenRow(7).isOnlyWhitespace()).toBe(true);
        return expect(editor.lineForScreenRow(23).isOnlyWhitespace()).toBe(true);
      });
      return it("returns false when the line is not only whitespace", function() {
        expect(editor.lineForScreenRow(0).isOnlyWhitespace()).toBe(false);
        return expect(editor.lineForScreenRow(2).isOnlyWhitespace()).toBe(false);
      });
    });
    return describe("::getScopeTree()", function() {
      return it("returns a tree whose inner nodes are scopes and whose leaf nodes are tokens in those scopes", function() {
        var ensureValidScopeTree, tokenIndex, tokens, _ref;
        _ref = [], tokens = _ref[0], tokenIndex = _ref[1];
        ensureValidScopeTree = function(scopeTree, scopes) {
          var child, _i, _len, _ref1, _results;
          if (scopes == null) {
            scopes = [];
          }
          if (scopeTree.children != null) {
            _ref1 = scopeTree.children;
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              child = _ref1[_i];
              _results.push(ensureValidScopeTree(child, scopes.concat([scopeTree.scope])));
            }
            return _results;
          } else {
            expect(scopeTree).toBe(tokens[tokenIndex++]);
            return expect(scopes).toEqual(scopeTree.scopes);
          }
        };
        waitsForPromise(function() {
          return atom.project.open('coffee.coffee').then(function(o) {
            return editor = o;
          });
        });
        return runs(function() {
          var scopeTree;
          tokenIndex = 0;
          tokens = editor.lineForScreenRow(1).tokens;
          scopeTree = editor.lineForScreenRow(1).getScopeTree();
          return ensureValidScopeTree(scopeTree);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLFFBQUEsQ0FBUyxlQUFULEVBQTBCLFNBQUEsR0FBQTtBQUN4QixRQUFBLE1BQUE7QUFBQSxJQUFBLE1BQUEsR0FBUyxJQUFULENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7YUFDVCxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZCxDQUE4Qix3QkFBOUIsRUFBSDtNQUFBLENBQWhCLEVBRFM7SUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLElBS0EsUUFBQSxDQUFTLHNCQUFULEVBQWlDLFNBQUEsR0FBQTtBQUMvQixNQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7ZUFDVCxlQUFBLENBQWdCLFNBQUEsR0FBQTtpQkFDZCxJQUFJLENBQUMsT0FBTyxDQUFDLElBQWIsQ0FBa0IsZUFBbEIsQ0FBa0MsQ0FBQyxJQUFuQyxDQUF3QyxTQUFDLENBQUQsR0FBQTttQkFBTyxNQUFBLEdBQVMsRUFBaEI7VUFBQSxDQUF4QyxFQURjO1FBQUEsQ0FBaEIsRUFEUztNQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsTUFJQSxFQUFBLENBQUcsK0NBQUgsRUFBb0QsU0FBQSxHQUFBO0FBQ2xELFFBQUEsTUFBQSxDQUFPLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixDQUF4QixDQUEwQixDQUFDLGdCQUEzQixDQUFBLENBQVAsQ0FBcUQsQ0FBQyxJQUF0RCxDQUEyRCxJQUEzRCxDQUFBLENBQUE7QUFBQSxRQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsQ0FBeEIsQ0FBMEIsQ0FBQyxnQkFBM0IsQ0FBQSxDQUFQLENBQXFELENBQUMsSUFBdEQsQ0FBMkQsSUFBM0QsQ0FEQSxDQUFBO2VBRUEsTUFBQSxDQUFPLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixFQUF4QixDQUEyQixDQUFDLGdCQUE1QixDQUFBLENBQVAsQ0FBc0QsQ0FBQyxJQUF2RCxDQUE0RCxJQUE1RCxFQUhrRDtNQUFBLENBQXBELENBSkEsQ0FBQTthQVNBLEVBQUEsQ0FBRyxvREFBSCxFQUF5RCxTQUFBLEdBQUE7QUFDdkQsUUFBQSxNQUFBLENBQU8sTUFBTSxDQUFDLGdCQUFQLENBQXdCLENBQXhCLENBQTBCLENBQUMsZ0JBQTNCLENBQUEsQ0FBUCxDQUFxRCxDQUFDLElBQXRELENBQTJELEtBQTNELENBQUEsQ0FBQTtlQUNBLE1BQUEsQ0FBTyxNQUFNLENBQUMsZ0JBQVAsQ0FBd0IsQ0FBeEIsQ0FBMEIsQ0FBQyxnQkFBM0IsQ0FBQSxDQUFQLENBQXFELENBQUMsSUFBdEQsQ0FBMkQsS0FBM0QsRUFGdUQ7TUFBQSxDQUF6RCxFQVYrQjtJQUFBLENBQWpDLENBTEEsQ0FBQTtXQW1CQSxRQUFBLENBQVMsa0JBQVQsRUFBNkIsU0FBQSxHQUFBO2FBQzNCLEVBQUEsQ0FBRyw2RkFBSCxFQUFrRyxTQUFBLEdBQUE7QUFDaEcsWUFBQSw4Q0FBQTtBQUFBLFFBQUEsT0FBdUIsRUFBdkIsRUFBQyxnQkFBRCxFQUFTLG9CQUFULENBQUE7QUFBQSxRQUVBLG9CQUFBLEdBQXVCLFNBQUMsU0FBRCxFQUFZLE1BQVosR0FBQTtBQUNyQixjQUFBLGdDQUFBOztZQURpQyxTQUFPO1dBQ3hDO0FBQUEsVUFBQSxJQUFHLDBCQUFIO0FBQ0U7QUFBQTtpQkFBQSw0Q0FBQTtnQ0FBQTtBQUNFLDRCQUFBLG9CQUFBLENBQXFCLEtBQXJCLEVBQTRCLE1BQU0sQ0FBQyxNQUFQLENBQWMsQ0FBQyxTQUFTLENBQUMsS0FBWCxDQUFkLENBQTVCLEVBQUEsQ0FERjtBQUFBOzRCQURGO1dBQUEsTUFBQTtBQUlFLFlBQUEsTUFBQSxDQUFPLFNBQVAsQ0FBaUIsQ0FBQyxJQUFsQixDQUF1QixNQUFPLENBQUEsVUFBQSxFQUFBLENBQTlCLENBQUEsQ0FBQTttQkFDQSxNQUFBLENBQU8sTUFBUCxDQUFjLENBQUMsT0FBZixDQUF1QixTQUFTLENBQUMsTUFBakMsRUFMRjtXQURxQjtRQUFBLENBRnZCLENBQUE7QUFBQSxRQVVBLGVBQUEsQ0FBZ0IsU0FBQSxHQUFBO2lCQUNkLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBYixDQUFrQixlQUFsQixDQUFrQyxDQUFDLElBQW5DLENBQXdDLFNBQUMsQ0FBRCxHQUFBO21CQUFPLE1BQUEsR0FBUyxFQUFoQjtVQUFBLENBQXhDLEVBRGM7UUFBQSxDQUFoQixDQVZBLENBQUE7ZUFhQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsY0FBQSxTQUFBO0FBQUEsVUFBQSxVQUFBLEdBQWEsQ0FBYixDQUFBO0FBQUEsVUFDQSxNQUFBLEdBQVMsTUFBTSxDQUFDLGdCQUFQLENBQXdCLENBQXhCLENBQTBCLENBQUMsTUFEcEMsQ0FBQTtBQUFBLFVBRUEsU0FBQSxHQUFZLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixDQUF4QixDQUEwQixDQUFDLFlBQTNCLENBQUEsQ0FGWixDQUFBO2lCQUdBLG9CQUFBLENBQXFCLFNBQXJCLEVBSkc7UUFBQSxDQUFMLEVBZGdHO01BQUEsQ0FBbEcsRUFEMkI7SUFBQSxDQUE3QixFQXBCd0I7RUFBQSxDQUExQixDQUFBLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/tokenized-line-spec.coffee