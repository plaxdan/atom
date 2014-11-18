(function() {
  var $, $$, TextEditor, WindowEventHandler, path, _ref;

  _ref = require('atom'), $ = _ref.$, $$ = _ref.$$;

  path = require('path');

  TextEditor = require('../src/text-editor');

  WindowEventHandler = require('../src/window-event-handler');

  describe("Window", function() {
    var projectPath, windowEventHandler, _ref1;
    _ref1 = [], projectPath = _ref1[0], windowEventHandler = _ref1[1];
    beforeEach(function() {
      var initialPath;
      spyOn(atom, 'hide');
      initialPath = atom.project.getPath();
      spyOn(atom, 'getLoadSettings').andCallFake(function() {
        var loadSettings;
        loadSettings = atom.getLoadSettings.originalValue.call(atom);
        loadSettings.initialPath = initialPath;
        return loadSettings;
      });
      atom.project.destroy();
      windowEventHandler = new WindowEventHandler();
      atom.deserializeEditorWindow();
      return projectPath = atom.project.getPath();
    });
    afterEach(function() {
      windowEventHandler.unsubscribe();
      return $(window).off('beforeunload');
    });
    describe("when the window is loaded", function() {
      return it("doesn't have .is-blurred on the body tag", function() {
        return expect($("body")).not.toHaveClass("is-blurred");
      });
    });
    describe("when the window is blurred", function() {
      beforeEach(function() {
        return $(window).triggerHandler('blur');
      });
      afterEach(function() {
        return $('body').removeClass('is-blurred');
      });
      it("adds the .is-blurred class on the body", function() {
        return expect($("body")).toHaveClass("is-blurred");
      });
      return describe("when the window is focused again", function() {
        return it("removes the .is-blurred class from the body", function() {
          $(window).triggerHandler('focus');
          return expect($("body")).not.toHaveClass("is-blurred");
        });
      });
    });
    describe("window:close event", function() {
      it("closes the window", function() {
        spyOn(atom, 'close');
        $(window).trigger('window:close');
        return expect(atom.close).toHaveBeenCalled();
      });
      return it("emits the beforeunload event", function() {
        var beforeunload;
        $(window).off('beforeunload');
        beforeunload = jasmine.createSpy('beforeunload').andReturn(false);
        $(window).on('beforeunload', beforeunload);
        $(window).trigger('window:close');
        return expect(beforeunload).toHaveBeenCalled();
      });
    });
    describe("beforeunload event", function() {
      var beforeUnloadEvent;
      beforeUnloadEvent = [][0];
      beforeEach(function() {
        jasmine.unspy(TextEditor.prototype, "shouldPromptToSave");
        return beforeUnloadEvent = $.Event(new Event('beforeunload'));
      });
      return describe("when pane items are are modified", function() {
        it("prompts user to save and and calls workspaceView.confirmClose", function() {
          var editor;
          editor = null;
          spyOn(atom.workspaceView, 'confirmClose').andCallThrough();
          spyOn(atom, "confirm").andReturn(2);
          waitsForPromise(function() {
            return atom.workspace.open("sample.js").then(function(o) {
              return editor = o;
            });
          });
          return runs(function() {
            editor.insertText("I look different, I feel different.");
            $(window).trigger(beforeUnloadEvent);
            expect(atom.workspaceView.confirmClose).toHaveBeenCalled();
            return expect(atom.confirm).toHaveBeenCalled();
          });
        });
        it("prompts user to save and handler returns true if don't save", function() {
          var editor;
          editor = null;
          spyOn(atom, "confirm").andReturn(2);
          waitsForPromise(function() {
            return atom.workspace.open("sample.js").then(function(o) {
              return editor = o;
            });
          });
          return runs(function() {
            editor.insertText("I look different, I feel different.");
            $(window).trigger(beforeUnloadEvent);
            return expect(atom.confirm).toHaveBeenCalled();
          });
        });
        return it("prompts user to save and handler returns false if dialog is canceled", function() {
          var editor;
          editor = null;
          spyOn(atom, "confirm").andReturn(1);
          waitsForPromise(function() {
            return atom.workspace.open("sample.js").then(function(o) {
              return editor = o;
            });
          });
          return runs(function() {
            editor.insertText("I look different, I feel different.");
            $(window).trigger(beforeUnloadEvent);
            return expect(atom.confirm).toHaveBeenCalled();
          });
        });
      });
    });
    describe(".unloadEditorWindow()", function() {
      return it("saves the serialized state of the window so it can be deserialized after reload", function() {
        var projectState, syntaxState, workspaceState;
        workspaceState = atom.workspace.serialize();
        syntaxState = atom.syntax.serialize();
        projectState = atom.project.serialize();
        atom.unloadEditorWindow();
        expect(atom.state.workspace).toEqual(workspaceState);
        expect(atom.state.syntax).toEqual(syntaxState);
        expect(atom.state.project).toEqual(projectState);
        return expect(atom.saveSync).toHaveBeenCalled();
      });
    });
    describe(".removeEditorWindow()", function() {
      return it("unsubscribes from all buffers", function() {
        waitsForPromise(function() {
          return atom.workspace.open("sample.js");
        });
        return runs(function() {
          var buffer, pane;
          buffer = atom.workspace.getActivePaneItem().buffer;
          pane = atom.workspaceView.getActivePaneView();
          pane.splitRight(pane.copyActiveItem());
          expect(atom.workspaceView.find('.editor').length).toBe(2);
          atom.removeEditorWindow();
          return expect(buffer.getSubscriptionCount()).toBe(0);
        });
      });
    });
    describe("drag and drop", function() {
      var buildDragEvent;
      buildDragEvent = function(type, files) {
        var dataTransfer, event;
        dataTransfer = {
          files: files,
          data: {},
          setData: function(key, value) {
            return this.data[key] = value;
          },
          getData: function(key) {
            return this.data[key];
          }
        };
        event = $.Event(type);
        event.originalEvent = {
          dataTransfer: dataTransfer
        };
        event.preventDefault = function() {};
        event.stopPropagation = function() {};
        return event;
      };
      describe("when a file is dragged to window", function() {
        return it("opens it", function() {
          var event;
          spyOn(atom, "open");
          event = buildDragEvent("drop", [
            {
              path: "/fake1"
            }, {
              path: "/fake2"
            }
          ]);
          $(document).trigger(event);
          expect(atom.open.callCount).toBe(1);
          return expect(atom.open.argsForCall[0][0]).toEqual({
            pathsToOpen: ['/fake1', '/fake2']
          });
        });
      });
      return describe("when a non-file is dragged to window", function() {
        return it("does nothing", function() {
          var event;
          spyOn(atom, "open");
          event = buildDragEvent("drop", []);
          $(document).trigger(event);
          return expect(atom.open).not.toHaveBeenCalled();
        });
      });
    });
    describe("when a link is clicked", function() {
      return it("opens the http/https links in an external application", function() {
        var shell;
        shell = require('shell');
        spyOn(shell, 'openExternal');
        $("<a href='http://github.com'>the website</a>").appendTo(document.body).click().remove();
        expect(shell.openExternal).toHaveBeenCalled();
        expect(shell.openExternal.argsForCall[0][0]).toBe("http://github.com");
        shell.openExternal.reset();
        $("<a href='https://github.com'>the website</a>").appendTo(document.body).click().remove();
        expect(shell.openExternal).toHaveBeenCalled();
        expect(shell.openExternal.argsForCall[0][0]).toBe("https://github.com");
        shell.openExternal.reset();
        $("<a href=''>the website</a>").appendTo(document.body).click().remove();
        expect(shell.openExternal).not.toHaveBeenCalled();
        shell.openExternal.reset();
        $("<a href='#scroll-me'>link</a>").appendTo(document.body).click().remove();
        return expect(shell.openExternal).not.toHaveBeenCalled();
      });
    });
    describe("core:focus-next and core:focus-previous", function() {
      describe("when there is no currently focused element", function() {
        return it("focuses the element with the lowest/highest tabindex", function() {
          var elements;
          elements = $$(function() {
            return this.div((function(_this) {
              return function() {
                _this.button({
                  tabindex: 2
                });
                return _this.input({
                  tabindex: 1
                });
              };
            })(this));
          });
          elements.attachToDom();
          elements.trigger("core:focus-next");
          expect(elements.find("[tabindex=1]:focus")).toExist();
          $(":focus").blur();
          elements.trigger("core:focus-previous");
          return expect(elements.find("[tabindex=2]:focus")).toExist();
        });
      });
      return describe("when a tabindex is set on the currently focused element", function() {
        it("focuses the element with the next highest tabindex", function() {
          var elements;
          elements = $$(function() {
            return this.div((function(_this) {
              return function() {
                _this.input({
                  tabindex: 1
                });
                _this.button({
                  tabindex: 2
                });
                _this.button({
                  tabindex: 5
                });
                _this.input({
                  tabindex: -1
                });
                _this.input({
                  tabindex: 3
                });
                return _this.button({
                  tabindex: 7
                });
              };
            })(this));
          });
          elements.attachToDom();
          elements.find("[tabindex=1]").focus();
          elements.trigger("core:focus-next");
          expect(elements.find("[tabindex=2]:focus")).toExist();
          elements.trigger("core:focus-next");
          expect(elements.find("[tabindex=3]:focus")).toExist();
          elements.focus().trigger("core:focus-next");
          expect(elements.find("[tabindex=5]:focus")).toExist();
          elements.focus().trigger("core:focus-next");
          expect(elements.find("[tabindex=7]:focus")).toExist();
          elements.focus().trigger("core:focus-next");
          expect(elements.find("[tabindex=1]:focus")).toExist();
          elements.trigger("core:focus-previous");
          expect(elements.find("[tabindex=7]:focus")).toExist();
          elements.trigger("core:focus-previous");
          expect(elements.find("[tabindex=5]:focus")).toExist();
          elements.focus().trigger("core:focus-previous");
          expect(elements.find("[tabindex=3]:focus")).toExist();
          elements.focus().trigger("core:focus-previous");
          expect(elements.find("[tabindex=2]:focus")).toExist();
          elements.focus().trigger("core:focus-previous");
          return expect(elements.find("[tabindex=1]:focus")).toExist();
        });
        return it("skips disabled elements", function() {
          var elements;
          elements = $$(function() {
            return this.div((function(_this) {
              return function() {
                _this.input({
                  tabindex: 1
                });
                _this.button({
                  tabindex: 2,
                  disabled: 'disabled'
                });
                return _this.input({
                  tabindex: 3
                });
              };
            })(this));
          });
          elements.attachToDom();
          elements.find("[tabindex=1]").focus();
          elements.trigger("core:focus-next");
          expect(elements.find("[tabindex=3]:focus")).toExist();
          elements.trigger("core:focus-previous");
          return expect(elements.find("[tabindex=1]:focus")).toExist();
        });
      });
    });
    return describe("the window:open-path event", function() {
      beforeEach(function() {
        return spyOn(atom.workspace, 'open');
      });
      describe("when the project does not have a path", function() {
        beforeEach(function() {
          return atom.project.setPath();
        });
        describe("when the opened path exists", function() {
          return it("sets the project path to the opened path", function() {
            $(window).trigger('window:open-path', [
              {
                pathToOpen: __filename
              }
            ]);
            return expect(atom.project.getPath()).toBe(__dirname);
          });
        });
        return describe("when the opened path does not exist but its parent directory does", function() {
          return it("sets the project path to the opened path's parent directory", function() {
            $(window).trigger('window:open-path', [
              {
                pathToOpen: path.join(__dirname, 'this-path-does-not-exist.txt')
              }
            ]);
            return expect(atom.project.getPath()).toBe(__dirname);
          });
        });
      });
      describe("when the opened path is a file", function() {
        return it("opens it in the workspace", function() {
          $(window).trigger('window:open-path', [
            {
              pathToOpen: __filename
            }
          ]);
          return expect(atom.workspace.open.mostRecentCall.args[0]).toBe(__filename);
        });
      });
      return describe("when the opened path is a directory", function() {
        return it("does not open it in the workspace", function() {
          $(window).trigger('window:open-path', [
            {
              pathToOpen: __dirname
            }
          ]);
          return expect(atom.workspace.open.callCount).toBe(0);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlEQUFBOztBQUFBLEVBQUEsT0FBVSxPQUFBLENBQVEsTUFBUixDQUFWLEVBQUMsU0FBQSxDQUFELEVBQUksVUFBQSxFQUFKLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBRUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxvQkFBUixDQUZiLENBQUE7O0FBQUEsRUFHQSxrQkFBQSxHQUFxQixPQUFBLENBQVEsNkJBQVIsQ0FIckIsQ0FBQTs7QUFBQSxFQUtBLFFBQUEsQ0FBUyxRQUFULEVBQW1CLFNBQUEsR0FBQTtBQUNqQixRQUFBLHNDQUFBO0FBQUEsSUFBQSxRQUFvQyxFQUFwQyxFQUFDLHNCQUFELEVBQWMsNkJBQWQsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEsV0FBQTtBQUFBLE1BQUEsS0FBQSxDQUFNLElBQU4sRUFBWSxNQUFaLENBQUEsQ0FBQTtBQUFBLE1BQ0EsV0FBQSxHQUFjLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBYixDQUFBLENBRGQsQ0FBQTtBQUFBLE1BRUEsS0FBQSxDQUFNLElBQU4sRUFBWSxpQkFBWixDQUE4QixDQUFDLFdBQS9CLENBQTJDLFNBQUEsR0FBQTtBQUN6QyxZQUFBLFlBQUE7QUFBQSxRQUFBLFlBQUEsR0FBZSxJQUFJLENBQUMsZUFBZSxDQUFDLGFBQWEsQ0FBQyxJQUFuQyxDQUF3QyxJQUF4QyxDQUFmLENBQUE7QUFBQSxRQUNBLFlBQVksQ0FBQyxXQUFiLEdBQTJCLFdBRDNCLENBQUE7ZUFFQSxhQUh5QztNQUFBLENBQTNDLENBRkEsQ0FBQTtBQUFBLE1BTUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFiLENBQUEsQ0FOQSxDQUFBO0FBQUEsTUFPQSxr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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/window-spec.coffee