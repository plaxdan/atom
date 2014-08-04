(function() {
  var CSON, fs, path, temp;

  path = require('path');

  temp = require('temp');

  CSON = require('season');

  fs = require('fs-plus');

  describe("Config", function() {
    var dotAtomPath;
    dotAtomPath = path.join(temp.dir, 'dot-atom-dir');
    dotAtomPath = null;
    beforeEach(function() {
      return dotAtomPath = temp.path('dot-atom-dir');
    });
    describe(".get(keyPath)", function() {
      it("allows a key path's value to be read", function() {
        expect(atom.config.set("foo.bar.baz", 42)).toBe(42);
        expect(atom.config.get("foo.bar.baz")).toBe(42);
        return expect(atom.config.get("bogus.key.path")).toBeUndefined();
      });
      return it("returns a deep clone of the key path's value", function() {
        var retrievedValue;
        atom.config.set('value', {
          array: [
            1, {
              b: 2
            }, 3
          ]
        });
        retrievedValue = atom.config.get('value');
        retrievedValue.array[0] = 4;
        retrievedValue.array[1].b = 2.1;
        return expect(atom.config.get('value')).toEqual({
          array: [
            1, {
              b: 2
            }, 3
          ]
        });
      });
    });
    describe(".set(keyPath, value)", function() {
      it("allows a key path's value to be written", function() {
        expect(atom.config.set("foo.bar.baz", 42)).toBe(42);
        return expect(atom.config.get("foo.bar.baz")).toBe(42);
      });
      it("updates observers and saves when a key path is set", function() {
        var observeHandler;
        observeHandler = jasmine.createSpy("observeHandler");
        atom.config.observe("foo.bar.baz", observeHandler);
        observeHandler.reset();
        atom.config.set("foo.bar.baz", 42);
        expect(atom.config.save).toHaveBeenCalled();
        return expect(observeHandler).toHaveBeenCalledWith(42, {
          previous: void 0
        });
      });
      return describe("when the value equals the default value", function() {
        return it("does not store the value", function() {
          atom.config.setDefaults("foo", {
            same: 1,
            changes: 1,
            sameArray: [1, 2, 3],
            sameObject: {
              a: 1,
              b: 2
            },
            "null": null,
            undefined: void 0
          });
          expect(atom.config.settings.foo).toBeUndefined();
          atom.config.set('foo.same', 1);
          atom.config.set('foo.changes', 2);
          atom.config.set('foo.sameArray', [1, 2, 3]);
          atom.config.set('foo.null', void 0);
          atom.config.set('foo.undefined', null);
          atom.config.set('foo.sameObject', {
            b: 2,
            a: 1
          });
          expect(atom.config.settings.foo).toEqual({
            changes: 2
          });
          atom.config.set('foo.changes', 1);
          return expect(atom.config.settings.foo).toEqual({});
        });
      });
    });
    describe(".getDefault(keyPath)", function() {
      return it("returns a clone of the default value", function() {
        var initialDefaultValue;
        atom.config.setDefaults("foo", {
          same: 1,
          changes: 1
        });
        expect(atom.config.getDefault('foo.same')).toBe(1);
        expect(atom.config.getDefault('foo.changes')).toBe(1);
        atom.config.set('foo.same', 2);
        atom.config.set('foo.changes', 3);
        expect(atom.config.getDefault('foo.same')).toBe(1);
        expect(atom.config.getDefault('foo.changes')).toBe(1);
        initialDefaultValue = [1, 2, 3];
        atom.config.setDefaults("foo", {
          bar: initialDefaultValue
        });
        expect(atom.config.getDefault('foo.bar')).toEqual(initialDefaultValue);
        return expect(atom.config.getDefault('foo.bar')).not.toBe(initialDefaultValue);
      });
    });
    describe(".isDefault(keyPath)", function() {
      return it("returns true when the value of the key path is its default value", function() {
        atom.config.setDefaults("foo", {
          same: 1,
          changes: 1
        });
        expect(atom.config.isDefault('foo.same')).toBe(true);
        expect(atom.config.isDefault('foo.changes')).toBe(true);
        atom.config.set('foo.same', 2);
        atom.config.set('foo.changes', 3);
        expect(atom.config.isDefault('foo.same')).toBe(false);
        return expect(atom.config.isDefault('foo.changes')).toBe(false);
      });
    });
    describe(".toggle(keyPath)", function() {
      return it("negates the boolean value of the current key path value", function() {
        atom.config.set('foo.a', 1);
        atom.config.toggle('foo.a');
        expect(atom.config.get('foo.a')).toBe(false);
        atom.config.set('foo.a', '');
        atom.config.toggle('foo.a');
        expect(atom.config.get('foo.a')).toBe(true);
        atom.config.set('foo.a', null);
        atom.config.toggle('foo.a');
        expect(atom.config.get('foo.a')).toBe(true);
        atom.config.set('foo.a', true);
        atom.config.toggle('foo.a');
        return expect(atom.config.get('foo.a')).toBe(false);
      });
    });
    describe(".restoreDefault(keyPath)", function() {
      return it("sets the value of the key path to its default", function() {
        atom.config.setDefaults('a', {
          b: 3
        });
        atom.config.set('a.b', 4);
        expect(atom.config.get('a.b')).toBe(4);
        atom.config.restoreDefault('a.b');
        expect(atom.config.get('a.b')).toBe(3);
        atom.config.set('a.c', 5);
        expect(atom.config.get('a.c')).toBe(5);
        atom.config.restoreDefault('a.c');
        return expect(atom.config.get('a.c')).toBeUndefined();
      });
    });
    describe(".pushAtKeyPath(keyPath, value)", function() {
      return it("pushes the given value to the array at the key path and updates observers", function() {
        var observeHandler;
        atom.config.set("foo.bar.baz", ["a"]);
        observeHandler = jasmine.createSpy("observeHandler");
        atom.config.observe("foo.bar.baz", observeHandler);
        observeHandler.reset();
        expect(atom.config.pushAtKeyPath("foo.bar.baz", "b")).toBe(2);
        expect(atom.config.get("foo.bar.baz")).toEqual(["a", "b"]);
        return expect(observeHandler).toHaveBeenCalledWith(atom.config.get("foo.bar.baz"), {
          previous: ['a']
        });
      });
    });
    describe(".unshiftAtKeyPath(keyPath, value)", function() {
      return it("unshifts the given value to the array at the key path and updates observers", function() {
        var observeHandler;
        atom.config.set("foo.bar.baz", ["b"]);
        observeHandler = jasmine.createSpy("observeHandler");
        atom.config.observe("foo.bar.baz", observeHandler);
        observeHandler.reset();
        expect(atom.config.unshiftAtKeyPath("foo.bar.baz", "a")).toBe(2);
        expect(atom.config.get("foo.bar.baz")).toEqual(["a", "b"]);
        return expect(observeHandler).toHaveBeenCalledWith(atom.config.get("foo.bar.baz"), {
          previous: ['b']
        });
      });
    });
    describe(".removeAtKeyPath(keyPath, value)", function() {
      return it("removes the given value from the array at the key path and updates observers", function() {
        var observeHandler;
        atom.config.set("foo.bar.baz", ["a", "b", "c"]);
        observeHandler = jasmine.createSpy("observeHandler");
        atom.config.observe("foo.bar.baz", observeHandler);
        observeHandler.reset();
        expect(atom.config.removeAtKeyPath("foo.bar.baz", "b")).toEqual(["a", "c"]);
        expect(atom.config.get("foo.bar.baz")).toEqual(["a", "c"]);
        return expect(observeHandler).toHaveBeenCalledWith(atom.config.get("foo.bar.baz"), {
          previous: ['a', 'b', 'c']
        });
      });
    });
    describe(".getPositiveInt(keyPath, defaultValue)", function() {
      return it("returns the proper current or default value", function() {
        atom.config.set('editor.preferredLineLength', 0);
        expect(atom.config.getPositiveInt('editor.preferredLineLength', 80)).toBe(80);
        atom.config.set('editor.preferredLineLength', -1234);
        expect(atom.config.getPositiveInt('editor.preferredLineLength', 80)).toBe(80);
        atom.config.set('editor.preferredLineLength', 'abcd');
        expect(atom.config.getPositiveInt('editor.preferredLineLength', 80)).toBe(80);
        atom.config.set('editor.preferredLineLength', null);
        return expect(atom.config.getPositiveInt('editor.preferredLineLength', 80)).toBe(80);
      });
    });
    describe(".save()", function() {
      CSON = require('season');
      beforeEach(function() {
        spyOn(CSON, 'writeFileSync');
        return jasmine.unspy(atom.config, 'save');
      });
      describe("when ~/.atom/config.json exists", function() {
        return it("writes any non-default properties to ~/.atom/config.json", function() {
          var writtenConfig;
          atom.config.configFilePath = path.join(atom.config.configDirPath, "atom.config.json");
          atom.config.set("a.b.c", 1);
          atom.config.set("a.b.d", 2);
          atom.config.set("x.y.z", 3);
          atom.config.setDefaults("a.b", {
            e: 4,
            f: 5
          });
          CSON.writeFileSync.reset();
          atom.config.save();
          expect(CSON.writeFileSync.argsForCall[0][0]).toBe(path.join(atom.config.configDirPath, "atom.config.json"));
          writtenConfig = CSON.writeFileSync.argsForCall[0][1];
          return expect(writtenConfig).toBe(atom.config.settings);
        });
      });
      return describe("when ~/.atom/config.json doesn't exist", function() {
        return it("writes any non-default properties to ~/.atom/config.cson", function() {
          var CoffeeScript, writtenConfig;
          atom.config.configFilePath = path.join(atom.config.configDirPath, "atom.config.cson");
          atom.config.set("a.b.c", 1);
          atom.config.set("a.b.d", 2);
          atom.config.set("x.y.z", 3);
          atom.config.setDefaults("a.b", {
            e: 4,
            f: 5
          });
          CSON.writeFileSync.reset();
          atom.config.save();
          expect(CSON.writeFileSync.argsForCall[0][0]).toBe(path.join(atom.config.configDirPath, "atom.config.cson"));
          CoffeeScript = require('coffee-script');
          writtenConfig = CSON.writeFileSync.argsForCall[0][1];
          return expect(writtenConfig).toEqual(atom.config.settings);
        });
      });
    });
    describe(".setDefaults(keyPath, defaults)", function() {
      it("assigns any previously-unassigned keys to the object at the key path", function() {
        atom.config.set("foo.bar.baz", {
          a: 1
        });
        atom.config.setDefaults("foo.bar.baz", {
          a: 2,
          b: 3,
          c: 4
        });
        expect(atom.config.get("foo.bar.baz.a")).toBe(1);
        expect(atom.config.get("foo.bar.baz.b")).toBe(3);
        expect(atom.config.get("foo.bar.baz.c")).toBe(4);
        atom.config.setDefaults("foo.quux", {
          x: 0,
          y: 1
        });
        expect(atom.config.get("foo.quux.x")).toBe(0);
        return expect(atom.config.get("foo.quux.y")).toBe(1);
      });
      return it("emits an updated event", function() {
        var updatedCallback;
        updatedCallback = jasmine.createSpy('updated');
        atom.config.observe('foo.bar.baz.a', {
          callNow: false
        }, updatedCallback);
        expect(updatedCallback.callCount).toBe(0);
        atom.config.setDefaults("foo.bar.baz", {
          a: 2
        });
        return expect(updatedCallback.callCount).toBe(1);
      });
    });
    describe(".observe(keyPath)", function() {
      var observeHandler, observeSubscription, _ref;
      _ref = [], observeHandler = _ref[0], observeSubscription = _ref[1];
      beforeEach(function() {
        observeHandler = jasmine.createSpy("observeHandler");
        atom.config.set("foo.bar.baz", "value 1");
        return observeSubscription = atom.config.observe("foo.bar.baz", observeHandler);
      });
      it("fires the given callback with the current value at the keypath", function() {
        return expect(observeHandler).toHaveBeenCalledWith("value 1");
      });
      it("fires the callback every time the observed value changes", function() {
        observeHandler.reset();
        atom.config.set('foo.bar.baz', "value 2");
        expect(observeHandler).toHaveBeenCalledWith("value 2", {
          previous: 'value 1'
        });
        observeHandler.reset();
        atom.config.set('foo.bar.baz', "value 1");
        return expect(observeHandler).toHaveBeenCalledWith("value 1", {
          previous: 'value 2'
        });
      });
      it("fires the callback when the observed value is deleted", function() {
        observeHandler.reset();
        atom.config.set('foo.bar.baz', void 0);
        return expect(observeHandler).toHaveBeenCalledWith(void 0, {
          previous: 'value 1'
        });
      });
      it("fires the callback when the full key path goes into and out of existence", function() {
        observeHandler.reset();
        atom.config.set("foo.bar", void 0);
        expect(observeHandler).toHaveBeenCalledWith(void 0, {
          previous: 'value 1'
        });
        observeHandler.reset();
        atom.config.set("foo.bar.baz", "i'm back");
        return expect(observeHandler).toHaveBeenCalledWith("i'm back", {
          previous: void 0
        });
      });
      return it("does not fire the callback once the observe subscription is off'ed", function() {
        observeHandler.reset();
        observeSubscription.off();
        atom.config.set('foo.bar.baz', "value 2");
        return expect(observeHandler).not.toHaveBeenCalled();
      });
    });
    describe(".initializeConfigDirectory()", function() {
      beforeEach(function() {
        if (fs.existsSync(dotAtomPath)) {
          fs.removeSync(dotAtomPath);
        }
        return atom.config.configDirPath = dotAtomPath;
      });
      afterEach(function() {
        return fs.removeSync(dotAtomPath);
      });
      return describe("when the configDirPath doesn't exist", function() {
        return it("copies the contents of dot-atom to ~/.atom", function() {
          var initializationDone;
          initializationDone = false;
          jasmine.unspy(window, "setTimeout");
          atom.config.initializeConfigDirectory(function() {
            return initializationDone = true;
          });
          waitsFor(function() {
            return initializationDone;
          });
          return runs(function() {
            expect(fs.existsSync(atom.config.configDirPath)).toBeTruthy();
            expect(fs.existsSync(path.join(atom.config.configDirPath, 'packages'))).toBeTruthy();
            expect(fs.isFileSync(path.join(atom.config.configDirPath, 'snippets.cson'))).toBeTruthy();
            expect(fs.isFileSync(path.join(atom.config.configDirPath, 'config.cson'))).toBeTruthy();
            expect(fs.isFileSync(path.join(atom.config.configDirPath, 'init.coffee'))).toBeTruthy();
            return expect(fs.isFileSync(path.join(atom.config.configDirPath, 'styles.less'))).toBeTruthy();
          });
        });
      });
    });
    describe(".loadUserConfig()", function() {
      beforeEach(function() {
        atom.config.configDirPath = dotAtomPath;
        atom.config.configFilePath = path.join(atom.config.configDirPath, "atom.config.cson");
        return expect(fs.existsSync(atom.config.configDirPath)).toBeFalsy();
      });
      afterEach(function() {
        return fs.removeSync(dotAtomPath);
      });
      describe("when the config file contains valid cson", function() {
        beforeEach(function() {
          fs.writeFileSync(atom.config.configFilePath, "foo: bar: 'baz'");
          return atom.config.loadUserConfig();
        });
        return it("updates the config data based on the file contents", function() {
          return expect(atom.config.get("foo.bar")).toBe('baz');
        });
      });
      describe("when the config file contains invalid cson", function() {
        beforeEach(function() {
          spyOn(console, 'error');
          return fs.writeFileSync(atom.config.configFilePath, "{{{{{");
        });
        return it("logs an error to the console and does not overwrite the config file on a subsequent save", function() {
          atom.config.loadUserConfig();
          expect(console.error).toHaveBeenCalled();
          atom.config.set("hair", "blonde");
          return expect(atom.config.save).not.toHaveBeenCalled();
        });
      });
      return describe("when the config file does not exist", function() {
        return it("creates it with an empty object", function() {
          fs.makeTreeSync(atom.config.configDirPath);
          atom.config.loadUserConfig();
          expect(fs.existsSync(atom.config.configFilePath)).toBe(true);
          return expect(CSON.readFileSync(atom.config.configFilePath)).toEqual({});
        });
      });
    });
    return describe(".observeUserConfig()", function() {
      var updatedHandler;
      updatedHandler = null;
      beforeEach(function() {
        atom.config.configDirPath = dotAtomPath;
        atom.config.configFilePath = path.join(atom.config.configDirPath, "atom.config.cson");
        expect(fs.existsSync(atom.config.configDirPath)).toBeFalsy();
        fs.writeFileSync(atom.config.configFilePath, "foo: bar: 'baz'");
        atom.config.loadUserConfig();
        atom.config.observeUserConfig();
        updatedHandler = jasmine.createSpy("updatedHandler");
        return atom.config.on('updated', updatedHandler);
      });
      afterEach(function() {
        atom.config.unobserveUserConfig();
        return fs.removeSync(dotAtomPath);
      });
      describe("when the config file changes to contain valid cson", function() {
        return it("updates the config data", function() {
          fs.writeFileSync(atom.config.configFilePath, "foo: { bar: 'quux', baz: 'bar'}");
          waitsFor('update event', function() {
            return updatedHandler.callCount > 0;
          });
          return runs(function() {
            expect(atom.config.get('foo.bar')).toBe('quux');
            return expect(atom.config.get('foo.baz')).toBe('bar');
          });
        });
      });
      return describe("when the config file changes to contain invalid cson", function() {
        beforeEach(function() {
          spyOn(console, 'error');
          fs.writeFileSync(atom.config.configFilePath, "}}}");
          return waitsFor("error to be logged", function() {
            return console.error.callCount > 0;
          });
        });
        it("logs a warning and does not update config data", function() {
          expect(updatedHandler.callCount).toBe(0);
          expect(atom.config.get('foo.bar')).toBe('baz');
          atom.config.set("hair", "blonde");
          return expect(atom.config.save).not.toHaveBeenCalled();
        });
        return describe("when the config file subsequently changes again to contain valid cson", function() {
          beforeEach(function() {
            fs.writeFileSync(atom.config.configFilePath, "foo: bar: 'baz'");
            return waitsFor('update event', function() {
              return updatedHandler.callCount > 0;
            });
          });
          return it("updates the config data and resumes saving", function() {
            atom.config.set("hair", "blonde");
            return expect(atom.config.save).toHaveBeenCalled();
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9CQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQURQLENBQUE7O0FBQUEsRUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVIsQ0FGUCxDQUFBOztBQUFBLEVBR0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBSEwsQ0FBQTs7QUFBQSxFQUtBLFFBQUEsQ0FBUyxRQUFULEVBQW1CLFNBQUEsR0FBQTtBQUNqQixRQUFBLFdBQUE7QUFBQSxJQUFBLFdBQUEsR0FBYyxJQUFJLENBQUMsSUFBTCxDQUFVLElBQUksQ0FBQyxHQUFmLEVBQW9CLGNBQXBCLENBQWQsQ0FBQTtBQUFBLElBQ0EsV0FBQSxHQUFjLElBRGQsQ0FBQTtBQUFBLElBR0EsVUFBQSxDQUFXLFNBQUEsR0FBQTthQUNULFdBQUEsR0FBYyxJQUFJLENBQUMsSUFBTCxDQUFVLGNBQVYsRUFETDtJQUFBLENBQVgsQ0FIQSxDQUFBO0FBQUEsSUFNQSxRQUFBLENBQVMsZUFBVCxFQUEwQixTQUFBLEdBQUE7QUFDeEIsTUFBQSxFQUFBLENBQUcsc0NBQUgsRUFBMkMsU0FBQSxHQUFBO0FBQ3pDLFFBQUEsTUFBQSxDQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixhQUFoQixFQUErQixFQUEvQixDQUFQLENBQTBDLENBQUMsSUFBM0MsQ0FBZ0QsRUFBaEQsQ0FBQSxDQUFBO0FBQUEsUUFDQSxNQUFBLENBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGFBQWhCLENBQVAsQ0FBc0MsQ0FBQyxJQUF2QyxDQUE0QyxFQUE1QyxDQURBLENBQUE7ZUFFQSxNQUFBLENBQU8sSUFBSSxDQUFDLE1B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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/config-spec.coffee