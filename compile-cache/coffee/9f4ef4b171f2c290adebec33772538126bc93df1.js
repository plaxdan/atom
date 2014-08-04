(function() {
  var $, $$, Exec, Package, ThemeManager, WorkspaceView, path, _ref,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ref = require('atom'), $ = _ref.$, $$ = _ref.$$, WorkspaceView = _ref.WorkspaceView;

  Exec = require('child_process').exec;

  path = require('path');

  Package = require('../src/package');

  ThemeManager = require('../src/theme-manager');

  describe("the `atom` global", function() {
    beforeEach(function() {
      return atom.workspaceView = new WorkspaceView;
    });
    describe("package lifecycle methods", function() {
      describe(".loadPackage(name)", function() {
        it("continues if the package has an invalid package.json", function() {
          spyOn(console, 'warn');
          atom.config.set("core.disabledPackages", []);
          return expect(function() {
            return atom.packages.loadPackage("package-with-broken-package-json");
          }).not.toThrow();
        });
        return it("continues if the package has an invalid keymap", function() {
          atom.config.set("core.disabledPackages", []);
          return expect(function() {
            return atom.packages.loadPackage("package-with-broken-keymap");
          }).not.toThrow();
        });
      });
      describe(".unloadPackage(name)", function() {
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
      describe(".activatePackage(id)", function() {
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
            return describe("when the package metadata includes activation events", function() {
              var mainModule, promise, _ref1;
              _ref1 = [], mainModule = _ref1[0], promise = _ref1[1];
              beforeEach(function() {
                mainModule = require('./fixtures/packages/package-with-activation-events/index');
                spyOn(mainModule, 'activate').andCallThrough();
                spyOn(Package.prototype, 'requireMainModule').andCallThrough();
                return promise = atom.packages.activatePackage('package-with-activation-events');
              });
              it("defers requiring/activating the main module until an activation event bubbles to the root view", function() {
                expect(promise.isFulfilled()).not.toBeTruthy();
                atom.workspaceView.trigger('activation-event');
                return waitsForPromise(function() {
                  return promise;
                });
              });
              it("triggers the activation event on all handlers registered during activation", function() {
                waitsForPromise(function() {
                  return atom.workspaceView.open();
                });
                return runs(function() {
                  var editorView, eventHandler;
                  editorView = atom.workspaceView.getActiveView();
                  eventHandler = jasmine.createSpy("activation-event");
                  editorView.command('activation-event', eventHandler);
                  editorView.trigger('activation-event');
                  expect(mainModule.activate.callCount).toBe(1);
                  expect(mainModule.activationEventCallCount).toBe(1);
                  expect(eventHandler.callCount).toBe(1);
                  editorView.trigger('activation-event');
                  expect(mainModule.activationEventCallCount).toBe(2);
                  expect(eventHandler.callCount).toBe(2);
                  return expect(mainModule.activate.callCount).toBe(1);
                });
              });
              return it("activates the package immediately when the events are empty", function() {
                mainModule = require('./fixtures/packages/package-with-empty-activation-events/index');
                spyOn(mainModule, 'activate').andCallThrough();
                waitsForPromise(function() {
                  return atom.packages.activatePackage('package-with-empty-activation-events');
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
                expect(atom.themes.stylesheetElementForId(one)).not.toExist();
                expect(atom.themes.stylesheetElementForId(two)).not.toExist();
                expect(atom.themes.stylesheetElementForId(three)).not.toExist();
                atom.packages.activatePackage("package-with-stylesheets-manifest");
                expect(atom.themes.stylesheetElementForId(one)).toExist();
                expect(atom.themes.stylesheetElementForId(two)).toExist();
                expect(atom.themes.stylesheetElementForId(three)).not.toExist();
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
                expect(atom.themes.stylesheetElementForId(one)).not.toExist();
                expect(atom.themes.stylesheetElementForId(two)).not.toExist();
                expect(atom.themes.stylesheetElementForId(three)).not.toExist();
                atom.packages.activatePackage("package-with-stylesheets");
                expect(atom.themes.stylesheetElementForId(one)).toExist();
                expect(atom.themes.stylesheetElementForId(two)).toExist();
                expect(atom.themes.stylesheetElementForId(three)).toExist();
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
      describe(".deactivatePackage(id)", function() {
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
          it("absorbs exceptions that are thrown by the package module's serialize methods", function() {
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
      describe(".activate()", function() {
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
      return describe(".enablePackage() and disablePackage()", function() {
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
          beforeEach(function() {
            return waitsForPromise(function() {
              return atom.themes.activateThemes();
            });
          });
          afterEach(function() {
            atom.themes.deactivateThemes();
            return atom.config.unobserve('core.themes');
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
              return pack = atom.packages.disablePackage(packageName);
            });
            waitsFor(function() {
              return !(__indexOf.call(atom.packages.getActivePackages(), pack) >= 0);
            });
            return runs(function() {
              expect(atom.config.get('core.themes')).not.toContain(packageName);
              expect(atom.config.get('core.themes')).not.toContain(packageName);
              return expect(atom.config.get('core.disabledPackages')).not.toContain(packageName);
            });
          });
        });
      });
    });
    describe(".isReleasedVersion()", function() {
      return it("returns false if the version is a SHA and true otherwise", function() {
        var version;
        version = '0.1.0';
        spyOn(atom, 'getVersion').andCallFake(function() {
          return version;
        });
        expect(atom.isReleasedVersion()).toBe(true);
        version = '36b5518';
        return expect(atom.isReleasedVersion()).toBe(false);
      });
    });
    return describe("window:update-available", function() {
      return it("is triggered when the auto-updater sends the update-downloaded event", function() {
        var autoUpdater, updateAvailableHandler;
        updateAvailableHandler = jasmine.createSpy("update-available-handler");
        atom.workspaceView.on('window:update-available', updateAvailableHandler);
        autoUpdater = require('remote').require('auto-updater');
        autoUpdater.emit('update-downloaded', null, "notes", "version");
        waitsFor(function() {
          return updateAvailableHandler.callCount > 0;
        });
        return runs(function() {
          var event, notes, version, _ref1;
          _ref1 = updateAvailableHandler.mostRecentCall.args, event = _ref1[0], version = _ref1[1], notes = _ref1[2];
          expect(notes).toBe('notes');
          return expect(version).toBe('version');
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZEQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxPQUEwQixPQUFBLENBQVEsTUFBUixDQUExQixFQUFDLFNBQUEsQ0FBRCxFQUFJLFVBQUEsRUFBSixFQUFRLHFCQUFBLGFBQVIsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsZUFBUixDQUF3QixDQUFDLElBRGhDLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsT0FBQSxHQUFVLE9BQUEsQ0FBUSxnQkFBUixDQUhWLENBQUE7O0FBQUEsRUFJQSxZQUFBLEdBQWUsT0FBQSxDQUFRLHNCQUFSLENBSmYsQ0FBQTs7QUFBQSxFQU1BLFFBQUEsQ0FBUyxtQkFBVCxFQUE4QixTQUFBLEdBQUE7QUFDNUIsSUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsSUFBSSxDQUFDLGFBQUwsR0FBcUIsR0FBQSxDQUFBLGNBRFo7SUFBQSxDQUFYLENBQUEsQ0FBQTtBQUFBLElBR0EsUUFBQSxDQUFTLDJCQUFULEVBQXNDLFNBQUEsR0FBQTtBQUNwQyxNQUFBLFFBQUEsQ0FBUyxvQkFBVCxFQUErQixTQUFBLEdBQUE7QUFDN0IsUUFBQSxFQUFBLENBQUcsc0RBQUgsRUFBMkQsU0FBQSxHQUFBO0FBQ3pELFVBQUEsS0FBQSxDQUFNLE9BQU4sRUFBZSxNQUFmLENBQUEsQ0FBQTtBQUFBLFVBQ0EsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHVCQUFoQixFQUF5QyxFQUF6QyxDQURBLENBQUE7aUJBRUEsTUFBQSxDQUFPLFNBQUEsR0FBQTttQkFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQWQsQ0FBMEIsa0NBQTFCLEVBQUg7VUFBQSxDQUFQLENBQXdFLENB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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/atom-spec.coffee