(function() {
  var $, $$, Package, ThemeManager, WorkspaceView, fs, path, temp, _ref;

  path = require('path');

  _ref = require('atom'), $ = _ref.$, $$ = _ref.$$, WorkspaceView = _ref.WorkspaceView;

  fs = require('fs-plus');

  temp = require('temp');

  ThemeManager = require('../src/theme-manager');

  Package = require('../src/package');

  describe("ThemeManager", function() {
    var configDirPath, resourcePath, themeManager;
    themeManager = null;
    resourcePath = atom.getLoadSettings().resourcePath;
    configDirPath = atom.getConfigDirPath();
    beforeEach(function() {
      return themeManager = new ThemeManager({
        packageManager: atom.packages,
        resourcePath: resourcePath,
        configDirPath: configDirPath
      });
    });
    afterEach(function() {
      return themeManager.deactivateThemes();
    });
    describe("theme getters and setters", function() {
      beforeEach(function() {
        return atom.packages.loadPackages();
      });
      it('getLoadedThemes get all the loaded themes', function() {
        var themes;
        themes = themeManager.getLoadedThemes();
        return expect(themes.length).toBeGreaterThan(2);
      });
      return it('getActiveThemes get all the active themes', function() {
        waitsForPromise(function() {
          return themeManager.activateThemes();
        });
        return runs(function() {
          var names, themes;
          names = atom.config.get('core.themes');
          expect(names.length).toBeGreaterThan(0);
          themes = themeManager.getActiveThemes();
          return expect(themes).toHaveLength(names.length);
        });
      });
    });
    describe("when the core.themes config value contains invalid entry", function() {
      return it("ignores theme", function() {
        atom.config.set('core.themes', ['atom-light-ui', null, void 0, '', false, 4, {}, [], 'atom-dark-ui']);
        return expect(themeManager.getEnabledThemeNames()).toEqual(['atom-dark-ui', 'atom-light-ui']);
      });
    });
    describe("getImportPaths()", function() {
      it("returns the theme directories before the themes are loaded", function() {
        var paths;
        atom.config.set('core.themes', ['theme-with-index-less', 'atom-dark-ui', 'atom-light-ui']);
        paths = themeManager.getImportPaths();
        expect(paths.length).toBe(2);
        expect(paths[0]).toContain('atom-light-ui');
        return expect(paths[1]).toContain('atom-dark-ui');
      });
      return it("ignores themes that cannot be resolved to a directory", function() {
        atom.config.set('core.themes', ['definitely-not-a-theme']);
        return expect(function() {
          return themeManager.getImportPaths();
        }).not.toThrow();
      });
    });
    describe("when the core.themes config value changes", function() {
      return it("add/removes stylesheets to reflect the new config value", function() {
        var reloadHandler;
        themeManager.on('reloaded', reloadHandler = jasmine.createSpy());
        spyOn(themeManager, 'getUserStylesheetPath').andCallFake(function() {
          return null;
        });
        waitsForPromise(function() {
          return themeManager.activateThemes();
        });
        runs(function() {
          reloadHandler.reset();
          return atom.config.set('core.themes', []);
        });
        waitsFor(function() {
          return reloadHandler.callCount === 1;
        });
        runs(function() {
          reloadHandler.reset();
          expect($('style.theme')).toHaveLength(0);
          return atom.config.set('core.themes', ['atom-dark-syntax']);
        });
        waitsFor(function() {
          return reloadHandler.callCount === 1;
        });
        runs(function() {
          reloadHandler.reset();
          expect($('style.theme')).toHaveLength(1);
          expect($('style.theme:eq(0)').attr('id')).toMatch(/atom-dark-syntax/);
          return atom.config.set('core.themes', ['atom-light-syntax', 'atom-dark-syntax']);
        });
        waitsFor(function() {
          return reloadHandler.callCount === 1;
        });
        runs(function() {
          reloadHandler.reset();
          expect($('style.theme')).toHaveLength(2);
          expect($('style.theme:eq(0)').attr('id')).toMatch(/atom-dark-syntax/);
          expect($('style.theme:eq(1)').attr('id')).toMatch(/atom-light-syntax/);
          return atom.config.set('core.themes', []);
        });
        waitsFor(function() {
          return reloadHandler.callCount === 1;
        });
        runs(function() {
          reloadHandler.reset();
          expect($('style.theme')).toHaveLength(0);
          return atom.config.set('core.themes', ['theme-with-index-less', 'atom-dark-ui']);
        });
        waitsFor(function() {
          return reloadHandler.callCount === 1;
        });
        return runs(function() {
          var importPaths;
          expect($('style.theme')).toHaveLength(2);
          importPaths = themeManager.getImportPaths();
          expect(importPaths.length).toBe(1);
          return expect(importPaths[0]).toContain('atom-dark-ui');
        });
      });
    });
    describe("when a theme fails to load", function() {
      return it("logs a warning", function() {
        spyOn(console, 'warn');
        return expect(function() {
          return atom.packages.activatePackage('a-theme-that-will-not-be-found');
        }).toThrow();
      });
    });
    describe("requireStylesheet(path)", function() {
      it("synchronously loads css at the given path and installs a style tag for it in the head", function() {
        var cssPath, element, lengthBefore, stylesheetAddedHandler, stylesheetsChangedHandler;
        themeManager.on('stylesheets-changed', stylesheetsChangedHandler = jasmine.createSpy("stylesheetsChangedHandler"));
        themeManager.on('stylesheet-added', stylesheetAddedHandler = jasmine.createSpy("stylesheetAddedHandler"));
        cssPath = atom.project.resolve('css.css');
        lengthBefore = $('head style').length;
        themeManager.requireStylesheet(cssPath);
        expect($('head style').length).toBe(lengthBefore + 1);
        expect(stylesheetAddedHandler).toHaveBeenCalled();
        expect(stylesheetsChangedHandler).toHaveBeenCalled();
        element = $('head style[id*="css.css"]');
        expect(element.attr('id')).toBe(themeManager.stringToId(cssPath));
        expect(element.text()).toBe(fs.readFileSync(cssPath, 'utf8'));
        expect(element[0].sheet).toBe(stylesheetAddedHandler.argsForCall[0][0]);
        themeManager.requireStylesheet(cssPath);
        expect($('head style').length).toBe(lengthBefore + 1);
        return $('head style[id*="css.css"]').remove();
      });
      it("synchronously loads and parses less files at the given path and installs a style tag for it in the head", function() {
        var element, lengthBefore, lessPath;
        lessPath = atom.project.resolve('sample.less');
        lengthBefore = $('head style').length;
        themeManager.requireStylesheet(lessPath);
        expect($('head style').length).toBe(lengthBefore + 1);
        element = $('head style[id*="sample.less"]');
        expect(element.attr('id')).toBe(themeManager.stringToId(lessPath));
        expect(element.text()).toBe("#header {\n  color: #4d926f;\n}\nh2 {\n  color: #4d926f;\n}\n");
        themeManager.requireStylesheet(lessPath);
        expect($('head style').length).toBe(lengthBefore + 1);
        return $('head style[id*="sample.less"]').remove();
      });
      return it("supports requiring css and less stylesheets without an explicit extension", function() {
        themeManager.requireStylesheet(path.join(__dirname, 'fixtures', 'css'));
        expect($('head style[id*="css.css"]').attr('id')).toBe(themeManager.stringToId(atom.project.resolve('css.css')));
        themeManager.requireStylesheet(path.join(__dirname, 'fixtures', 'sample'));
        expect($('head style[id*="sample.less"]').attr('id')).toBe(themeManager.stringToId(atom.project.resolve('sample.less')));
        $('head style[id*="css.css"]').remove();
        return $('head style[id*="sample.less"]').remove();
      });
    });
    describe(".removeStylesheet(path)", function() {
      return it("removes styling applied by given stylesheet path", function() {
        var cssPath, stylesheet, stylesheetRemovedHandler, stylesheetsChangedHandler;
        cssPath = require.resolve('./fixtures/css.css');
        expect($(document.body).css('font-weight')).not.toBe("bold");
        themeManager.requireStylesheet(cssPath);
        expect($(document.body).css('font-weight')).toBe("bold");
        themeManager.on('stylesheet-removed', stylesheetRemovedHandler = jasmine.createSpy("stylesheetRemovedHandler"));
        themeManager.on('stylesheets-changed', stylesheetsChangedHandler = jasmine.createSpy("stylesheetsChangedHandler"));
        themeManager.removeStylesheet(cssPath);
        expect($(document.body).css('font-weight')).not.toBe("bold");
        expect(stylesheetRemovedHandler).toHaveBeenCalled();
        stylesheet = stylesheetRemovedHandler.argsForCall[0][0];
        expect(stylesheet instanceof CSSStyleSheet).toBe(true);
        expect(stylesheet.cssRules[0].selectorText).toBe('body');
        return expect(stylesheetsChangedHandler).toHaveBeenCalled();
      });
    });
    describe("base stylesheet loading", function() {
      beforeEach(function() {
        atom.workspaceView = new WorkspaceView;
        atom.workspaceView.append($$(function() {
          return this.div({
            "class": 'editor'
          });
        }));
        atom.workspaceView.attachToDom();
        return waitsForPromise(function() {
          return themeManager.activateThemes();
        });
      });
      it("loads the correct values from the theme's ui-variables file", function() {
        var reloadHandler;
        themeManager.on('reloaded', reloadHandler = jasmine.createSpy());
        atom.config.set('core.themes', ['theme-with-ui-variables']);
        waitsFor(function() {
          return reloadHandler.callCount > 0;
        });
        return runs(function() {
          expect(atom.workspaceView.css("background-color")).toBe("rgb(0, 0, 255)");
          expect($(".editor").css("padding-top")).toBe("150px");
          expect($(".editor").css("padding-right")).toBe("150px");
          return expect($(".editor").css("padding-bottom")).toBe("150px");
        });
      });
      return describe("when there is a theme with incomplete variables", function() {
        return it("loads the correct values from the fallback ui-variables", function() {
          var reloadHandler;
          themeManager.on('reloaded', reloadHandler = jasmine.createSpy());
          atom.config.set('core.themes', ['theme-with-incomplete-ui-variables']);
          waitsFor(function() {
            return reloadHandler.callCount > 0;
          });
          return runs(function() {
            expect(atom.workspaceView.css("background-color")).toBe("rgb(0, 0, 255)");
            return expect($(".editor").css("background-color")).toBe("rgb(0, 152, 255)");
          });
        });
      });
    });
    describe("when the user stylesheet changes", function() {
      return it("reloads it", function() {
        var stylesheetAddedHandler, stylesheetRemovedHandler, stylesheetsChangedHandler, userStylesheetPath, _ref1;
        _ref1 = [], stylesheetRemovedHandler = _ref1[0], stylesheetAddedHandler = _ref1[1], stylesheetsChangedHandler = _ref1[2];
        userStylesheetPath = path.join(temp.mkdirSync("atom"), 'styles.less');
        fs.writeFileSync(userStylesheetPath, 'body {border-style: dotted !important;}');
        spyOn(themeManager, 'getUserStylesheetPath').andReturn(userStylesheetPath);
        waitsForPromise(function() {
          return themeManager.activateThemes();
        });
        runs(function() {
          themeManager.on('stylesheets-changed', stylesheetsChangedHandler = jasmine.createSpy("stylesheetsChangedHandler"));
          themeManager.on('stylesheet-removed', stylesheetRemovedHandler = jasmine.createSpy("stylesheetRemovedHandler"));
          themeManager.on('stylesheet-added', stylesheetAddedHandler = jasmine.createSpy("stylesheetAddedHandler"));
          spyOn(themeManager, 'loadUserStylesheet').andCallThrough();
          expect($(document.body).css('border-style')).toBe('dotted');
          return fs.writeFileSync(userStylesheetPath, 'body {border-style: dashed}');
        });
        waitsFor(function() {
          return themeManager.loadUserStylesheet.callCount === 1;
        });
        runs(function() {
          expect($(document.body).css('border-style')).toBe('dashed');
          expect(stylesheetRemovedHandler).toHaveBeenCalled();
          expect(stylesheetRemovedHandler.argsForCall[0][0].cssRules[0].style.border).toBe('dotted');
          expect(stylesheetAddedHandler).toHaveBeenCalled();
          expect(stylesheetAddedHandler.argsForCall[0][0].cssRules[0].style.border).toBe('dashed');
          expect(stylesheetsChangedHandler).toHaveBeenCalled();
          stylesheetRemovedHandler.reset();
          stylesheetsChangedHandler.reset();
          return fs.removeSync(userStylesheetPath);
        });
        waitsFor(function() {
          return themeManager.loadUserStylesheet.callCount === 2;
        });
        return runs(function() {
          expect(stylesheetRemovedHandler).toHaveBeenCalled();
          expect(stylesheetRemovedHandler.argsForCall[0][0].cssRules[0].style.border).toBe('dashed');
          expect($(document.body).css('border-style')).toBe('none');
          return expect(stylesheetsChangedHandler).toHaveBeenCalled();
        });
      });
    });
    return describe("when a non-existent theme is present in the config", function() {
      return it("logs a warning but does not throw an exception (regression)", function() {
        var reloaded;
        reloaded = false;
        waitsForPromise(function() {
          return themeManager.activateThemes();
        });
        runs(function() {
          themeManager.once('reloaded', function() {
            return reloaded = true;
          });
          spyOn(console, 'warn');
          return expect(function() {
            return atom.config.set('core.themes', ['atom-light-ui', 'theme-really-does-not-exist']);
          }).not.toThrow();
        });
        waitsFor(function() {
          return reloaded;
        });
        return runs(function() {
          expect(console.warn.callCount).toBe(1);
          return expect(console.warn.argsForCall[0][0].length).toBeGreaterThan(0);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlFQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUVBLE9BQXlCLE9BQUEsQ0FBUSxNQUFSLENBQXpCLEVBQUMsU0FBQSxDQUFELEVBQUksVUFBQSxFQUFKLEVBQVEscUJBQUEsYUFGUixDQUFBOztBQUFBLEVBR0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBSEwsQ0FBQTs7QUFBQSxFQUlBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUpQLENBQUE7O0FBQUEsRUFNQSxZQUFBLEdBQWUsT0FBQSxDQUFRLHNCQUFSLENBTmYsQ0FBQTs7QUFBQSxFQU9BLE9BQUEsR0FBVSxPQUFBLENBQVEsZ0JBQVIsQ0FQVixDQUFBOztBQUFBLEVBU0EsUUFBQSxDQUFTLGNBQVQsRUFBeUIsU0FBQSxHQUFBO0FBQ3ZCLFFBQUEseUNBQUE7QUFBQSxJQUFBLFlBQUEsR0FBZSxJQUFmLENBQUE7QUFBQSxJQUNBLFlBQUEsR0FBZSxJQUFJLENBQUMsZUFBTCxDQUFBLENBQXNCLENBQUMsWUFEdEMsQ0FBQTtBQUFBLElBRUEsYUFBQSxHQUFnQixJQUFJLENBQUMsZ0JBQUwsQ0FBQSxDQUZoQixDQUFBO0FBQUEsSUFJQSxVQUFBLENBQVcsU0FBQSxHQUFBO2FBQ1QsWUFBQSxHQUFtQixJQUFBLFlBQUEsQ0FBYTtBQUFBLFFBQUMsY0FBQSxFQUFnQixJQUFJLENBQUMsUUFBdEI7QUFBQSxRQUFnQyxjQUFBLFlBQWhDO0FBQUEsUUFBOEMsZUFBQSxhQUE5QztPQUFiLEVBRFY7SUFBQSxDQUFYLENBSkEsQ0FBQTtBQUFBLElBT0EsU0FBQSxDQUFVLFNBQUEsR0FBQTthQUNSLFlBQVksQ0FBQyxnQkFBYixDQUFBLEVBRFE7SUFBQSxDQUFWLENB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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/theme-manager-spec.coffee