(function() {
  var $, $$, Editor, WindowEventHandler, path, _ref;

  _ref = require('atom'), $ = _ref.$, $$ = _ref.$$;

  path = require('path');

  Editor = require('../src/editor');

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
        jasmine.unspy(Editor.prototype, "shouldPromptToSave");
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
      it("saves the serialized state of the window so it can be deserialized after reload", function() {
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
          atom.unloadEditorWindow();
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
    return describe("core:focus-next and core:focus-previous", function() {
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
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZDQUFBOztBQUFBLEVBQUEsT0FBVSxPQUFBLENBQVEsTUFBUixDQUFWLEVBQUMsU0FBQSxDQUFELEVBQUksVUFBQSxFQUFKLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FEUCxDQUFBOztBQUFBLEVBRUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxlQUFSLENBRlQsQ0FBQTs7QUFBQSxFQUdBLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSw2QkFBUixDQUhyQixDQUFBOztBQUFBLEVBS0EsUUFBQSxDQUFTLFFBQVQsRUFBbUIsU0FBQSxHQUFBO0FBQ2pCLFFBQUEsc0NBQUE7QUFBQSxJQUFBLFFBQW9DLEVBQXBDLEVBQUMsc0JBQUQsRUFBYyw2QkFBZCxDQUFBO0FBQUEsSUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsVUFBQSxXQUFBO0FBQUEsTUFBQSxLQUFBLENBQU0sSUFBTixFQUFZLE1BQVosQ0FBQSxDQUFBO0FBQUEsTUFDQSxXQUFBLEdBQWMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFiLENBQUEsQ0FEZCxDQUFBO0FBQUEsTUFFQSxLQUFBLENBQU0sSUFBTixFQUFZLGlCQUFaLENBQThCLENBQUMsV0FBL0IsQ0FBMkMsU0FBQSxHQUFBO0FBQ3pDLFlBQUEsWUFBQTtBQUFBLFFBQUEsWUFBQSxHQUFlLElBQUksQ0FBQyxlQUFlLENBQUMsYUFBYSxDQUFDLElBQW5DLENBQXdDLElBQXhDLENBQWYsQ0FBQTtBQUFBLFFBQ0EsWUFBWSxDQUFDLFdBQWIsR0FBMkIsV0FEM0IsQ0FBQTtlQUVBLGFBSHlDO01BQUEsQ0FBM0MsQ0FGQSxDQUFBO0FBQUEsTUFNQSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQWIsQ0FBQSxDQU5BLENBQUE7QUFBQSxNQU9BLGtC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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/window-spec.coffee