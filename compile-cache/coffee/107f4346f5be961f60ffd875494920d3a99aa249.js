(function() {
  var Model, Pane, PaneAxis, PaneContainer,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Model = require('theorist').Model;

  Pane = require('../src/pane');

  PaneAxis = require('../src/pane-axis');

  PaneContainer = require('../src/pane-container');

  describe("Pane", function() {
    var Item;
    Item = (function(_super) {
      __extends(Item, _super);

      Item.deserialize = function(_arg) {
        var name, uri;
        name = _arg.name, uri = _arg.uri;
        return new this(name, uri);
      };

      function Item(name, uri) {
        this.name = name;
        this.uri = uri;
      }

      Item.prototype.getUri = function() {
        return this.uri;
      };

      Item.prototype.getPath = function() {
        return this.path;
      };

      Item.prototype.serialize = function() {
        return {
          deserializer: 'Item',
          name: this.name,
          uri: this.uri
        };
      };

      Item.prototype.isEqual = function(other) {
        return this.name === (other != null ? other.name : void 0);
      };

      return Item;

    })(Model);
    beforeEach(function() {
      return atom.deserializers.add(Item);
    });
    afterEach(function() {
      return atom.deserializers.remove(Item);
    });
    describe("construction", function() {
      it("sets the active item to the first item", function() {
        var pane;
        pane = new Pane({
          items: [new Item("A"), new Item("B")]
        });
        return expect(pane.getActiveItem()).toBe(pane.itemAtIndex(0));
      });
      return it("compacts the items array", function() {
        var pane;
        pane = new Pane({
          items: [void 0, new Item("A"), null, new Item("B")]
        });
        expect(pane.getItems().length).toBe(2);
        return expect(pane.getActiveItem()).toBe(pane.itemAtIndex(0));
      });
    });
    describe("::activate()", function() {
      var container, pane1, pane2, _ref;
      _ref = [], container = _ref[0], pane1 = _ref[1], pane2 = _ref[2];
      beforeEach(function() {
        var _ref1;
        container = new PaneContainer({
          root: new Pane
        });
        container.getRoot().splitRight();
        return _ref1 = container.getPanes(), pane1 = _ref1[0], pane2 = _ref1[1], _ref1;
      });
      it("changes the active pane on the container", function() {
        expect(container.getActivePane()).toBe(pane2);
        pane1.activate();
        expect(container.getActivePane()).toBe(pane1);
        pane2.activate();
        return expect(container.getActivePane()).toBe(pane2);
      });
      it("invokes ::onDidChangeActivePane observers on the container", function() {
        var observed;
        observed = [];
        container.onDidChangeActivePane(function(activePane) {
          return observed.push(activePane);
        });
        pane1.activate();
        pane1.activate();
        pane2.activate();
        pane1.activate();
        return expect(observed).toEqual([pane1, pane2, pane1]);
      });
      it("invokes ::onDidChangeActive observers on the relevant panes", function() {
        var observed;
        observed = [];
        pane1.onDidChangeActive(function(active) {
          return observed.push(active);
        });
        pane1.activate();
        pane2.activate();
        return expect(observed).toEqual([true, false]);
      });
      return it("invokes ::onDidActivate() observers", function() {
        var eventCount;
        eventCount = 0;
        pane1.onDidActivate(function() {
          return eventCount++;
        });
        pane1.activate();
        pane1.activate();
        pane2.activate();
        return expect(eventCount).toBe(2);
      });
    });
    describe("::addItem(item, index)", function() {
      it("adds the item at the given index", function() {
        var item1, item2, item3, pane, _ref;
        pane = new Pane({
          items: [new Item("A"), new Item("B")]
        });
        _ref = pane.getItems(), item1 = _ref[0], item2 = _ref[1];
        item3 = new Item("C");
        pane.addItem(item3, 1);
        return expect(pane.getItems()).toEqual([item1, item3, item2]);
      });
      it("adds the item after the active item if no index is provided", function() {
        var item1, item2, item3, item4, pane, _ref;
        pane = new Pane({
          items: [new Item("A"), new Item("B"), new Item("C")]
        });
        _ref = pane.getItems(), item1 = _ref[0], item2 = _ref[1], item3 = _ref[2];
        pane.activateItem(item2);
        item4 = new Item("D");
        pane.addItem(item4);
        return expect(pane.getItems()).toEqual([item1, item2, item4, item3]);
      });
      it("sets the active item after adding the first item", function() {
        var item, pane;
        pane = new Pane;
        item = new Item("A");
        pane.addItem(item);
        return expect(pane.getActiveItem()).toBe(item);
      });
      it("invokes ::onDidAddItem() observers", function() {
        var events, item, pane;
        pane = new Pane({
          items: [new Item("A"), new Item("B")]
        });
        events = [];
        pane.onDidAddItem(function(event) {
          return events.push(event);
        });
        item = new Item("C");
        pane.addItem(item, 1);
        return expect(events).toEqual([
          {
            item: item,
            index: 1
          }
        ]);
      });
      return it("throws an exception if the item is already present on a pane", function() {
        var container, item, pane1, pane2;
        item = new Item("A");
        pane1 = new Pane({
          items: [item]
        });
        container = new PaneContainer({
          root: pane1
        });
        pane2 = pane1.splitRight();
        return expect(function() {
          return pane2.addItem(item);
        }).toThrow();
      });
    });
    describe("::activateItem(item)", function() {
      var pane;
      pane = null;
      beforeEach(function() {
        return pane = new Pane({
          items: [new Item("A"), new Item("B")]
        });
      });
      it("changes the active item to the current item", function() {
        expect(pane.getActiveItem()).toBe(pane.itemAtIndex(0));
        pane.activateItem(pane.itemAtIndex(1));
        return expect(pane.getActiveItem()).toBe(pane.itemAtIndex(1));
      });
      it("adds the given item if it isn't present in ::items", function() {
        var item;
        item = new Item("C");
        pane.activateItem(item);
        expect(__indexOf.call(pane.getItems(), item) >= 0).toBe(true);
        return expect(pane.getActiveItem()).toBe(item);
      });
      return it("invokes ::onDidChangeActiveItem() observers", function() {
        var observed;
        observed = [];
        pane.onDidChangeActiveItem(function(item) {
          return observed.push(item);
        });
        pane.activateItem(pane.itemAtIndex(1));
        return expect(observed).toEqual([pane.itemAtIndex(1)]);
      });
    });
    describe("::activateNextItem() and ::activatePreviousItem()", function() {
      return it("sets the active item to the next/previous item, looping around at either end", function() {
        var item1, item2, item3, pane, _ref;
        pane = new Pane({
          items: [new Item("A"), new Item("B"), new Item("C")]
        });
        _ref = pane.getItems(), item1 = _ref[0], item2 = _ref[1], item3 = _ref[2];
        expect(pane.getActiveItem()).toBe(item1);
        pane.activatePreviousItem();
        expect(pane.getActiveItem()).toBe(item3);
        pane.activatePreviousItem();
        expect(pane.getActiveItem()).toBe(item2);
        pane.activateNextItem();
        expect(pane.getActiveItem()).toBe(item3);
        pane.activateNextItem();
        return expect(pane.getActiveItem()).toBe(item1);
      });
    });
    describe("::activateItemAtIndex(index)", function() {
      return it("activates the item at the given index", function() {
        var item1, item2, item3, pane, _ref;
        pane = new Pane({
          items: [new Item("A"), new Item("B"), new Item("C")]
        });
        _ref = pane.getItems(), item1 = _ref[0], item2 = _ref[1], item3 = _ref[2];
        pane.activateItemAtIndex(2);
        expect(pane.getActiveItem()).toBe(item3);
        pane.activateItemAtIndex(1);
        expect(pane.getActiveItem()).toBe(item2);
        pane.activateItemAtIndex(0);
        expect(pane.getActiveItem()).toBe(item1);
        pane.activateItemAtIndex(100);
        expect(pane.getActiveItem()).toBe(item1);
        pane.activateItemAtIndex(-1);
        return expect(pane.getActiveItem()).toBe(item1);
      });
    });
    describe("::destroyItem(item)", function() {
      var item1, item2, item3, pane, _ref;
      _ref = [], pane = _ref[0], item1 = _ref[1], item2 = _ref[2], item3 = _ref[3];
      beforeEach(function() {
        var _ref1;
        pane = new Pane({
          items: [new Item("A"), new Item("B"), new Item("C")]
        });
        return _ref1 = pane.getItems(), item1 = _ref1[0], item2 = _ref1[1], item3 = _ref1[2], _ref1;
      });
      it("removes the item from the items list and destroyes it", function() {
        expect(pane.getActiveItem()).toBe(item1);
        pane.destroyItem(item2);
        expect(__indexOf.call(pane.getItems(), item2) >= 0).toBe(false);
        expect(item2.isDestroyed()).toBe(true);
        expect(pane.getActiveItem()).toBe(item1);
        pane.destroyItem(item1);
        expect(__indexOf.call(pane.getItems(), item1) >= 0).toBe(false);
        return expect(item1.isDestroyed()).toBe(true);
      });
      it("invokes ::onWillDestroyItem() observers before destroying the item", function() {
        var events;
        events = [];
        pane.onWillDestroyItem(function(event) {
          expect(item2.isDestroyed()).toBe(false);
          return events.push(event);
        });
        pane.destroyItem(item2);
        expect(item2.isDestroyed()).toBe(true);
        return expect(events).toEqual([
          {
            item: item2,
            index: 1
          }
        ]);
      });
      it("invokes ::onDidRemoveItem() observers", function() {
        var events;
        events = [];
        pane.onDidRemoveItem(function(event) {
          return events.push(event);
        });
        pane.destroyItem(item2);
        return expect(events).toEqual([
          {
            item: item2,
            index: 1,
            destroyed: true
          }
        ]);
      });
      describe("when the destroyed item is the active item and is the first item", function() {
        return it("activates the next item", function() {
          expect(pane.getActiveItem()).toBe(item1);
          pane.destroyItem(item1);
          return expect(pane.getActiveItem()).toBe(item2);
        });
      });
      describe("when the destroyed item is the active item and is not the first item", function() {
        beforeEach(function() {
          return pane.activateItem(item2);
        });
        return it("activates the previous item", function() {
          expect(pane.getActiveItem()).toBe(item2);
          pane.destroyItem(item2);
          return expect(pane.getActiveItem()).toBe(item1);
        });
      });
      describe("if the item is modified", function() {
        var itemUri;
        itemUri = null;
        beforeEach(function() {
          item1.shouldPromptToSave = function() {
            return true;
          };
          item1.save = jasmine.createSpy("save");
          item1.saveAs = jasmine.createSpy("saveAs");
          return item1.getUri = function() {
            return itemUri;
          };
        });
        describe("if the [Save] option is selected", function() {
          describe("when the item has a uri", function() {
            return it("saves the item before destroying it", function() {
              itemUri = "test";
              spyOn(atom, 'confirm').andReturn(0);
              pane.destroyItem(item1);
              expect(item1.save).toHaveBeenCalled();
              expect(__indexOf.call(pane.getItems(), item1) >= 0).toBe(false);
              return expect(item1.isDestroyed()).toBe(true);
            });
          });
          return describe("when the item has no uri", function() {
            return it("presents a save-as dialog, then saves the item with the given uri before removing and destroying it", function() {
              itemUri = null;
              spyOn(atom, 'showSaveDialogSync').andReturn("/selected/path");
              spyOn(atom, 'confirm').andReturn(0);
              pane.destroyItem(item1);
              expect(atom.showSaveDialogSync).toHaveBeenCalled();
              expect(item1.saveAs).toHaveBeenCalledWith("/selected/path");
              expect(__indexOf.call(pane.getItems(), item1) >= 0).toBe(false);
              return expect(item1.isDestroyed()).toBe(true);
            });
          });
        });
        describe("if the [Don't Save] option is selected", function() {
          return it("removes and destroys the item without saving it", function() {
            spyOn(atom, 'confirm').andReturn(2);
            pane.destroyItem(item1);
            expect(item1.save).not.toHaveBeenCalled();
            expect(__indexOf.call(pane.getItems(), item1) >= 0).toBe(false);
            return expect(item1.isDestroyed()).toBe(true);
          });
        });
        return describe("if the [Cancel] option is selected", function() {
          return it("does not save, remove, or destroy the item", function() {
            spyOn(atom, 'confirm').andReturn(1);
            pane.destroyItem(item1);
            expect(item1.save).not.toHaveBeenCalled();
            expect(__indexOf.call(pane.getItems(), item1) >= 0).toBe(true);
            return expect(item1.isDestroyed()).toBe(false);
          });
        });
      });
      return describe("when the last item is destroyed", function() {
        describe("when the 'core.destroyEmptyPanes' config option is false (the default)", function() {
          return it("does not destroy the pane, but leaves it in place with empty items", function() {
            var item, _i, _len, _ref1;
            expect(atom.config.get('core.destroyEmptyPanes')).toBe(false);
            _ref1 = pane.getItems();
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              item = _ref1[_i];
              pane.destroyItem(item);
            }
            expect(pane.isDestroyed()).toBe(false);
            expect(pane.getActiveItem()).toBeUndefined();
            expect(function() {
              return pane.saveActiveItem();
            }).not.toThrow();
            return expect(function() {
              return pane.saveActiveItemAs();
            }).not.toThrow();
          });
        });
        return describe("when the 'core.destroyEmptyPanes' config option is true", function() {
          return it("destroys the pane", function() {
            var item, _i, _len, _ref1;
            atom.config.set('core.destroyEmptyPanes', true);
            _ref1 = pane.getItems();
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              item = _ref1[_i];
              pane.destroyItem(item);
            }
            return expect(pane.isDestroyed()).toBe(true);
          });
        });
      });
    });
    describe("::destroyActiveItem()", function() {
      it("destroys the active item", function() {
        var activeItem, pane;
        pane = new Pane({
          items: [new Item("A"), new Item("B")]
        });
        activeItem = pane.getActiveItem();
        pane.destroyActiveItem();
        expect(activeItem.isDestroyed()).toBe(true);
        return expect(__indexOf.call(pane.getItems(), activeItem) >= 0).toBe(false);
      });
      return it("does not throw an exception if there are no more items", function() {
        var pane;
        pane = new Pane;
        return pane.destroyActiveItem();
      });
    });
    describe("::destroyItems()", function() {
      return it("destroys all items", function() {
        var item1, item2, item3, pane, _ref;
        pane = new Pane({
          items: [new Item("A"), new Item("B"), new Item("C")]
        });
        _ref = pane.getItems(), item1 = _ref[0], item2 = _ref[1], item3 = _ref[2];
        pane.destroyItems();
        expect(item1.isDestroyed()).toBe(true);
        expect(item2.isDestroyed()).toBe(true);
        expect(item3.isDestroyed()).toBe(true);
        return expect(pane.getItems()).toEqual([]);
      });
    });
    describe("::observeItems()", function() {
      return it("invokes the observer with all current and future items", function() {
        var item1, item2, item3, observed, pane, _ref;
        pane = new Pane({
          items: [new Item, new Item]
        });
        _ref = pane.getItems(), item1 = _ref[0], item2 = _ref[1];
        observed = [];
        pane.observeItems(function(item) {
          return observed.push(item);
        });
        item3 = new Item;
        pane.addItem(item3);
        return expect(observed).toEqual([item1, item2, item3]);
      });
    });
    describe("when an item emits a destroyed event", function() {
      return it("removes it from the list of items", function() {
        var item1, item2, item3, pane, _ref;
        pane = new Pane({
          items: [new Item("A"), new Item("B"), new Item("C")]
        });
        _ref = pane.getItems(), item1 = _ref[0], item2 = _ref[1], item3 = _ref[2];
        pane.itemAtIndex(1).destroy();
        return expect(pane.getItems()).toEqual([item1, item3]);
      });
    });
    describe("::destroyInactiveItems()", function() {
      return it("destroys all items but the active item", function() {
        var item1, item2, item3, pane, _ref;
        pane = new Pane({
          items: [new Item("A"), new Item("B"), new Item("C")]
        });
        _ref = pane.getItems(), item1 = _ref[0], item2 = _ref[1], item3 = _ref[2];
        pane.activateItem(item2);
        pane.destroyInactiveItems();
        return expect(pane.getItems()).toEqual([item2]);
      });
    });
    describe("::saveActiveItem()", function() {
      var pane;
      pane = null;
      beforeEach(function() {
        pane = new Pane({
          items: [new Item("A")]
        });
        return spyOn(atom, 'showSaveDialogSync').andReturn('/selected/path');
      });
      describe("when the active item has a uri", function() {
        beforeEach(function() {
          return pane.getActiveItem().uri = "test";
        });
        describe("when the active item has a save method", function() {
          return it("saves the current item", function() {
            pane.getActiveItem().save = jasmine.createSpy("save");
            pane.saveActiveItem();
            return expect(pane.getActiveItem().save).toHaveBeenCalled();
          });
        });
        return describe("when the current item has no save method", function() {
          return it("does nothing", function() {
            expect(pane.getActiveItem().save).toBeUndefined();
            return pane.saveActiveItem();
          });
        });
      });
      return describe("when the current item has no uri", function() {
        describe("when the current item has a saveAs method", function() {
          return it("opens a save dialog and saves the current item as the selected path", function() {
            pane.getActiveItem().saveAs = jasmine.createSpy("saveAs");
            pane.saveActiveItem();
            expect(atom.showSaveDialogSync).toHaveBeenCalled();
            return expect(pane.getActiveItem().saveAs).toHaveBeenCalledWith('/selected/path');
          });
        });
        return describe("when the current item has no saveAs method", function() {
          return it("does nothing", function() {
            expect(pane.getActiveItem().saveAs).toBeUndefined();
            pane.saveActiveItem();
            return expect(atom.showSaveDialogSync).not.toHaveBeenCalled();
          });
        });
      });
    });
    describe("::saveActiveItemAs()", function() {
      var pane;
      pane = null;
      beforeEach(function() {
        pane = new Pane({
          items: [new Item("A")]
        });
        return spyOn(atom, 'showSaveDialogSync').andReturn('/selected/path');
      });
      describe("when the current item has a saveAs method", function() {
        return it("opens the save dialog and calls saveAs on the item with the selected path", function() {
          pane.getActiveItem().path = __filename;
          pane.getActiveItem().saveAs = jasmine.createSpy("saveAs");
          pane.saveActiveItemAs();
          expect(atom.showSaveDialogSync).toHaveBeenCalledWith(__filename);
          return expect(pane.getActiveItem().saveAs).toHaveBeenCalledWith('/selected/path');
        });
      });
      return describe("when the current item does not have a saveAs method", function() {
        return it("does nothing", function() {
          expect(pane.getActiveItem().saveAs).toBeUndefined();
          pane.saveActiveItemAs();
          return expect(atom.showSaveDialogSync).not.toHaveBeenCalled();
        });
      });
    });
    describe("::itemForUri(uri)", function() {
      return it("returns the item for which a call to .getUri() returns the given uri", function() {
        var item1, item2, item3, pane, _ref;
        pane = new Pane({
          items: [new Item("A"), new Item("B"), new Item("C"), new Item("D")]
        });
        _ref = pane.getItems(), item1 = _ref[0], item2 = _ref[1], item3 = _ref[2];
        item1.uri = "a";
        item2.uri = "b";
        expect(pane.itemForUri("a")).toBe(item1);
        expect(pane.itemForUri("b")).toBe(item2);
        return expect(pane.itemForUri("bogus")).toBeUndefined();
      });
    });
    describe("::moveItem(item, index)", function() {
      var item1, item2, item3, item4, pane, _ref;
      _ref = [], pane = _ref[0], item1 = _ref[1], item2 = _ref[2], item3 = _ref[3], item4 = _ref[4];
      beforeEach(function() {
        var _ref1;
        pane = new Pane({
          items: [new Item("A"), new Item("B"), new Item("C"), new Item("D")]
        });
        return _ref1 = pane.getItems(), item1 = _ref1[0], item2 = _ref1[1], item3 = _ref1[2], item4 = _ref1[3], _ref1;
      });
      it("moves the item to the given index and invokes ::onDidMoveItem observers", function() {
        pane.moveItem(item1, 2);
        expect(pane.getItems()).toEqual([item2, item3, item1, item4]);
        pane.moveItem(item2, 3);
        expect(pane.getItems()).toEqual([item3, item1, item4, item2]);
        pane.moveItem(item2, 1);
        return expect(pane.getItems()).toEqual([item3, item2, item1, item4]);
      });
      return it("invokes ::onDidMoveItem() observers", function() {
        var events;
        events = [];
        pane.onDidMoveItem(function(event) {
          return events.push(event);
        });
        pane.moveItem(item1, 2);
        pane.moveItem(item2, 3);
        return expect(events).toEqual([
          {
            item: item1,
            oldIndex: 0,
            newIndex: 2
          }, {
            item: item2,
            oldIndex: 0,
            newIndex: 3
          }
        ]);
      });
    });
    describe("::moveItemToPane(item, pane, index)", function() {
      var container, item1, item2, item3, item4, item5, pane1, pane2, _ref, _ref1;
      _ref = [], container = _ref[0], pane1 = _ref[1], pane2 = _ref[2];
      _ref1 = [], item1 = _ref1[0], item2 = _ref1[1], item3 = _ref1[2], item4 = _ref1[3], item5 = _ref1[4];
      beforeEach(function() {
        var _ref2, _ref3;
        pane1 = new Pane({
          items: [new Item("A"), new Item("B"), new Item("C")]
        });
        container = new PaneContainer({
          root: pane1
        });
        pane2 = pane1.splitRight({
          items: [new Item("D"), new Item("E")]
        });
        _ref2 = pane1.getItems(), item1 = _ref2[0], item2 = _ref2[1], item3 = _ref2[2];
        return _ref3 = pane2.getItems(), item4 = _ref3[0], item5 = _ref3[1], _ref3;
      });
      it("moves the item to the given pane at the given index", function() {
        pane1.moveItemToPane(item2, pane2, 1);
        expect(pane1.getItems()).toEqual([item1, item3]);
        return expect(pane2.getItems()).toEqual([item4, item2, item5]);
      });
      it("invokes ::onDidRemoveItem() observers", function() {
        var events;
        events = [];
        pane1.onDidRemoveItem(function(event) {
          return events.push(event);
        });
        pane1.moveItemToPane(item2, pane2, 1);
        return expect(events).toEqual([
          {
            item: item2,
            index: 1,
            destroyed: false
          }
        ]);
      });
      return describe("when the moved item the last item in the source pane", function() {
        beforeEach(function() {
          return item5.destroy();
        });
        describe("when the 'core.destroyEmptyPanes' config option is false (the default)", function() {
          return it("does not destroy the pane or the item", function() {
            pane2.moveItemToPane(item4, pane1, 0);
            expect(pane2.isDestroyed()).toBe(false);
            return expect(item4.isDestroyed()).toBe(false);
          });
        });
        return describe("when the 'core.destroyEmptyPanes' config option is true", function() {
          return it("destroys the pane, but not the item", function() {
            atom.config.set('core.destroyEmptyPanes', true);
            pane2.moveItemToPane(item4, pane1, 0);
            expect(pane2.isDestroyed()).toBe(true);
            return expect(item4.isDestroyed()).toBe(false);
          });
        });
      });
    });
    describe("split methods", function() {
      var container, pane1, _ref;
      _ref = [], pane1 = _ref[0], container = _ref[1];
      beforeEach(function() {
        pane1 = new Pane({
          items: [new Item("A")]
        });
        return container = new PaneContainer({
          root: pane1
        });
      });
      describe("::splitLeft(params)", function() {
        describe("when the parent is the container root", function() {
          return it("replaces itself with a row and inserts a new pane to the left of itself", function() {
            var pane2, pane3;
            pane2 = pane1.splitLeft({
              items: [new Item("B")]
            });
            pane3 = pane1.splitLeft({
              items: [new Item("C")]
            });
            expect(container.root.orientation).toBe('horizontal');
            return expect(container.root.children).toEqual([pane2, pane3, pane1]);
          });
        });
        describe("when `copyActiveItem: true` is passed in the params", function() {
          return it("duplicates the active item", function() {
            var pane2;
            pane2 = pane1.splitLeft({
              copyActiveItem: true
            });
            return expect(pane2.getActiveItem()).toEqual(pane1.getActiveItem());
          });
        });
        return describe("when the parent is a column", function() {
          return it("replaces itself with a row and inserts a new pane to the left of itself", function() {
            var pane2, pane3, row;
            pane1.splitDown();
            pane2 = pane1.splitLeft({
              items: [new Item("B")]
            });
            pane3 = pane1.splitLeft({
              items: [new Item("C")]
            });
            row = container.root.children[0];
            expect(row.orientation).toBe('horizontal');
            return expect(row.children).toEqual([pane2, pane3, pane1]);
          });
        });
      });
      describe("::splitRight(params)", function() {
        describe("when the parent is the container root", function() {
          return it("replaces itself with a row and inserts a new pane to the right of itself", function() {
            var pane2, pane3;
            pane2 = pane1.splitRight({
              items: [new Item("B")]
            });
            pane3 = pane1.splitRight({
              items: [new Item("C")]
            });
            expect(container.root.orientation).toBe('horizontal');
            return expect(container.root.children).toEqual([pane1, pane3, pane2]);
          });
        });
        describe("when `copyActiveItem: true` is passed in the params", function() {
          return it("duplicates the active item", function() {
            var pane2;
            pane2 = pane1.splitRight({
              copyActiveItem: true
            });
            return expect(pane2.getActiveItem()).toEqual(pane1.getActiveItem());
          });
        });
        return describe("when the parent is a column", function() {
          return it("replaces itself with a row and inserts a new pane to the right of itself", function() {
            var pane2, pane3, row;
            pane1.splitDown();
            pane2 = pane1.splitRight({
              items: [new Item("B")]
            });
            pane3 = pane1.splitRight({
              items: [new Item("C")]
            });
            row = container.root.children[0];
            expect(row.orientation).toBe('horizontal');
            return expect(row.children).toEqual([pane1, pane3, pane2]);
          });
        });
      });
      describe("::splitUp(params)", function() {
        describe("when the parent is the container root", function() {
          return it("replaces itself with a column and inserts a new pane above itself", function() {
            var pane2, pane3;
            pane2 = pane1.splitUp({
              items: [new Item("B")]
            });
            pane3 = pane1.splitUp({
              items: [new Item("C")]
            });
            expect(container.root.orientation).toBe('vertical');
            return expect(container.root.children).toEqual([pane2, pane3, pane1]);
          });
        });
        describe("when `copyActiveItem: true` is passed in the params", function() {
          return it("duplicates the active item", function() {
            var pane2;
            pane2 = pane1.splitUp({
              copyActiveItem: true
            });
            return expect(pane2.getActiveItem()).toEqual(pane1.getActiveItem());
          });
        });
        return describe("when the parent is a row", function() {
          return it("replaces itself with a column and inserts a new pane above itself", function() {
            var column, pane2, pane3;
            pane1.splitRight();
            pane2 = pane1.splitUp({
              items: [new Item("B")]
            });
            pane3 = pane1.splitUp({
              items: [new Item("C")]
            });
            column = container.root.children[0];
            expect(column.orientation).toBe('vertical');
            return expect(column.children).toEqual([pane2, pane3, pane1]);
          });
        });
      });
      describe("::splitDown(params)", function() {
        describe("when the parent is the container root", function() {
          return it("replaces itself with a column and inserts a new pane below itself", function() {
            var pane2, pane3;
            pane2 = pane1.splitDown({
              items: [new Item("B")]
            });
            pane3 = pane1.splitDown({
              items: [new Item("C")]
            });
            expect(container.root.orientation).toBe('vertical');
            return expect(container.root.children).toEqual([pane1, pane3, pane2]);
          });
        });
        describe("when `copyActiveItem: true` is passed in the params", function() {
          return it("duplicates the active item", function() {
            var pane2;
            pane2 = pane1.splitDown({
              copyActiveItem: true
            });
            return expect(pane2.getActiveItem()).toEqual(pane1.getActiveItem());
          });
        });
        return describe("when the parent is a row", function() {
          return it("replaces itself with a column and inserts a new pane below itself", function() {
            var column, pane2, pane3;
            pane1.splitRight();
            pane2 = pane1.splitDown({
              items: [new Item("B")]
            });
            pane3 = pane1.splitDown({
              items: [new Item("C")]
            });
            column = container.root.children[0];
            expect(column.orientation).toBe('vertical');
            return expect(column.children).toEqual([pane1, pane3, pane2]);
          });
        });
      });
      return it("activates the new pane", function() {
        var pane2;
        expect(pane1.isActive()).toBe(true);
        pane2 = pane1.splitRight();
        expect(pane1.isActive()).toBe(false);
        return expect(pane2.isActive()).toBe(true);
      });
    });
    describe("::destroy()", function() {
      var container, pane1, pane2, _ref;
      _ref = [], container = _ref[0], pane1 = _ref[1], pane2 = _ref[2];
      beforeEach(function() {
        container = new PaneContainer;
        pane1 = container.root;
        pane1.addItems([new Item("A"), new Item("B")]);
        return pane2 = pane1.splitRight();
      });
      it("destroys the pane's destroyable items", function() {
        var item1, item2, _ref1;
        _ref1 = pane1.getItems(), item1 = _ref1[0], item2 = _ref1[1];
        pane1.destroy();
        expect(item1.isDestroyed()).toBe(true);
        return expect(item2.isDestroyed()).toBe(true);
      });
      describe("if the pane is active", function() {
        return it("makes the next pane active", function() {
          expect(pane2.isActive()).toBe(true);
          pane2.destroy();
          return expect(pane1.isActive()).to;
        });
      });
      describe("if the pane's parent has more than two children", function() {
        return it("removes the pane from its parent", function() {
          var pane3;
          pane3 = pane2.splitRight();
          expect(container.root.children).toEqual([pane1, pane2, pane3]);
          pane2.destroy();
          return expect(container.root.children).toEqual([pane1, pane3]);
        });
      });
      return describe("if the pane's parent has two children", function() {
        return it("replaces the parent with its last remaining child", function() {
          var pane3;
          pane3 = pane2.splitDown();
          expect(container.root.children[0]).toBe(pane1);
          expect(container.root.children[1].children).toEqual([pane2, pane3]);
          pane3.destroy();
          expect(container.root.children).toEqual([pane1, pane2]);
          pane2.destroy();
          return expect(container.root).toBe(pane1);
        });
      });
    });
    return describe("serialization", function() {
      var pane;
      pane = null;
      beforeEach(function() {
        return pane = new Pane({
          items: [new Item("A", "a"), new Item("B", "b"), new Item("C", "c")]
        });
      });
      it("can serialize and deserialize the pane and all its items", function() {
        var newPane;
        newPane = pane.testSerialization();
        return expect(newPane.getItems()).toEqual(pane.getItems());
      });
      it("restores the active item on deserialization", function() {
        var newPane;
        pane.activateItemAtIndex(1);
        newPane = pane.testSerialization();
        return expect(newPane.getActiveItem()).toEqual(newPane.itemAtIndex(1));
      });
      it("does not include items that cannot be deserialized", function() {
        var newPane, unserializable;
        spyOn(console, 'warn');
        unserializable = {};
        pane.activateItem(unserializable);
        newPane = pane.testSerialization();
        expect(newPane.getActiveItem()).toEqual(pane.itemAtIndex(0));
        return expect(newPane.getItems().length).toBe(pane.getItems().length - 1);
      });
      return it("includes the pane's focus state in the serialized state", function() {
        var newPane;
        pane.focus();
        newPane = pane.testSerialization();
        return expect(newPane.focused).toBe(true);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG9DQUFBO0lBQUE7O3lKQUFBOztBQUFBLEVBQUMsUUFBUyxPQUFBLENBQVEsVUFBUixFQUFULEtBQUQsQ0FBQTs7QUFBQSxFQUNBLElBQUEsR0FBTyxPQUFBLENBQVEsYUFBUixDQURQLENBQUE7O0FBQUEsRUFFQSxRQUFBLEdBQVcsT0FBQSxDQUFRLGtCQUFSLENBRlgsQ0FBQTs7QUFBQSxFQUdBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLHVCQUFSLENBSGhCLENBQUE7O0FBQUEsRUFLQSxRQUFBLENBQVMsTUFBVCxFQUFpQixTQUFBLEdBQUE7QUFDZixRQUFBLElBQUE7QUFBQSxJQUFNO0FBQ0osNkJBQUEsQ0FBQTs7QUFBQSxNQUFBLElBQUMsQ0FBQSxXQUFELEdBQWMsU0FBQyxJQUFELEdBQUE7QUFBaUIsWUFBQSxTQUFBO0FBQUEsUUFBZixZQUFBLE1BQU0sV0FBQSxHQUFTLENBQUE7ZUFBSSxJQUFBLElBQUEsQ0FBSyxJQUFMLEVBQVcsR0FBWCxFQUFyQjtNQUFBLENBQWQsQ0FBQTs7QUFDYSxNQUFBLGNBQUUsSUFBRixFQUFTLEdBQVQsR0FBQTtBQUFlLFFBQWQsSUFBQyxDQUFBLE9BQUEsSUFBYSxDQUFBO0FBQUEsUUFBUCxJQUFDLENBQUEsTUFBQSxHQUFNLENBQWY7TUFBQSxDQURiOztBQUFBLHFCQUVBLE1BQUEsR0FBUSxTQUFBLEdBQUE7ZUFBRyxJQUFDLENBQUEsSUFBSjtNQUFBLENBRlIsQ0FBQTs7QUFBQSxxQkFHQSxPQUFBLEdBQVMsU0FBQSxHQUFBO2VBQUcsSUFBQyxDQUFBLEtBQUo7TUFBQSxDQUhULENBQUE7O0FBQUEscUJBSUEsU0FBQSxHQUFXLFNBQUEsR0FBQTtlQUFHO0FBQUEsVUFBQyxZQUFBLEVBQWMsTUFBZjtBQUFBLFVBQXdCLE1BQUQsSUFBQyxD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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/pane-spec.coffee