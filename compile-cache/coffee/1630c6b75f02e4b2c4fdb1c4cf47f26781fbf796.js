(function() {
  var $, $$, Package, WorkspaceView, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('atom'), $ = _ref.$, $$ = _ref.$$, WorkspaceView = _ref.WorkspaceView;

  Package = require('../src/package');

  describe("PackageManager", function() {
    beforeEach(function() {
      return atom.workspaceView = new WorkspaceView;
    });
    describe("::loadPackage(name)", function() {
      it("continues if the package has an invalid package.json", function() {
        spyOn(console, 'warn');
        atom.config.set("core.disabledPackages", []);
        return expect(function() {
          return atom.packages.loadPackage("package-with-broken-package-json");
        }).not.toThrow();
      });
      return it("continues if the package has an invalid keymap", function() {
        spyOn(console, 'warn');
        atom.config.set("core.disabledPackages", []);
        return expect(function() {
          return atom.packages.loadPackage("package-with-broken-keymap");
        }).not.toThrow();
      });
    });
    describe("::unloadPackage(name)", function() {
      describe("when the package is active", function() {
        return it("throws an error", function() {
          var pack;
          pack = null;
          waitsForPromise(function() {
            return atom.packages.activatePackage('package-with-main').then(function(p) {
              return pack = p;
            });
          });
          return runs(function() {
            expect(atom.packages.isPackageLoaded(pack.name)).toBeTruthy();
            expect(atom.packages.isPackageActive(pack.name)).toBeTruthy();
            expect(function() {
              return atom.packages.unloadPackage(pack.name);
            }).toThrow();
            expect(atom.packages.isPackageLoaded(pack.name)).toBeTruthy();
            return expect(atom.packages.isPackageActive(pack.name)).toBeTruthy();
          });
        });
      });
      describe("when the package is not loaded", function() {
        return it("throws an error", function() {
          expect(atom.packages.isPackageLoaded('unloaded')).toBeFalsy();
          expect(function() {
            return atom.packages.unloadPackage('unloaded');
          }).toThrow();
          return expect(atom.packages.isPackageLoaded('unloaded')).toBeFalsy();
        });
      });
      return describe("when the package is loaded", function() {
        return it("no longers reports it as being loaded", function() {
          var pack;
          pack = atom.packages.loadPackage('package-with-main');
          expect(atom.packages.isPackageLoaded(pack.name)).toBeTruthy();
          atom.packages.unloadPackage(pack.name);
          return expect(atom.packages.isPackageLoaded(pack.name)).toBeFalsy();
        });
      });
    });
    describe("::activatePackage(id)", function() {
      describe("atom packages", function() {
        describe("when called multiple times", function() {
          return it("it only calls activate on the package once", function() {
            spyOn(Package.prototype, 'activateNow').andCallThrough();
            atom.packages.activatePackage('package-with-index');
            atom.packages.activatePackage('package-with-index');
            waitsForPromise(function() {
              return atom.packages.activatePackage('package-with-index');
            });
            return runs(function() {
              return expect(Package.prototype.activateNow.callCount).toBe(1);
            });
          });
        });
        describe("when the package has a main module", function() {
          describe("when the metadata specifies a main module path˜", function() {
            return it("requires the module at the specified path", function() {
              var mainModule, pack;
              mainModule = require('./fixtures/packages/package-with-main/main-module');
              spyOn(mainModule, 'activate');
              pack = null;
              waitsForPromise(function() {
                return atom.packages.activatePackage('package-with-main').then(function(p) {
                  return pack = p;
                });
              });
              return runs(function() {
                expect(mainModule.activate).toHaveBeenCalled();
                return expect(pack.mainModule).toBe(mainModule);
              });
            });
          });
          describe("when the metadata does not specify a main module", function() {
            return it("requires index.coffee", function() {
              var indexModule, pack;
              indexModule = require('./fixtures/packages/package-with-index/index');
              spyOn(indexModule, 'activate');
              pack = null;
              waitsForPromise(function() {
                return atom.packages.activatePackage('package-with-index').then(function(p) {
                  return pack = p;
                });
              });
              return runs(function() {
                expect(indexModule.activate).toHaveBeenCalled();
                return expect(pack.mainModule).toBe(indexModule);
              });
            });
          });
          it("assigns config defaults from the module", function() {
            expect(atom.config.get('package-with-config-defaults.numbers.one')).toBeUndefined();
            waitsForPromise(function() {
              return atom.packages.activatePackage('package-with-config-defaults');
            });
            return runs(function() {
              expect(atom.config.get('package-with-config-defaults.numbers.one')).toBe(1);
              return expect(atom.config.get('package-with-config-defaults.numbers.two')).toBe(2);
            });
          });
          return describe("when the package metadata includes `activationCommands`", function() {
            var mainModule, promise, workspaceCommandListener, _ref1;
            _ref1 = [], mainModule = _ref1[0], promise = _ref1[1], workspaceCommandListener = _ref1[2];
            beforeEach(function() {
              atom.workspaceView.attachToDom();
              mainModule = require('./fixtures/packages/package-with-activation-commands/index');
              mainModule.legacyActivationCommandCallCount = 0;
              mainModule.activationCommandCallCount = 0;
              spyOn(mainModule, 'activate').andCallThrough();
              spyOn(Package.prototype, 'requireMainModule').andCallThrough();
              workspaceCommandListener = jasmine.createSpy('workspaceCommandListener');
              atom.commands.add('.workspace', 'activation-command', workspaceCommandListener);
              return promise = atom.packages.activatePackage('package-with-activation-commands');
            });
            it("defers requiring/activating the main module until an activation event bubbles to the root view", function() {
              expect(promise.isFulfilled()).not.toBeTruthy();
              atom.workspaceView[0].dispatchEvent(new CustomEvent('activation-command', {
                bubbles: true
              }));
              return waitsForPromise(function() {
                return promise;
              });
            });
            it("triggers the activation event on all handlers registered during activation", function() {
              waitsForPromise(function() {
                return atom.workspaceView.open();
              });
              return runs(function() {
                var editorCommandListener, editorView, legacyCommandListener;
                editorView = atom.workspaceView.getActiveView();
                legacyCommandListener = jasmine.createSpy("legacyCommandListener");
                editorView.command('activation-command', legacyCommandListener);
                editorCommandListener = jasmine.createSpy("editorCommandListener");
                atom.commands.add('.editor', 'activation-command', editorCommandListener);
                editorView[0].dispatchEvent(new CustomEvent('activation-command', {
                  bubbles: true
                }));
                expect(mainModule.activate.callCount).toBe(1);
                expect(mainModule.legacyActivationCommandCallCount).toBe(1);
                expect(mainModule.activationCommandCallCount).toBe(1);
                expect(legacyCommandListener.callCount).toBe(1);
                expect(editorCommandListener.callCount).toBe(1);
                expect(workspaceCommandListener.callCount).toBe(1);
                editorView[0].dispatchEvent(new CustomEvent('activation-command', {
                  bubbles: true
                }));
                expect(mainModule.legacyActivationCommandCallCount).toBe(2);
                expect(mainModule.activationCommandCallCount).toBe(2);
                expect(legacyCommandListener.callCount).toBe(2);
                expect(editorCommandListener.callCount).toBe(2);
                expect(workspaceCommandListener.callCount).toBe(2);
                return expect(mainModule.activate.callCount).toBe(1);
              });
            });
            return it("activates the package immediately when the events are empty", function() {
              mainModule = require('./fixtures/packages/package-with-empty-activation-commands/index');
              spyOn(mainModule, 'activate').andCallThrough();
              waitsForPromise(function() {
                return atom.packages.activatePackage('package-with-empty-activation-commands');
              });
              return runs(function() {
                return expect(mainModule.activate.callCount).toBe(1);
              });
            });
          });
        });
        describe("when the package has no main module", function() {
          return it("does not throw an exception", function() {
            spyOn(console, "error");
            spyOn(console, "warn").andCallThrough();
            expect(function() {
              return atom.packages.activatePackage('package-without-module');
            }).not.toThrow();
            expect(console.error).not.toHaveBeenCalled();
            return expect(console.warn).not.toHaveBeenCalled();
          });
        });
        it("passes the activate method the package's previously serialized state if it exists", function() {
          var pack;
          pack = null;
          waitsForPromise(function() {
            return atom.packages.activatePackage("package-with-serialization").then(function(p) {
              return pack = p;
            });
          });
          return runs(function() {
            expect(pack.mainModule.someNumber).not.toBe(77);
            pack.mainModule.someNumber = 77;
            atom.packages.deactivatePackage("package-with-serialization");
            spyOn(pack.mainModule, 'activate').andCallThrough();
            atom.packages.activatePackage("package-with-serialization");
            return expect(pack.mainModule.activate).toHaveBeenCalledWith({
              someNumber: 77
            });
          });
        });
        it("logs warning instead of throwing an exception if the package fails to load", function() {
          atom.config.set("core.disabledPackages", []);
          spyOn(console, "warn");
          expect(function() {
            return atom.packages.activatePackage("package-that-throws-an-exception");
          }).not.toThrow();
          return expect(console.warn).toHaveBeenCalled();
        });
        describe("keymap loading", function() {
          describe("when the metadata does not contain a 'keymaps' manifest", function() {
            return it("loads all the .cson/.json files in the keymaps directory", function() {
              var element1, element2, element3;
              element1 = $$(function() {
                return this.div({
                  "class": 'test-1'
                });
              });
              element2 = $$(function() {
                return this.div({
                  "class": 'test-2'
                });
              });
              element3 = $$(function() {
                return this.div({
                  "class": 'test-3'
                });
              });
              expect(atom.keymaps.findKeyBindings({
                keystrokes: 'ctrl-z',
                target: element1[0]
              })).toHaveLength(0);
              expect(atom.keymaps.findKeyBindings({
                keystrokes: 'ctrl-z',
                target: element2[0]
              })).toHaveLength(0);
              expect(atom.keymaps.findKeyBindings({
                keystrokes: 'ctrl-z',
                target: element3[0]
              })).toHaveLength(0);
              atom.packages.activatePackage("package-with-keymaps");
              expect(atom.keymaps.findKeyBindings({
                keystrokes: 'ctrl-z',
                target: element1[0]
              })[0].command).toBe("test-1");
              expect(atom.keymaps.findKeyBindings({
                keystrokes: 'ctrl-z',
                target: element2[0]
              })[0].command).toBe("test-2");
              return expect(atom.keymaps.findKeyBindings({
                keystrokes: 'ctrl-z',
                target: element3[0]
              })).toHaveLength(0);
            });
          });
          return describe("when the metadata contains a 'keymaps' manifest", function() {
            return it("loads only the keymaps specified by the manifest, in the specified order", function() {
              var element1, element3;
              element1 = $$(function() {
                return this.div({
                  "class": 'test-1'
                });
              });
              element3 = $$(function() {
                return this.div({
                  "class": 'test-3'
                });
              });
              expect(atom.keymaps.findKeyBindings({
                keystrokes: 'ctrl-z',
                target: element1[0]
              })).toHaveLength(0);
              atom.packages.activatePackage("package-with-keymaps-manifest");
              expect(atom.keymaps.findKeyBindings({
                keystrokes: 'ctrl-z',
                target: element1[0]
              })[0].command).toBe('keymap-1');
              expect(atom.keymaps.findKeyBindings({
                keystrokes: 'ctrl-n',
                target: element1[0]
              })[0].command).toBe('keymap-2');
              return expect(atom.keymaps.findKeyBindings({
                keystrokes: 'ctrl-y',
                target: element3[0]
              })).toHaveLength(0);
            });
          });
        });
        describe("menu loading", function() {
          beforeEach(function() {
            atom.contextMenu.definitions = [];
            return atom.menu.template = [];
          });
          describe("when the metadata does not contain a 'menus' manifest", function() {
            return it("loads all the .cson/.json files in the menus directory", function() {
              var element;
              element = ($$(function() {
                return this.div({
                  "class": 'test-1'
                });
              }))[0];
              expect(atom.contextMenu.definitionsForElement(element)).toEqual([]);
              atom.packages.activatePackage("package-with-menus");
              expect(atom.menu.template.length).toBe(2);
              expect(atom.menu.template[0].label).toBe("Second to Last");
              expect(atom.menu.template[1].label).toBe("Last");
              expect(atom.contextMenu.definitionsForElement(element)[0].label).toBe("Menu item 1");
              expect(atom.contextMenu.definitionsForElement(element)[1].label).toBe("Menu item 2");
              return expect(atom.contextMenu.definitionsForElement(element)[2].label).toBe("Menu item 3");
            });
          });
          return describe("when the metadata contains a 'menus' manifest", function() {
            return it("loads only the menus specified by the manifest, in the specified order", function() {
              var element;
              element = ($$(function() {
                return this.div({
                  "class": 'test-1'
                });
              }))[0];
              expect(atom.contextMenu.definitionsForElement(element)).toEqual([]);
              atom.packages.activatePackage("package-with-menus-manifest");
              expect(atom.menu.template[0].label).toBe("Second to Last");
              expect(atom.menu.template[1].label).toBe("Last");
              expect(atom.contextMenu.definitionsForElement(element)[0].label).toBe("Menu item 2");
              expect(atom.contextMenu.definitionsForElement(element)[1].label).toBe("Menu item 1");
              return expect(atom.contextMenu.definitionsForElement(element)[2]).toBeUndefined();
            });
          });
        });
        describe("stylesheet loading", function() {
          describe("when the metadata contains a 'stylesheets' manifest", function() {
            return it("loads stylesheets from the stylesheets directory as specified by the manifest", function() {
              var one, three, two;
              one = require.resolve("./fixtures/packages/package-with-stylesheets-manifest/stylesheets/1.css");
              two = require.resolve("./fixtures/packages/package-with-stylesheets-manifest/stylesheets/2.less");
              three = require.resolve("./fixtures/packages/package-with-stylesheets-manifest/stylesheets/3.css");
              one = atom.themes.stringToId(one);
              two = atom.themes.stringToId(two);
              three = atom.themes.stringToId(three);
              expect(atom.themes.stylesheetElementForId(one)).toBeNull();
              expect(atom.themes.stylesheetElementForId(two)).toBeNull();
              expect(atom.themes.stylesheetElementForId(three)).toBeNull();
              atom.packages.activatePackage("package-with-stylesheets-manifest");
              expect(atom.themes.stylesheetElementForId(one)).not.toBeNull();
              expect(atom.themes.stylesheetElementForId(two)).not.toBeNull();
              expect(atom.themes.stylesheetElementForId(three)).toBeNull();
              return expect($('#jasmine-content').css('font-size')).toBe('1px');
            });
          });
          return describe("when the metadata does not contain a 'stylesheets' manifest", function() {
            return it("loads all stylesheets from the stylesheets directory", function() {
              var one, three, two;
              one = require.resolve("./fixtures/packages/package-with-stylesheets/stylesheets/1.css");
              two = require.resolve("./fixtures/packages/package-with-stylesheets/stylesheets/2.less");
              three = require.resolve("./fixtures/packages/package-with-stylesheets/stylesheets/3.css");
              one = atom.themes.stringToId(one);
              two = atom.themes.stringToId(two);
              three = atom.themes.stringToId(three);
              expect(atom.themes.stylesheetElementForId(one)).toBeNull();
              expect(atom.themes.stylesheetElementForId(two)).toBeNull();
              expect(atom.themes.stylesheetElementForId(three)).toBeNull();
              atom.packages.activatePackage("package-with-stylesheets");
              expect(atom.themes.stylesheetElementForId(one)).not.toBeNull();
              expect(atom.themes.stylesheetElementForId(two)).not.toBeNull();
              expect(atom.themes.stylesheetElementForId(three)).not.toBeNull();
              return expect($('#jasmine-content').css('font-size')).toBe('3px');
            });
          });
        });
        describe("grammar loading", function() {
          return it("loads the package's grammars", function() {
            waitsForPromise(function() {
              return atom.packages.activatePackage('package-with-grammars');
            });
            return runs(function() {
              expect(atom.syntax.selectGrammar('a.alot').name).toBe('Alot');
              return expect(atom.syntax.selectGrammar('a.alittle').name).toBe('Alittle');
            });
          });
        });
        return describe("scoped-property loading", function() {
          return it("loads the scoped properties", function() {
            waitsForPromise(function() {
              return atom.packages.activatePackage("package-with-scoped-properties");
            });
            return runs(function() {
              return expect(atom.syntax.getProperty(['.source.omg'], 'editor.increaseIndentPattern')).toBe('^a');
            });
          });
        });
      });
      return describe("converted textmate packages", function() {
        it("loads the package's grammars", function() {
          expect(atom.syntax.selectGrammar("file.rb").name).toBe("Null Grammar");
          waitsForPromise(function() {
            return atom.packages.activatePackage('language-ruby');
          });
          return runs(function() {
            return expect(atom.syntax.selectGrammar("file.rb").name).toBe("Ruby");
          });
        });
        return it("loads the translated scoped properties", function() {
          expect(atom.syntax.getProperty(['.source.ruby'], 'editor.commentStart')).toBeUndefined();
          waitsForPromise(function() {
            return atom.packages.activatePackage('language-ruby');
          });
          return runs(function() {
            return expect(atom.syntax.getProperty(['.source.ruby'], 'editor.commentStart')).toBe('# ');
          });
        });
      });
    });
    describe("::deactivatePackage(id)", function() {
      describe("atom packages", function() {
        it("calls `deactivate` on the package's main module if activate was successful", function() {
          var badPack, pack;
          pack = null;
          waitsForPromise(function() {
            return atom.packages.activatePackage("package-with-deactivate").then(function(p) {
              return pack = p;
            });
          });
          runs(function() {
            expect(atom.packages.isPackageActive("package-with-deactivate")).toBeTruthy();
            spyOn(pack.mainModule, 'deactivate').andCallThrough();
            atom.packages.deactivatePackage("package-with-deactivate");
            expect(pack.mainModule.deactivate).toHaveBeenCalled();
            expect(atom.packages.isPackageActive("package-with-module")).toBeFalsy();
            return spyOn(console, 'warn');
          });
          badPack = null;
          waitsForPromise(function() {
            return atom.packages.activatePackage("package-that-throws-on-activate").then(function(p) {
              return badPack = p;
            });
          });
          return runs(function() {
            expect(atom.packages.isPackageActive("package-that-throws-on-activate")).toBeTruthy();
            spyOn(badPack.mainModule, 'deactivate').andCallThrough();
            atom.packages.deactivatePackage("package-that-throws-on-activate");
            expect(badPack.mainModule.deactivate).not.toHaveBeenCalled();
            return expect(atom.packages.isPackageActive("package-that-throws-on-activate")).toBeFalsy();
          });
        });
        it("does not serialize packages that have not been activated called on their main module", function() {
          var badPack;
          spyOn(console, 'warn');
          badPack = null;
          waitsForPromise(function() {
            return atom.packages.activatePackage("package-that-throws-on-activate").then(function(p) {
              return badPack = p;
            });
          });
          return runs(function() {
            spyOn(badPack.mainModule, 'serialize').andCallThrough();
            atom.packages.deactivatePackage("package-that-throws-on-activate");
            return expect(badPack.mainModule.serialize).not.toHaveBeenCalled();
          });
        });
        it("absorbs exceptions that are thrown by the package module's serialize method", function() {
          spyOn(console, 'error');
          waitsForPromise(function() {
            return atom.packages.activatePackage('package-with-serialize-error');
          });
          waitsForPromise(function() {
            return atom.packages.activatePackage('package-with-serialization');
          });
          return runs(function() {
            atom.packages.deactivatePackages();
            expect(atom.packages.packageStates['package-with-serialize-error']).toBeUndefined();
            expect(atom.packages.packageStates['package-with-serialization']).toEqual({
              someNumber: 1
            });
            return expect(console.error).toHaveBeenCalled();
          });
        });
        it("absorbs exceptions that are thrown by the package module's deactivate method", function() {
          spyOn(console, 'error');
          waitsForPromise(function() {
            return atom.packages.activatePackage("package-that-throws-on-deactivate");
          });
          return runs(function() {
            expect(function() {
              return atom.packages.deactivatePackage("package-that-throws-on-deactivate");
            }).not.toThrow();
            return expect(console.error).toHaveBeenCalled();
          });
        });
        it("removes the package's grammars", function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage('package-with-grammars');
          });
          return runs(function() {
            atom.packages.deactivatePackage('package-with-grammars');
            expect(atom.syntax.selectGrammar('a.alot').name).toBe('Null Grammar');
            return expect(atom.syntax.selectGrammar('a.alittle').name).toBe('Null Grammar');
          });
        });
        it("removes the package's keymaps", function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage('package-with-keymaps');
          });
          return runs(function() {
            atom.packages.deactivatePackage('package-with-keymaps');
            expect(atom.keymaps.findKeyBindings({
              keystrokes: 'ctrl-z',
              target: ($$(function() {
                return this.div({
                  "class": 'test-1'
                });
              }))[0]
            })).toHaveLength(0);
            return expect(atom.keymaps.findKeyBindings({
              keystrokes: 'ctrl-z',
              target: ($$(function() {
                return this.div({
                  "class": 'test-2'
                });
              }))[0]
            })).toHaveLength(0);
          });
        });
        it("removes the package's stylesheets", function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage('package-with-stylesheets');
          });
          return runs(function() {
            var one, three, two;
            atom.packages.deactivatePackage('package-with-stylesheets');
            one = require.resolve("./fixtures/packages/package-with-stylesheets-manifest/stylesheets/1.css");
            two = require.resolve("./fixtures/packages/package-with-stylesheets-manifest/stylesheets/2.less");
            three = require.resolve("./fixtures/packages/package-with-stylesheets-manifest/stylesheets/3.css");
            expect(atom.themes.stylesheetElementForId(one)).not.toExist();
            expect(atom.themes.stylesheetElementForId(two)).not.toExist();
            return expect(atom.themes.stylesheetElementForId(three)).not.toExist();
          });
        });
        return it("removes the package's scoped-properties", function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage("package-with-scoped-properties");
          });
          return runs(function() {
            expect(atom.syntax.getProperty(['.source.omg'], 'editor.increaseIndentPattern')).toBe('^a');
            atom.packages.deactivatePackage("package-with-scoped-properties");
            return expect(atom.syntax.getProperty(['.source.omg'], 'editor.increaseIndentPattern')).toBeUndefined();
          });
        });
      });
      return describe("textmate packages", function() {
        it("removes the package's grammars", function() {
          expect(atom.syntax.selectGrammar("file.rb").name).toBe("Null Grammar");
          waitsForPromise(function() {
            return atom.packages.activatePackage('language-ruby');
          });
          return runs(function() {
            expect(atom.syntax.selectGrammar("file.rb").name).toBe("Ruby");
            atom.packages.deactivatePackage('language-ruby');
            return expect(atom.syntax.selectGrammar("file.rb").name).toBe("Null Grammar");
          });
        });
        return it("removes the package's scoped properties", function() {
          waitsForPromise(function() {
            return atom.packages.activatePackage('language-ruby');
          });
          return runs(function() {
            atom.packages.deactivatePackage('language-ruby');
            return expect(atom.syntax.getProperty(['.source.ruby'], 'editor.commentStart')).toBeUndefined();
          });
        });
      });
    });
    describe("::activate()", function() {
      var packageActivator, themeActivator;
      packageActivator = null;
      themeActivator = null;
      beforeEach(function() {
        var loadedPackages;
        spyOn(console, 'warn');
        atom.packages.loadPackages();
        loadedPackages = atom.packages.getLoadedPackages();
        expect(loadedPackages.length).toBeGreaterThan(0);
        packageActivator = spyOn(atom.packages, 'activatePackages');
        return themeActivator = spyOn(atom.themes, 'activatePackages');
      });
      afterEach(function() {
        var Syntax;
        atom.packages.deactivatePackages();
        atom.packages.unloadPackages();
        Syntax = require('../src/syntax');
        return atom.syntax = window.syntax = new Syntax();
      });
      return it("activates all the packages, and none of the themes", function() {
        var pack, packages, theme, themes, _i, _j, _len, _len1, _results;
        atom.packages.activate();
        expect(packageActivator).toHaveBeenCalled();
        expect(themeActivator).toHaveBeenCalled();
        packages = packageActivator.mostRecentCall.args[0];
        for (_i = 0, _len = packages.length; _i < _len; _i++) {
          pack = packages[_i];
          expect(['atom', 'textmate']).toContain(pack.getType());
        }
        themes = themeActivator.mostRecentCall.args[0];
        _results = [];
        for (_j = 0, _len1 = themes.length; _j < _len1; _j++) {
          theme = themes[_j];
          _results.push(expect(['theme']).toContain(theme.getType()));
        }
        return _results;
      });
    });
    return describe("::enablePackage() and ::disablePackage()", function() {
      describe("with packages", function() {
        it(".enablePackage() enables a disabled package", function() {
          var activatedPackages, loadedPackages, pack, packageName;
          packageName = 'package-with-main';
          atom.config.pushAtKeyPath('core.disabledPackages', packageName);
          atom.packages.observeDisabledPackages();
          expect(atom.config.get('core.disabledPackages')).toContain(packageName);
          pack = atom.packages.enablePackage(packageName);
          loadedPackages = atom.packages.getLoadedPackages();
          activatedPackages = null;
          waitsFor(function() {
            activatedPackages = atom.packages.getActivePackages();
            return activatedPackages.length > 0;
          });
          return runs(function() {
            expect(loadedPackages).toContain(pack);
            expect(activatedPackages).toContain(pack);
            return expect(atom.config.get('core.disabledPackages')).not.toContain(packageName);
          });
        });
        return it(".disablePackage() disables an enabled package", function() {
          var packageName;
          packageName = 'package-with-main';
          waitsForPromise(function() {
            return atom.packages.activatePackage(packageName);
          });
          return runs(function() {
            var activatedPackages, pack;
            atom.packages.observeDisabledPackages();
            expect(atom.config.get('core.disabledPackages')).not.toContain(packageName);
            pack = atom.packages.disablePackage(packageName);
            activatedPackages = atom.packages.getActivePackages();
            expect(activatedPackages).not.toContain(pack);
            return expect(atom.config.get('core.disabledPackages')).toContain(packageName);
          });
        });
      });
      return describe("with themes", function() {
        var reloadedHandler;
        reloadedHandler = null;
        beforeEach(function() {
          return waitsForPromise(function() {
            return atom.themes.activateThemes();
          });
        });
        afterEach(function() {
          return atom.themes.deactivateThemes();
        });
        return it(".enablePackage() and .disablePackage() enables and disables a theme", function() {
          var pack, packageName;
          packageName = 'theme-with-package-file';
          expect(atom.config.get('core.themes')).not.toContain(packageName);
          expect(atom.config.get('core.disabledPackages')).not.toContain(packageName);
          pack = atom.packages.enablePackage(packageName);
          waitsFor(function() {
            return __indexOf.call(atom.packages.getActivePackages(), pack) >= 0;
          });
          runs(function() {
            expect(atom.config.get('core.themes')).toContain(packageName);
            expect(atom.config.get('core.disabledPackages')).not.toContain(packageName);
            reloadedHandler = jasmine.createSpy('reloadedHandler');
            reloadedHandler.reset();
            atom.themes.onDidReloadAll(reloadedHandler);
            return pack = atom.packages.disablePackage(packageName);
          });
          waitsFor(function() {
            return reloadedHandler.callCount === 1;
          });
          return runs(function() {
            expect(atom.packages.getActivePackages()).not.toContain(pack);
            expect(atom.config.get('core.themes')).not.toContain(packageName);
            expect(atom.config.get('core.themes')).not.toContain(packageName);
            return expect(atom.config.get('core.disabledPackages')).not.toContain(packageName);
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1DQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxPQUEwQixPQUFBLENBQVEsTUFBUixDQUExQixFQUFDLFNBQUEsQ0FBRCxFQUFJLFVBQUEsRUFBSixFQUFRLHFCQUFBLGFBQVIsQ0FBQTs7QUFBQSxFQUNBLE9BQUEsR0FBVSxPQUFBLENBQVEsZ0JBQVIsQ0FEVixDQUFBOztBQUFBLEVBR0EsUUFBQSxDQUFTLGdCQUFULEVBQTJCLFNBQUEsR0FBQTtBQUN6QixJQUFBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7YUFDVCxJQUFJLENBQUMsYUFBTCxHQUFxQixHQUFBLENBQUEsY0FEWjtJQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsSUFHQSxRQUFBLENBQVMscUJBQVQsRUFBZ0MsU0FBQSxHQUFBO0FBQzlCLE1BQUEsRUFBQSxDQUFHLHNEQUFILEVBQTJELFNBQUEsR0FBQTtBQUN6RCxRQUFBLEtBQUEsQ0FBTSxPQUFOLEVBQWUsTUFBZixDQUFBLENBQUE7QUFBQSxRQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQix1QkFBaEIsRUFBeUMsRUFBekMsQ0FEQSxDQUFBO2VBRUEsTUFBQSxDQUFPLFNBQUEsR0FBQTtpQkFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQWQsQ0FBMEIsa0NBQTFCLEVBQUg7UUFBQSxDQUFQLENBQXdFLENBQUMsR0FBRyxDQUFDLE9BQTdFLENBQUEsRUFIeUQ7TUFBQSxDQUEzRCxDQUFBLENBQUE7YUFLQSxFQUFBLENBQUcsZ0RBQUgsRUFBcUQsU0FBQSxHQUFBO0FBQ25ELFFBQUEsS0FBQSxDQUFNLE9BQU4sRUFBZSxNQUFmLENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixFQUF5QyxFQUF6QyxD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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/package-manager-spec.coffee