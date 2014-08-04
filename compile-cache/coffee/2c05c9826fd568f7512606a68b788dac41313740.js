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
        return expect(pane.activeItem).toBe(pane.items[0]);
      });
      return it("compacts the items array", function() {
        var pane;
        pane = new Pane({
          items: [void 0, new Item("A"), null, new Item("B")]
        });
        expect(pane.items.length).toBe(2);
        return expect(pane.activeItem).toBe(pane.items[0]);
      });
    });
    describe("::addItem(item, index)", function() {
      it("adds the item at the given index", function() {
        var item1, item2, item3, pane, _ref;
        pane = new Pane({
          items: [new Item("A"), new Item("B")]
        });
        _ref = pane.items, item1 = _ref[0], item2 = _ref[1];
        item3 = new Item("C");
        pane.addItem(item3, 1);
        return expect(pane.items).toEqual([item1, item3, item2]);
      });
      it("adds the item after the active item ", function() {
        var item1, item2, item3, item4, pane, _ref;
        pane = new Pane({
          items: [new Item("A"), new Item("B"), new Item("C")]
        });
        _ref = pane.items, item1 = _ref[0], item2 = _ref[1], item3 = _ref[2];
        pane.activateItem(item2);
        item4 = new Item("D");
        pane.addItem(item4);
        return expect(pane.items).toEqual([item1, item2, item4, item3]);
      });
      return it("sets the active item after adding the first item", function() {
        var events, item, pane;
        pane = new Pane;
        item = new Item("A");
        events = [];
        pane.on('item-added', function() {
          return events.push('item-added');
        });
        pane.$activeItem.changes.onValue(function() {
          return events.push('active-item-changed');
        });
        pane.addItem(item);
        expect(pane.activeItem).toBe(item);
        return expect(events).toEqual(['item-added', 'active-item-changed']);
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
        expect(pane.activeItem).toBe(pane.items[0]);
        pane.activateItem(pane.items[1]);
        return expect(pane.activeItem).toBe(pane.items[1]);
      });
      return it("adds the given item if it isn't present in ::items", function() {
        var item;
        item = new Item("C");
        pane.activateItem(item);
        expect(__indexOf.call(pane.items, item) >= 0).toBe(true);
        return expect(pane.activeItem).toBe(item);
      });
    });
    describe("::activateNextItem() and ::activatePreviousItem()", function() {
      return it("sets the active item to the next/previous item, looping around at either end", function() {
        var item1, item2, item3, pane, _ref;
        pane = new Pane({
          items: [new Item("A"), new Item("B"), new Item("C")]
        });
        _ref = pane.items, item1 = _ref[0], item2 = _ref[1], item3 = _ref[2];
        expect(pane.activeItem).toBe(item1);
        pane.activatePreviousItem();
        expect(pane.activeItem).toBe(item3);
        pane.activatePreviousItem();
        expect(pane.activeItem).toBe(item2);
        pane.activateNextItem();
        expect(pane.activeItem).toBe(item3);
        pane.activateNextItem();
        return expect(pane.activeItem).toBe(item1);
      });
    });
    describe("::activateItemAtIndex(index)", function() {
      return it("activates the item at the given index", function() {
        var item1, item2, item3, pane, _ref;
        pane = new Pane({
          items: [new Item("A"), new Item("B"), new Item("C")]
        });
        _ref = pane.items, item1 = _ref[0], item2 = _ref[1], item3 = _ref[2];
        pane.activateItemAtIndex(2);
        expect(pane.activeItem).toBe(item3);
        pane.activateItemAtIndex(1);
        expect(pane.activeItem).toBe(item2);
        pane.activateItemAtIndex(0);
        expect(pane.activeItem).toBe(item1);
        pane.activateItemAtIndex(100);
        expect(pane.activeItem).toBe(item1);
        pane.activateItemAtIndex(-1);
        return expect(pane.activeItem).toBe(item1);
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
        return _ref1 = pane.items, item1 = _ref1[0], item2 = _ref1[1], item3 = _ref1[2], _ref1;
      });
      it("removes the item from the items list", function() {
        expect(pane.activeItem).toBe(item1);
        pane.destroyItem(item2);
        expect(__indexOf.call(pane.items, item2) >= 0).toBe(false);
        expect(pane.activeItem).toBe(item1);
        pane.destroyItem(item1);
        return expect(__indexOf.call(pane.items, item1) >= 0).toBe(false);
      });
      describe("when the destroyed item is the active item and is the first item", function() {
        return it("activates the next item", function() {
          expect(pane.activeItem).toBe(item1);
          pane.destroyItem(item1);
          return expect(pane.activeItem).toBe(item2);
        });
      });
      describe("when the destroyed item is the active item and is not the first item", function() {
        beforeEach(function() {
          return pane.activateItem(item2);
        });
        return it("activates the previous item", function() {
          expect(pane.activeItem).toBe(item2);
          pane.destroyItem(item2);
          return expect(pane.activeItem).toBe(item1);
        });
      });
      it("emits 'item-removed' with the item, its index, and true indicating the item is being destroyed", function() {
        var itemRemovedHandler;
        pane.on('item-removed', itemRemovedHandler = jasmine.createSpy("itemRemovedHandler"));
        pane.destroyItem(item2);
        return expect(itemRemovedHandler).toHaveBeenCalledWith(item2, 1, true);
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
              expect(__indexOf.call(pane.items, item1) >= 0).toBe(false);
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
              expect(__indexOf.call(pane.items, item1) >= 0).toBe(false);
              return expect(item1.isDestroyed()).toBe(true);
            });
          });
        });
        describe("if the [Don't Save] option is selected", function() {
          return it("removes and destroys the item without saving it", function() {
            spyOn(atom, 'confirm').andReturn(2);
            pane.destroyItem(item1);
            expect(item1.save).not.toHaveBeenCalled();
            expect(__indexOf.call(pane.items, item1) >= 0).toBe(false);
            return expect(item1.isDestroyed()).toBe(true);
          });
        });
        return describe("if the [Cancel] option is selected", function() {
          return it("does not save, remove, or destroy the item", function() {
            spyOn(atom, 'confirm').andReturn(1);
            pane.destroyItem(item1);
            expect(item1.save).not.toHaveBeenCalled();
            expect(__indexOf.call(pane.items, item1) >= 0).toBe(true);
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
            expect(pane.activeItem).toBeUndefined();
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
        activeItem = pane.activeItem;
        pane.destroyActiveItem();
        expect(activeItem.isDestroyed()).toBe(true);
        return expect(__indexOf.call(pane.items, activeItem) >= 0).toBe(false);
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
        _ref = pane.items, item1 = _ref[0], item2 = _ref[1], item3 = _ref[2];
        pane.destroyItems();
        expect(item1.isDestroyed()).toBe(true);
        expect(item2.isDestroyed()).toBe(true);
        expect(item3.isDestroyed()).toBe(true);
        return expect(pane.items).toEqual([]);
      });
    });
    describe("when an item emits a destroyed event", function() {
      return it("removes it from the list of items", function() {
        var item1, item2, item3, pane, _ref;
        pane = new Pane({
          items: [new Item("A"), new Item("B"), new Item("C")]
        });
        _ref = pane.items, item1 = _ref[0], item2 = _ref[1], item3 = _ref[2];
        pane.items[1].destroy();
        return expect(pane.items).toEqual([item1, item3]);
      });
    });
    describe("::destroyInactiveItems()", function() {
      return it("destroys all items but the active item", function() {
        var item1, item2, item3, pane, _ref;
        pane = new Pane({
          items: [new Item("A"), new Item("B"), new Item("C")]
        });
        _ref = pane.items, item1 = _ref[0], item2 = _ref[1], item3 = _ref[2];
        pane.activateItem(item2);
        pane.destroyInactiveItems();
        return expect(pane.items).toEqual([item2]);
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
          return pane.activeItem.uri = "test";
        });
        describe("when the active item has a save method", function() {
          return it("saves the current item", function() {
            pane.activeItem.save = jasmine.createSpy("save");
            pane.saveActiveItem();
            return expect(pane.activeItem.save).toHaveBeenCalled();
          });
        });
        return describe("when the current item has no save method", function() {
          return it("does nothing", function() {
            expect(pane.activeItem.save).toBeUndefined();
            return pane.saveActiveItem();
          });
        });
      });
      return describe("when the current item has no uri", function() {
        describe("when the current item has a saveAs method", function() {
          return it("opens a save dialog and saves the current item as the selected path", function() {
            pane.activeItem.saveAs = jasmine.createSpy("saveAs");
            pane.saveActiveItem();
            expect(atom.showSaveDialogSync).toHaveBeenCalled();
            return expect(pane.activeItem.saveAs).toHaveBeenCalledWith('/selected/path');
          });
        });
        return describe("when the current item has no saveAs method", function() {
          return it("does nothing", function() {
            expect(pane.activeItem.saveAs).toBeUndefined();
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
          pane.activeItem.path = __filename;
          pane.activeItem.saveAs = jasmine.createSpy("saveAs");
          pane.saveActiveItemAs();
          expect(atom.showSaveDialogSync).toHaveBeenCalledWith(__filename);
          return expect(pane.activeItem.saveAs).toHaveBeenCalledWith('/selected/path');
        });
      });
      return describe("when the current item does not have a saveAs method", function() {
        return it("does nothing", function() {
          expect(pane.activeItem.saveAs).toBeUndefined();
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
        _ref = pane.items, item1 = _ref[0], item2 = _ref[1], item3 = _ref[2];
        item1.uri = "a";
        item2.uri = "b";
        expect(pane.itemForUri("a")).toBe(item1);
        expect(pane.itemForUri("b")).toBe(item2);
        return expect(pane.itemForUri("bogus")).toBeUndefined();
      });
    });
    describe("::moveItem(item, index)", function() {
      return it("moves the item to the given index and emits an 'item-moved' event with the item and its new index", function() {
        var item1, item2, item3, item4, itemMovedHandler, pane, _ref;
        pane = new Pane({
          items: [new Item("A"), new Item("B"), new Item("C"), new Item("D")]
        });
        _ref = pane.items, item1 = _ref[0], item2 = _ref[1], item3 = _ref[2], item4 = _ref[3];
        pane.on('item-moved', itemMovedHandler = jasmine.createSpy("itemMovedHandler"));
        pane.moveItem(item1, 2);
        expect(pane.getItems()).toEqual([item2, item3, item1, item4]);
        expect(itemMovedHandler).toHaveBeenCalledWith(item1, 2);
        itemMovedHandler.reset();
        pane.moveItem(item2, 3);
        expect(pane.getItems()).toEqual([item3, item1, item4, item2]);
        expect(itemMovedHandler).toHaveBeenCalledWith(item2, 3);
        itemMovedHandler.reset();
        pane.moveItem(item2, 1);
        expect(pane.getItems()).toEqual([item3, item2, item1, item4]);
        return expect(itemMovedHandler).toHaveBeenCalledWith(item2, 1);
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
        _ref2 = pane1.items, item1 = _ref2[0], item2 = _ref2[1], item3 = _ref2[2];
        return _ref3 = pane2.items, item4 = _ref3[0], item5 = _ref3[1], _ref3;
      });
      it("moves the item to the given pane at the given index", function() {
        pane1.moveItemToPane(item2, pane2, 1);
        expect(pane1.items).toEqual([item1, item3]);
        return expect(pane2.items).toEqual([item4, item2, item5]);
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
          items: ["A"]
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
              items: ["B"]
            });
            pane3 = pane1.splitLeft({
              items: ["C"]
            });
            expect(container.root.orientation).toBe('horizontal');
            return expect(container.root.children).toEqual([pane2, pane3, pane1]);
          });
        });
        return describe("when the parent is a column", function() {
          return it("replaces itself with a row and inserts a new pane to the left of itself", function() {
            var pane2, pane3, row;
            pane1.splitDown();
            pane2 = pane1.splitLeft({
              items: ["B"]
            });
            pane3 = pane1.splitLeft({
              items: ["C"]
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
              items: ["B"]
            });
            pane3 = pane1.splitRight({
              items: ["C"]
            });
            expect(container.root.orientation).toBe('horizontal');
            return expect(container.root.children).toEqual([pane1, pane3, pane2]);
          });
        });
        return describe("when the parent is a column", function() {
          return it("replaces itself with a row and inserts a new pane to the right of itself", function() {
            var pane2, pane3, row;
            pane1.splitDown();
            pane2 = pane1.splitRight({
              items: ["B"]
            });
            pane3 = pane1.splitRight({
              items: ["C"]
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
              items: ["B"]
            });
            pane3 = pane1.splitUp({
              items: ["C"]
            });
            expect(container.root.orientation).toBe('vertical');
            return expect(container.root.children).toEqual([pane2, pane3, pane1]);
          });
        });
        return describe("when the parent is a row", function() {
          return it("replaces itself with a column and inserts a new pane above itself", function() {
            var column, pane2, pane3;
            pane1.splitRight();
            pane2 = pane1.splitUp({
              items: ["B"]
            });
            pane3 = pane1.splitUp({
              items: ["C"]
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
              items: ["B"]
            });
            pane3 = pane1.splitDown({
              items: ["C"]
            });
            expect(container.root.orientation).toBe('vertical');
            return expect(container.root.children).toEqual([pane1, pane3, pane2]);
          });
        });
        return describe("when the parent is a row", function() {
          return it("replaces itself with a column and inserts a new pane below itself", function() {
            var column, pane2, pane3;
            pane1.splitRight();
            pane2 = pane1.splitDown({
              items: ["B"]
            });
            pane3 = pane1.splitDown({
              items: ["C"]
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
        _ref1 = pane1.items, item1 = _ref1[0], item2 = _ref1[1];
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
        return expect(newPane.items).toEqual(pane.items);
      });
      it("restores the active item on deserialization", function() {
        var newPane;
        pane.activateItemAtIndex(1);
        newPane = pane.testSerialization();
        return expect(newPane.activeItem).toEqual(newPane.items[1]);
      });
      it("does not include items that cannot be deserialized", function() {
        var newPane, unserializable;
        spyOn(console, 'warn');
        unserializable = {};
        pane.activateItem(unserializable);
        newPane = pane.testSerialization();
        expect(newPane.activeItem).toEqual(pane.items[0]);
        return expect(newPane.items.length).toBe(pane.items.length - 1);
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