(function() {
  var Workspace;

  Workspace = require('../src/workspace');

  describe("Workspace", function() {
    var workspace;
    workspace = null;
    beforeEach(function() {
      atom.project.setPath(atom.project.resolve('dir'));
      return atom.workspace = workspace = new Workspace;
    });
    describe("::open(uri, options)", function() {
      beforeEach(function() {
        return spyOn(workspace.activePane, 'activate').andCallThrough();
      });
      describe("when the 'searchAllPanes' option is false (default)", function() {
        describe("when called without a uri", function() {
          return it("adds and activates an empty editor on the active pane", function() {
            var editor1, editor2, _ref;
            _ref = [], editor1 = _ref[0], editor2 = _ref[1];
            waitsForPromise(function() {
              return workspace.open().then(function(editor) {
                return editor1 = editor;
              });
            });
            runs(function() {
              expect(editor1.getPath()).toBeUndefined();
              expect(workspace.activePane.items).toEqual([editor1]);
              expect(workspace.activePaneItem).toBe(editor1);
              return expect(workspace.activePane.activate).toHaveBeenCalled();
            });
            waitsForPromise(function() {
              return workspace.open().then(function(editor) {
                return editor2 = editor;
              });
            });
            return runs(function() {
              expect(editor2.getPath()).toBeUndefined();
              expect(workspace.activePane.items).toEqual([editor1, editor2]);
              expect(workspace.activePaneItem).toBe(editor2);
              return expect(workspace.activePane.activate).toHaveBeenCalled();
            });
          });
        });
        return describe("when called with a uri", function() {
          describe("when the active pane already has an editor for the given uri", function() {
            return it("activates the existing editor on the active pane", function() {
              var editor, editor1, editor2;
              editor = null;
              editor1 = null;
              editor2 = null;
              waitsForPromise(function() {
                return workspace.open('a').then(function(o) {
                  editor1 = o;
                  return workspace.open('b').then(function(o) {
                    editor2 = o;
                    return workspace.open('a').then(function(o) {
                      return editor = o;
                    });
                  });
                });
              });
              return runs(function() {
                expect(editor).toBe(editor1);
                expect(workspace.activePaneItem).toBe(editor);
                return expect(workspace.activePane.activate).toHaveBeenCalled();
              });
            });
          });
          return describe("when the active pane does not have an editor for the given uri", function() {
            return it("adds and activates a new editor for the given path on the active pane", function() {
              var editor;
              editor = null;
              waitsForPromise(function() {
                return workspace.open('a').then(function(o) {
                  return editor = o;
                });
              });
              return runs(function() {
                expect(editor.getUri()).toBe(atom.project.resolve('a'));
                expect(workspace.activePaneItem).toBe(editor);
                expect(workspace.activePane.items).toEqual([editor]);
                return expect(workspace.activePane.activate).toHaveBeenCalled();
              });
            });
          });
        });
      });
      describe("when the 'searchAllPanes' option is true", function() {
        describe("when an editor for the given uri is already open on an inactive pane", function() {
          return it("activates the existing editor on the inactive pane, then activates that pane", function() {
            var editor1, editor2, pane1, pane2;
            editor1 = null;
            editor2 = null;
            pane1 = workspace.getActivePane();
            pane2 = workspace.getActivePane().splitRight();
            waitsForPromise(function() {
              pane1.activate();
              return workspace.open('a').then(function(o) {
                return editor1 = o;
              });
            });
            waitsForPromise(function() {
              pane2.activate();
              return workspace.open('b').then(function(o) {
                return editor2 = o;
              });
            });
            runs(function() {
              return expect(workspace.activePaneItem).toBe(editor2);
            });
            waitsForPromise(function() {
              return workspace.open('a', {
                searchAllPanes: true
              });
            });
            return runs(function() {
              expect(workspace.activePane).toBe(pane1);
              return expect(workspace.activePaneItem).toBe(editor1);
            });
          });
        });
        return describe("when no editor for the given uri is open in any pane", function() {
          return it("opens an editor for the given uri in the active pane", function() {
            var editor;
            editor = null;
            waitsForPromise(function() {
              return workspace.open('a', {
                searchAllPanes: true
              }).then(function(o) {
                return editor = o;
              });
            });
            return runs(function() {
              return expect(workspace.activePaneItem).toBe(editor);
            });
          });
        });
      });
      describe("when the 'split' option is set", function() {
        describe("when the 'split' option is 'left'", function() {
          return it("opens the editor in the leftmost pane of the current pane axis", function() {
            var editor, pane1, pane2;
            pane1 = workspace.activePane;
            pane2 = pane1.splitRight();
            expect(workspace.activePane).toBe(pane2);
            editor = null;
            waitsForPromise(function() {
              return workspace.open('a', {
                split: 'left'
              }).then(function(o) {
                return editor = o;
              });
            });
            runs(function() {
              expect(workspace.activePane).toBe(pane1);
              expect(pane1.items).toEqual([editor]);
              return expect(pane2.items).toEqual([]);
            });
            waitsForPromise(function() {
              pane2.focus();
              return workspace.open('a', {
                split: 'left'
              }).then(function(o) {
                return editor = o;
              });
            });
            return runs(function() {
              expect(workspace.activePane).toBe(pane1);
              expect(pane1.items).toEqual([editor]);
              return expect(pane2.items).toEqual([]);
            });
          });
        });
        describe("when a pane axis is the leftmost sibling of the current pane", function() {
          return it("opens the new item in the current pane", function() {
            var editor, pane1, pane2, pane3;
            editor = null;
            pane1 = workspace.activePane;
            pane2 = pane1.splitLeft();
            pane3 = pane2.splitDown();
            pane1.activate();
            expect(workspace.activePane).toBe(pane1);
            waitsForPromise(function() {
              return workspace.open('a', {
                split: 'left'
              }).then(function(o) {
                return editor = o;
              });
            });
            return runs(function() {
              expect(workspace.activePane).toBe(pane1);
              return expect(pane1.items).toEqual([editor]);
            });
          });
        });
        return describe("when the 'split' option is 'right'", function() {
          it("opens the editor in the rightmost pane of the current pane axis", function() {
            var editor, pane1, pane2;
            editor = null;
            pane1 = workspace.activePane;
            pane2 = null;
            waitsForPromise(function() {
              return workspace.open('a', {
                split: 'right'
              }).then(function(o) {
                return editor = o;
              });
            });
            runs(function() {
              pane2 = workspace.getPanes().filter(function(p) {
                return p !== pane1;
              })[0];
              expect(workspace.activePane).toBe(pane2);
              expect(pane1.items).toEqual([]);
              return expect(pane2.items).toEqual([editor]);
            });
            waitsForPromise(function() {
              pane1.focus();
              return workspace.open('a', {
                split: 'right'
              }).then(function(o) {
                return editor = o;
              });
            });
            return runs(function() {
              expect(workspace.activePane).toBe(pane2);
              expect(pane1.items).toEqual([]);
              return expect(pane2.items).toEqual([editor]);
            });
          });
          return describe("when a pane axis is the rightmost sibling of the current pane", function() {
            return it("opens the new item in a new pane split to the right of the current pane", function() {
              var editor, pane1, pane2, pane3, pane4;
              editor = null;
              pane1 = workspace.activePane;
              pane2 = pane1.splitRight();
              pane3 = pane2.splitDown();
              pane1.activate();
              expect(workspace.activePane).toBe(pane1);
              pane4 = null;
              waitsForPromise(function() {
                return workspace.open('a', {
                  split: 'right'
                }).then(function(o) {
                  return editor = o;
                });
              });
              return runs(function() {
                pane4 = workspace.getPanes().filter(function(p) {
                  return p !== pane1;
                })[0];
                expect(workspace.activePane).toBe(pane4);
                expect(pane4.items).toEqual([editor]);
                expect(workspace.paneContainer.root.children[0]).toBe(pane1);
                return expect(workspace.paneContainer.root.children[1]).toBe(pane4);
              });
            });
          });
        });
      });
      describe("when passed a path that matches a custom opener", function() {
        return it("returns the resource returned by the custom opener", function() {
          var barOpener, fooOpener;
          fooOpener = function(pathToOpen, options) {
            if (pathToOpen != null ? pathToOpen.match(/\.foo/) : void 0) {
              return {
                foo: pathToOpen,
                options: options
              };
            }
          };
          barOpener = function(pathToOpen) {
            if (pathToOpen != null ? pathToOpen.match(/^bar:\/\//) : void 0) {
              return {
                bar: pathToOpen
              };
            }
          };
          workspace.registerOpener(fooOpener);
          workspace.registerOpener(barOpener);
          waitsForPromise(function() {
            var pathToOpen;
            pathToOpen = atom.project.resolve('a.foo');
            return workspace.open(pathToOpen, {
              hey: "there"
            }).then(function(item) {
              return expect(item).toEqual({
                foo: pathToOpen,
                options: {
                  hey: "there"
                }
              });
            });
          });
          return waitsForPromise(function() {
            return workspace.open("bar://baz").then(function(item) {
              return expect(item).toEqual({
                bar: "bar://baz"
              });
            });
          });
        });
      });
      return it("emits an 'editor-created' event", function() {
        var absolutePath, editor, newEditorHandler;
        absolutePath = require.resolve('./fixtures/dir/a');
        newEditorHandler = jasmine.createSpy('newEditorHandler');
        workspace.on('editor-created', newEditorHandler);
        editor = null;
        waitsForPromise(function() {
          return workspace.open(absolutePath).then(function(e) {
            return editor = e;
          });
        });
        return runs(function() {
          return expect(newEditorHandler).toHaveBeenCalledWith(editor);
        });
      });
    });
    describe("::reopenItem()", function() {
      return it("opens the uri associated with the last closed pane that isn't currently open", function() {
        var pane;
        pane = workspace.activePane;
        waitsForPromise(function() {
          return workspace.open('a').then(function() {
            return workspace.open('b').then(function() {
              return workspace.open('file1').then(function() {
                return workspace.open();
              });
            });
          });
        });
        runs(function() {
          expect(workspace.activePaneItem.getUri()).toBeUndefined();
          return pane.destroyActiveItem();
        });
        waitsForPromise(function() {
          return workspace.reopenItem();
        });
        runs(function() {
          expect(workspace.activePaneItem.getUri()).not.toBeUndefined();
          expect(workspace.activePaneItem.getUri()).toBe(atom.project.resolve('file1'));
          pane.destroyActiveItem();
          expect(workspace.activePaneItem.getUri()).toBe(atom.project.resolve('b'));
          pane.destroyActiveItem();
          expect(workspace.activePaneItem.getUri()).toBe(atom.project.resolve('a'));
          pane.destroyActiveItem();
          return expect(workspace.activePaneItem).toBeUndefined();
        });
        waitsForPromise(function() {
          return workspace.reopenItem();
        });
        runs(function() {
          return expect(workspace.activePaneItem.getUri()).toBe(atom.project.resolve('a'));
        });
        waitsForPromise(function() {
          return workspace.open('b');
        });
        runs(function() {
          return expect(workspace.activePaneItem.getUri()).toBe(atom.project.resolve('b'));
        });
        waitsForPromise(function() {
          return workspace.reopenItem();
        });
        return runs(function() {
          return expect(workspace.activePaneItem.getUri()).toBe(atom.project.resolve('file1'));
        });
      });
    });
    describe("::increase/decreaseFontSize()", function() {
      return it("increases/decreases the font size without going below 1", function() {
        atom.config.set('editor.fontSize', 1);
        workspace.increaseFontSize();
        expect(atom.config.get('editor.fontSize')).toBe(2);
        workspace.increaseFontSize();
        expect(atom.config.get('editor.fontSize')).toBe(3);
        workspace.decreaseFontSize();
        expect(atom.config.get('editor.fontSize')).toBe(2);
        workspace.decreaseFontSize();
        expect(atom.config.get('editor.fontSize')).toBe(1);
        workspace.decreaseFontSize();
        return expect(atom.config.get('editor.fontSize')).toBe(1);
      });
    });
    describe("::openLicense()", function() {
      return it("opens the license as plain-text in a buffer", function() {
        waitsForPromise(function() {
          return workspace.openLicense();
        });
        return runs(function() {
          return expect(workspace.activePaneItem.getText()).toMatch(/Copyright/);
        });
      });
    });
    describe("when an editor is destroyed", function() {
      return it("removes the editor", function() {
        var editor;
        editor = null;
        waitsForPromise(function() {
          return workspace.open("a").then(function(e) {
            return editor = e;
          });
        });
        return runs(function() {
          expect(workspace.getEditors()).toHaveLength(1);
          editor.destroy();
          return expect(workspace.getEditors()).toHaveLength(0);
        });
      });
    });
    describe("when an editor is copied", function() {
      return it("emits an 'editor-created' event", function() {
        var editor, handler;
        editor = null;
        handler = jasmine.createSpy('editorCreatedHandler');
        workspace.on('editor-created', handler);
        waitsForPromise(function() {
          return workspace.open("a").then(function(o) {
            return editor = o;
          });
        });
        return runs(function() {
          var editorCopy;
          expect(handler.callCount).toBe(1);
          editorCopy = editor.copy();
          return expect(handler.callCount).toBe(2);
        });
      });
    });
    return it("stores the active grammars used by all the open editors", function() {
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-javascript');
      });
      waitsForPromise(function() {
        return atom.packages.activatePackage('language-coffee-script');
      });
      waitsForPromise(function() {
        return atom.workspace.open('sample.coffee');
      });
      return runs(function() {
        var coffeePackage, jsPackage, state, workspace2;
        atom.workspace.getActiveEditor().setText('i = /test/;');
        state = atom.workspace.serialize();
        expect(state.packagesWithActiveGrammars).toEqual(['language-coffee-script', 'language-javascript']);
        jsPackage = atom.packages.getLoadedPackage('language-javascript');
        coffeePackage = atom.packages.getLoadedPackage('language-coffee-script');
        spyOn(jsPackage, 'loadGrammarsSync');
        spyOn(coffeePackage, 'loadGrammarsSync');
        workspace2 = Workspace.deserialize(state);
        expect(jsPackage.loadGrammarsSync.callCount).toBe(1);
        return expect(coffeePackage.loadGrammarsSync.callCount).toBe(1);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFNBQUE7O0FBQUEsRUFBQSxTQUFBLEdBQVksT0FBQSxDQUFRLGtCQUFSLENBQVosQ0FBQTs7QUFBQSxFQUVBLFFBQUEsQ0FBUyxXQUFULEVBQXNCLFNBQUEsR0FBQTtBQUNwQixRQUFBLFNBQUE7QUFBQSxJQUFBLFNBQUEsR0FBWSxJQUFaLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBYixDQUFxQixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQWIsQ0FBcUIsS0FBckIsQ0FBckIsQ0FBQSxDQUFBO2FBQ0EsSUFBSSxDQUFDLFNBQUwsR0FBaUIsU0FBQSxHQUFZLEdBQUEsQ0FBQSxVQUZwQjtJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFNQSxRQUFBLENBQVMsc0JBQVQsRUFBaUMsU0FBQSxHQUFBO0FBQy9CLE1BQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtlQUNULEtBQUEsQ0FBTSxTQUFTLENBQUMsVUFBaEIsRUFBNEIsVUFBNUIsQ0FBdUMsQ0FBQyxjQUF4QyxDQUFBLEVBRFM7TUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLE1BR0EsUUFBQSxDQUFTLHFEQUFULEVBQWdFLFNBQUEsR0FBQTtBQUM5RCxRQUFBLFFBQUEsQ0FBUywyQkFBVCxFQUFzQyxTQUFBLEdBQUE7aUJBQ3BDLEVBQUEsQ0FBRyx1REFBSCxFQUE0RCxTQUFBLEdBQUE7QUFDMUQsZ0JBQUEsc0JBQUE7QUFBQSxZQUFBLE9BQXFCLEVBQXJCLEVBQUMsaUJBQUQsRUFBVSxpQkFBVixDQUFBO0FBQUEsWUFFQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtxQkFDZCxTQUFTLENBQUMsSUFBVixDQUFBLENBQWdCLENBQUMsSUFBakIsQ0FBc0IsU0FBQyxN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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/workspace-spec.coffee