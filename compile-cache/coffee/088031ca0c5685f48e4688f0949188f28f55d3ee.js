(function() {
  var View, Workspace;

  Workspace = require('../src/workspace');

  View = require('../src/space-pen-extensions').View;

  describe("Workspace", function() {
    var workspace;
    workspace = null;
    beforeEach(function() {
      atom.project.setPath(atom.project.resolve('dir'));
      return atom.workspace = workspace = new Workspace;
    });
    describe("::open(uri, options)", function() {
      var openEvents;
      openEvents = null;
      beforeEach(function() {
        openEvents = [];
        workspace.onDidOpen(function(event) {
          return openEvents.push(event);
        });
        return spyOn(workspace.getActivePane(), 'activate').andCallThrough();
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
              expect(workspace.getActivePane().items).toEqual([editor1]);
              expect(workspace.getActivePaneItem()).toBe(editor1);
              expect(workspace.getActivePane().activate).toHaveBeenCalled();
              expect(openEvents).toEqual([
                {
                  uri: void 0,
                  pane: workspace.getActivePane(),
                  item: editor1,
                  index: 0
                }
              ]);
              return openEvents = [];
            });
            waitsForPromise(function() {
              return workspace.open().then(function(editor) {
                return editor2 = editor;
              });
            });
            return runs(function() {
              expect(editor2.getPath()).toBeUndefined();
              expect(workspace.getActivePane().items).toEqual([editor1, editor2]);
              expect(workspace.getActivePaneItem()).toBe(editor2);
              expect(workspace.getActivePane().activate).toHaveBeenCalled();
              return expect(openEvents).toEqual([
                {
                  uri: void 0,
                  pane: workspace.getActivePane(),
                  item: editor2,
                  index: 1
                }
              ]);
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
                expect(workspace.getActivePaneItem()).toBe(editor);
                expect(workspace.getActivePane().activate).toHaveBeenCalled();
                return expect(openEvents).toEqual([
                  {
                    uri: atom.project.resolve('a'),
                    item: editor1,
                    pane: atom.workspace.getActivePane(),
                    index: 0
                  }, {
                    uri: atom.project.resolve('b'),
                    item: editor2,
                    pane: atom.workspace.getActivePane(),
                    index: 1
                  }, {
                    uri: atom.project.resolve('a'),
                    item: editor1,
                    pane: atom.workspace.getActivePane(),
                    index: 0
                  }
                ]);
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
                expect(workspace.getActivePaneItem()).toBe(editor);
                expect(workspace.getActivePane().items).toEqual([editor]);
                return expect(workspace.getActivePane().activate).toHaveBeenCalled();
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
              return expect(workspace.getActivePaneItem()).toBe(editor2);
            });
            waitsForPromise(function() {
              return workspace.open('a', {
                searchAllPanes: true
              });
            });
            return runs(function() {
              expect(workspace.getActivePane()).toBe(pane1);
              return expect(workspace.getActivePaneItem()).toBe(editor1);
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
              return expect(workspace.getActivePaneItem()).toBe(editor);
            });
          });
        });
      });
      describe("when the 'split' option is set", function() {
        describe("when the 'split' option is 'left'", function() {
          return it("opens the editor in the leftmost pane of the current pane axis", function() {
            var editor, pane1, pane2;
            pane1 = workspace.getActivePane();
            pane2 = pane1.splitRight();
            expect(workspace.getActivePane()).toBe(pane2);
            editor = null;
            waitsForPromise(function() {
              return workspace.open('a', {
                split: 'left'
              }).then(function(o) {
                return editor = o;
              });
            });
            runs(function() {
              expect(workspace.getActivePane()).toBe(pane1);
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
              expect(workspace.getActivePane()).toBe(pane1);
              expect(pane1.items).toEqual([editor]);
              return expect(pane2.items).toEqual([]);
            });
          });
        });
        describe("when a pane axis is the leftmost sibling of the current pane", function() {
          return it("opens the new item in the current pane", function() {
            var editor, pane1, pane2, pane3;
            editor = null;
            pane1 = workspace.getActivePane();
            pane2 = pane1.splitLeft();
            pane3 = pane2.splitDown();
            pane1.activate();
            expect(workspace.getActivePane()).toBe(pane1);
            waitsForPromise(function() {
              return workspace.open('a', {
                split: 'left'
              }).then(function(o) {
                return editor = o;
              });
            });
            return runs(function() {
              expect(workspace.getActivePane()).toBe(pane1);
              return expect(pane1.items).toEqual([editor]);
            });
          });
        });
        return describe("when the 'split' option is 'right'", function() {
          it("opens the editor in the rightmost pane of the current pane axis", function() {
            var editor, pane1, pane2;
            editor = null;
            pane1 = workspace.getActivePane();
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
              expect(workspace.getActivePane()).toBe(pane2);
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
              expect(workspace.getActivePane()).toBe(pane2);
              expect(pane1.items).toEqual([]);
              return expect(pane2.items).toEqual([editor]);
            });
          });
          return describe("when a pane axis is the rightmost sibling of the current pane", function() {
            return it("opens the new item in a new pane split to the right of the current pane", function() {
              var editor, pane1, pane2, pane3, pane4;
              editor = null;
              pane1 = workspace.getActivePane();
              pane2 = pane1.splitRight();
              pane3 = pane2.splitDown();
              pane1.activate();
              expect(workspace.getActivePane()).toBe(pane1);
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
                expect(workspace.getActivePane()).toBe(pane4);
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
      return it("notifies ::onDidAddTextEditor observers", function() {
        var absolutePath, editor, newEditorHandler;
        absolutePath = require.resolve('./fixtures/dir/a');
        newEditorHandler = jasmine.createSpy('newEditorHandler');
        workspace.onDidAddTextEditor(newEditorHandler);
        editor = null;
        waitsForPromise(function() {
          return workspace.open(absolutePath).then(function(e) {
            return editor = e;
          });
        });
        return runs(function() {
          return expect(newEditorHandler.argsForCall[0][0].textEditor).toBe(editor);
        });
      });
    });
    describe("::reopenItem()", function() {
      return it("opens the uri associated with the last closed pane that isn't currently open", function() {
        var pane;
        pane = workspace.getActivePane();
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
          expect(workspace.getActivePaneItem().getUri()).toBeUndefined();
          return pane.destroyActiveItem();
        });
        waitsForPromise(function() {
          return workspace.reopenItem();
        });
        runs(function() {
          expect(workspace.getActivePaneItem().getUri()).not.toBeUndefined();
          expect(workspace.getActivePaneItem().getUri()).toBe(atom.project.resolve('file1'));
          pane.destroyActiveItem();
          expect(workspace.getActivePaneItem().getUri()).toBe(atom.project.resolve('b'));
          pane.destroyActiveItem();
          expect(workspace.getActivePaneItem().getUri()).toBe(atom.project.resolve('a'));
          pane.destroyActiveItem();
          return expect(workspace.getActivePaneItem()).toBeUndefined();
        });
        waitsForPromise(function() {
          return workspace.reopenItem();
        });
        runs(function() {
          return expect(workspace.getActivePaneItem().getUri()).toBe(atom.project.resolve('a'));
        });
        waitsForPromise(function() {
          return workspace.open('b');
        });
        runs(function() {
          return expect(workspace.getActivePaneItem().getUri()).toBe(atom.project.resolve('b'));
        });
        waitsForPromise(function() {
          return workspace.reopenItem();
        });
        return runs(function() {
          return expect(workspace.getActivePaneItem().getUri()).toBe(atom.project.resolve('file1'));
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
          return expect(workspace.getActivePaneItem().getText()).toMatch(/Copyright/);
        });
      });
    });
    describe("::observeTextEditors()", function() {
      return it("invokes the observer with current and future text editors", function() {
        var observed;
        observed = [];
        waitsForPromise(function() {
          return workspace.open();
        });
        waitsForPromise(function() {
          return workspace.open();
        });
        waitsForPromise(function() {
          return workspace.openLicense();
        });
        runs(function() {
          return workspace.observeTextEditors(function(editor) {
            return observed.push(editor);
          });
        });
        waitsForPromise(function() {
          return workspace.open();
        });
        return expect(observed).toEqual(workspace.getTextEditors());
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
          expect(workspace.getTextEditors()).toHaveLength(1);
          editor.destroy();
          return expect(workspace.getTextEditors()).toHaveLength(0);
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
        return atom.packages.activatePackage('language-todo');
      });
      waitsForPromise(function() {
        return atom.workspace.open('sample.coffee');
      });
      return runs(function() {
        var coffeePackage, jsPackage, state, workspace2;
        atom.workspace.getActiveEditor().setText("i = /test/; #FIXME");
        state = atom.workspace.serialize();
        expect(state.packagesWithActiveGrammars).toEqual(['language-coffee-script', 'language-javascript', 'language-todo']);
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGVBQUE7O0FBQUEsRUFBQSxTQUFBLEdBQVksT0FBQSxDQUFRLGtCQUFSLENBQVosQ0FBQTs7QUFBQSxFQUNDLE9BQVEsT0FBQSxDQUFRLDZCQUFSLEVBQVIsSUFERCxDQUFBOztBQUFBLEVBR0EsUUFBQSxDQUFTLFdBQVQsRUFBc0IsU0FBQSxHQUFBO0FBQ3BCLFFBQUEsU0FBQTtBQUFBLElBQUEsU0FBQSxHQUFZLElBQVosQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFiLENBQXFCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBYixDQUFxQixLQUFyQixDQUFyQixDQUFBLENBQUE7YUFDQSxJQUFJLENBQUMsU0FBTCxHQUFpQixTQUFBLEdBQVksR0FBQSxDQUFBLFVBRnBCO0lBQUEsQ0FBWCxDQUZBLENBQUE7QUFBQSxJQU1BLFFBQUEsQ0FBUyxzQkFBVCxFQUFpQyxTQUFBLEdBQUE7QUFDL0IsVUFBQSxVQUFBO0FBQUEsTUFBQSxVQUFBLEdBQWEsSUFBYixDQUFBO0FBQUEsTUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsUUFBQSxVQUFBLEdBQWEsRUFBYixDQUFBO0FBQUEsUUFDQSxTQUFTLENBQUMsU0FBVixDQUFvQixTQUFDLEtBQUQsR0FBQTtpQkFBVyxVQUFVLENBQUMsSUFBWCxDQUFnQixLQUFoQixFQUFYO1FBQUEsQ0FBcEIsQ0FEQSxDQUFBO2VBRUEsS0FBQSxDQUFNLFNBQVMsQ0FBQyxhQUFWLENBQUEsQ0FBTixFQUFpQyxVQUFqQyxDQUE0QyxDQUFDLGNBQTdDLENBQUEsRUFIUztNQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsTUFPQSxRQUFBLENBQVMscURBQVQsRUFBZ0UsU0FBQSxHQUFB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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/workspace-spec.coffee