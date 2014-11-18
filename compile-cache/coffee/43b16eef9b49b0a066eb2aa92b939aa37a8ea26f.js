(function() {
  var $, $$, Exec, Package, ThemeManager, WorkspaceView, path, _ref;

  _ref = require('atom'), $ = _ref.$, $$ = _ref.$$, WorkspaceView = _ref.WorkspaceView;

  Exec = require('child_process').exec;

  path = require('path');

  Package = require('../src/package');

  ThemeManager = require('../src/theme-manager');

  describe("the `atom` global", function() {
    beforeEach(function() {
      return atom.workspaceView = atom.workspace.getView(atom.workspace).__spacePenView;
    });
    describe('window sizing methods', function() {
      describe('::getPosition and ::setPosition', function() {
        return it('sets the position of the window, and can retrieve the position just set', function() {
          atom.setPosition(22, 45);
          return expect(atom.getPosition()).toEqual({
            x: 22,
            y: 45
          });
        });
      });
      return describe('::getSize and ::setSize', function() {
        var originalSize;
        originalSize = null;
        beforeEach(function() {
          return originalSize = atom.getSize();
        });
        afterEach(function() {
          return atom.setSize(originalSize.width, originalSize.height);
        });
        return it('sets the size of the window, and can retrieve the size just set', function() {
          atom.setSize(100, 400);
          return expect(atom.getSize()).toEqual({
            width: 100,
            height: 400
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZEQUFBOztBQUFBLEVBQUEsT0FBMEIsT0FBQSxDQUFRLE1BQVIsQ0FBMUIsRUFBQyxTQUFBLENBQUQsRUFBSSxVQUFBLEVBQUosRUFBUSxxQkFBQSxhQUFSLENBQUE7O0FBQUEsRUFDQSxJQUFBLEdBQU8sT0FBQSxDQUFRLGVBQVIsQ0FBd0IsQ0FBQyxJQURoQyxDQUFBOztBQUFBLEVBRUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRlAsQ0FBQTs7QUFBQSxFQUdBLE9BQUEsR0FBVSxPQUFBLENBQVEsZ0JBQVIsQ0FIVixDQUFBOztBQUFBLEVBSUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSxzQkFBUixDQUpmLENBQUE7O0FBQUEsRUFNQSxRQUFBLENBQVMsbUJBQVQsRUFBOEIsU0FBQSxHQUFBO0FBQzVCLElBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTthQUNULElBQUksQ0FBQyxhQUFMLEdBQXFCLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBZixDQUF1QixJQUFJLENBQUMsU0FBNUIsQ0FBc0MsQ0FBQyxlQURuRDtJQUFBLENBQVgsQ0FBQSxDQUFBO0FBQUEsSUFHQSxRQUFBLENBQVMsdUJBQVQsRUFBa0MsU0FBQSxHQUFBO0FBQ2hDLE1BQUEsUUFBQSxDQUFTLGlDQUFULEVBQTRDLFNBQUEsR0FBQTtlQUMxQyxFQUFBLENBQUcseUVBQUgsRUFBOEUsU0FBQSxHQUFBO0FBQzVFLFVBQUEsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsRUFBakIsRUFBcUIsRUFBckIsQ0FBQSxDQUFBO2lCQUNBLE1BQUEsQ0FBTyxJQUFJLENBQUMsV0FBTCxDQUFBLENBQVAsQ0FBMEIsQ0FBQyxPQUEzQixDQUFtQztBQUFBLFlBQUEsQ0FBQSxFQUFHLEVBQUg7QUFBQSxZQUFPLENBQUEsRUFBRyxFQUFWO1dB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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/atom-spec.coffee