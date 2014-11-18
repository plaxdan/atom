(function() {
  var $, Emitter, PaneContainerView, PaneView, View, fs, path, temp, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  PaneContainerView = require('../src/pane-container-view');

  PaneView = require('../src/pane-view');

  fs = require('fs-plus');

  Emitter = require('event-kit').Emitter;

  _ref = require('atom'), $ = _ref.$, View = _ref.View;

  path = require('path');

  temp = require('temp');

  describe("PaneView", function() {
    var TestView, container, containerModel, editor1, editor2, pane, paneModel, view1, view2, _ref1;
    _ref1 = [], container = _ref1[0], containerModel = _ref1[1], view1 = _ref1[2], view2 = _ref1[3], editor1 = _ref1[4], editor2 = _ref1[5], pane = _ref1[6], paneModel = _ref1[7];
    TestView = (function(_super) {
      __extends(TestView, _super);

      function TestView() {
        return TestView.__super__.constructor.apply(this, arguments);
      }

      TestView.deserialize = function(_arg) {
        var id, text;
        id = _arg.id, text = _arg.text;
        return new TestView({
          id: id,
          text: text
        });
      };

      TestView.content = function(_arg) {
        var id, text;
        id = _arg.id, text = _arg.text;
        return this.div({
          "class": 'test-view',
          id: id,
          tabindex: -1
        }, text);
      };

      TestView.prototype.initialize = function(_arg) {
        this.id = _arg.id, this.text = _arg.text;
        return this.emitter = new Emitter;
      };

      TestView.prototype.serialize = function() {
        return {
          deserializer: 'TestView',
          id: this.id,
          text: this.text
        };
      };

      TestView.prototype.getUri = function() {
        return this.id;
      };

      TestView.prototype.isEqual = function(other) {
        return (other != null) && this.id === other.id && this.text === other.text;
      };

      TestView.prototype.changeTitle = function() {
        return this.emitter.emit('did-change-title', 'title');
      };

      TestView.prototype.onDidChangeTitle = function(callback) {
        return this.emitter.on('did-change-title', callback);
      };

      return TestView;

    })(View);
    beforeEach(function() {
      atom.deserializers.add(TestView);
      container = new PaneContainerView;
      containerModel = container.model;
      view1 = new TestView({
        id: 'view-1',
        text: 'View 1'
      });
      view2 = new TestView({
        id: 'view-2',
        text: 'View 2'
      });
      waitsForPromise(function() {
        return atom.workspace.open('sample.js').then(function(o) {
          return editor1 = o;
        });
      });
      waitsForPromise(function() {
        return atom.workspace.open('sample.txt').then(function(o) {
          return editor2 = o;
        });
      });
      return runs(function() {
        pane = container.getRoot();
        paneModel = pane.getModel();
        return paneModel.addItems([view1, editor1, view2, editor2]);
      });
    });
    afterEach(function() {
      return atom.deserializers.remove(TestView);
    });
    describe("when the active pane item changes", function() {
      it("hides all item views except the active one", function() {
        expect(pane.getActiveItem()).toBe(view1);
        expect(view1.css('display')).not.toBe('none');
        pane.activateItem(view2);
        expect(view1.css('display')).toBe('none');
        return expect(view2.css('display')).not.toBe('none');
      });
      it("triggers 'pane:active-item-changed'", function() {
        var itemChangedHandler;
        itemChangedHandler = jasmine.createSpy("itemChangedHandler");
        container.on('pane:active-item-changed', itemChangedHandler);
        expect(pane.getActiveItem()).toBe(view1);
        paneModel.activateItem(view2);
        paneModel.activateItem(view2);
        expect(itemChangedHandler.callCount).toBe(1);
        expect(itemChangedHandler.argsForCall[0][1]).toBe(view2);
        itemChangedHandler.reset();
        paneModel.activateItem(editor1);
        expect(itemChangedHandler).toHaveBeenCalled();
        expect(itemChangedHandler.argsForCall[0][1]).toBe(editor1);
        return itemChangedHandler.reset();
      });
      it("transfers focus to the new active view if the previous view was focused", function() {
        container.attachToDom();
        pane.focus();
        expect(pane.activeView).not.toBe(view2);
        expect(pane.activeView).toMatchSelector(':focus');
        paneModel.activateItem(view2);
        return expect(view2).toMatchSelector(':focus');
      });
      describe("when the new activeItem is a model", function() {
        return it("shows the item's view or creates and shows a new view for the item if none exists", function() {
          var initialViewCount, model1, model2;
          initialViewCount = pane.itemViews.find('.test-view').length;
          model1 = {
            id: 'test-model-1',
            text: 'Test Model 1',
            serialize: function() {
              return {
                id: this.id,
                text: this.text
              };
            },
            getViewClass: function() {
              return TestView;
            }
          };
          model2 = {
            id: 'test-model-2',
            text: 'Test Model 2',
            serialize: function() {
              return {
                id: this.id,
                text: this.text
              };
            },
            getViewClass: function() {
              return TestView;
            }
          };
          paneModel.activateItem(model1);
          paneModel.activateItem(model2);
          expect(pane.itemViews.find('.test-view').length).toBe(initialViewCount + 2);
          paneModel.activatePreviousItem();
          expect(pane.itemViews.find('.test-view').length).toBe(initialViewCount + 2);
          paneModel.destroyItem(model2);
          expect(pane.itemViews.find('.test-view').length).toBe(initialViewCount + 1);
          paneModel.destroyItem(model1);
          return expect(pane.itemViews.find('.test-view').length).toBe(initialViewCount);
        });
      });
      return describe("when the new activeItem is a view", function() {
        return it("appends it to the itemViews div if it hasn't already been appended and shows it", function() {
          expect(pane.itemViews.find('#view-2')).not.toExist();
          paneModel.activateItem(view2);
          expect(pane.itemViews.find('#view-2')).toExist();
          paneModel.activateItem(view1);
          paneModel.activateItem(view2);
          return expect(pane.itemViews.find('#view-2').length).toBe(1);
        });
      });
    });
    describe("when an item is destroyed", function() {
      it("triggers the 'pane:item-removed' event with the item and its former index", function() {
        var itemRemovedHandler;
        itemRemovedHandler = jasmine.createSpy("itemRemovedHandler");
        pane.on('pane:item-removed', itemRemovedHandler);
        paneModel.destroyItem(editor1);
        expect(itemRemovedHandler).toHaveBeenCalled();
        return expect(itemRemovedHandler.argsForCall[0].slice(1, 3)).toEqual([editor1, 1]);
      });
      describe("when the destroyed item is a view", function() {
        return it("removes the item from the 'item-views' div", function() {
          expect(view1.parent()).toMatchSelector(pane.itemViews);
          paneModel.destroyItem(view1);
          return expect(view1.parent()).not.toMatchSelector(pane.itemViews);
        });
      });
      return describe("when the destroyed item is a model", function() {
        return it("removes the associated view", function() {
          paneModel.activateItem(editor1);
          expect(pane.itemViews.find('.editor').length).toBe(1);
          pane.destroyItem(editor1);
          return expect(pane.itemViews.find('.editor').length).toBe(0);
        });
      });
    });
    describe("when an item is moved within the same pane", function() {
      return it("emits a 'pane:item-moved' event with the item and the new index", function() {
        var itemMovedHandler;
        pane.on('pane:item-moved', itemMovedHandler = jasmine.createSpy("itemMovedHandler"));
        paneModel.moveItem(view1, 2);
        expect(itemMovedHandler).toHaveBeenCalled();
        return expect(itemMovedHandler.argsForCall[0].slice(1, 3)).toEqual([view1, 2]);
      });
    });
    describe("when an item is moved to another pane", function() {
      return it("detaches the item's view rather than removing it", function() {
        var paneModel2;
        paneModel2 = paneModel.splitRight();
        view1.data('preservative', 1234);
        paneModel.moveItemToPane(view1, paneModel2, 1);
        expect(view1.data('preservative')).toBe(1234);
        paneModel2.activateItemAtIndex(1);
        return expect(view1.data('preservative')).toBe(1234);
      });
    });
    describe("when the title of the active item changes", function() {
      describe('when there is no onDidChangeTitle method', function() {
        beforeEach(function() {
          view1.onDidChangeTitle = null;
          view2.onDidChangeTitle = null;
          pane.activateItem(view2);
          return pane.activateItem(view1);
        });
        return it("emits pane:active-item-title-changed", function() {
          var activeItemTitleChangedHandler;
          activeItemTitleChangedHandler = jasmine.createSpy("activeItemTitleChangedHandler");
          pane.on('pane:active-item-title-changed', activeItemTitleChangedHandler);
          expect(pane.getActiveItem()).toBe(view1);
          view2.trigger('title-changed');
          expect(activeItemTitleChangedHandler).not.toHaveBeenCalled();
          view1.trigger('title-changed');
          expect(activeItemTitleChangedHandler).toHaveBeenCalled();
          activeItemTitleChangedHandler.reset();
          pane.activateItem(view2);
          view2.trigger('title-changed');
          return expect(activeItemTitleChangedHandler).toHaveBeenCalled();
        });
      });
      return describe('when there is a onDidChangeTitle method', function() {
        return it("emits pane:active-item-title-changed", function() {
          var activeItemTitleChangedHandler;
          activeItemTitleChangedHandler = jasmine.createSpy("activeItemTitleChangedHandler");
          pane.on('pane:active-item-title-changed', activeItemTitleChangedHandler);
          expect(pane.getActiveItem()).toBe(view1);
          view2.changeTitle();
          expect(activeItemTitleChangedHandler).not.toHaveBeenCalled();
          view1.changeTitle();
          expect(activeItemTitleChangedHandler).toHaveBeenCalled();
          activeItemTitleChangedHandler.reset();
          pane.activateItem(view2);
          view2.changeTitle();
          return expect(activeItemTitleChangedHandler).toHaveBeenCalled();
        });
      });
    });
    describe("when an unmodifed buffer's path is deleted", function() {
      return it("removes the pane item", function() {
        var editor, filePath;
        editor = null;
        jasmine.unspy(window, 'setTimeout');
        filePath = path.join(temp.mkdirSync(), 'file.txt');
        fs.writeFileSync(filePath, '');
        waitsForPromise(function() {
          return atom.workspace.open(filePath).then(function(o) {
            return editor = o;
          });
        });
        runs(function() {
          pane.activateItem(editor);
          expect(pane.items).toHaveLength(5);
          return fs.removeSync(filePath);
        });
        return waitsFor(function() {
          return pane.items.length === 4;
        });
      });
    });
    describe("when a pane is destroyed", function() {
      var pane2, pane2Model, _ref2;
      _ref2 = [], pane2 = _ref2[0], pane2Model = _ref2[1];
      beforeEach(function() {
        pane2Model = paneModel.splitRight();
        return pane2 = containerModel.getView(pane2Model).__spacePenView;
      });
      it("triggers a 'pane:removed' event with the pane", function() {
        var removedHandler;
        removedHandler = jasmine.createSpy("removedHandler");
        container.on('pane:removed', removedHandler);
        paneModel.destroy();
        expect(removedHandler).toHaveBeenCalled();
        return expect(removedHandler.argsForCall[0][1]).toBe(pane);
      });
      return describe("if the destroyed pane has focus", function() {
        var paneToLeft, paneToRight, _ref3;
        _ref3 = [], paneToLeft = _ref3[0], paneToRight = _ref3[1];
        return it("focuses the next pane", function() {
          container.attachToDom();
          pane2.activate();
          expect(pane.hasFocus()).toBe(false);
          expect(pane2.hasFocus()).toBe(true);
          pane2Model.destroy();
          return expect(pane.hasFocus()).toBe(true);
        });
      });
    });
    describe("::getNextPane()", function() {
      return it("returns the next pane if one exists, wrapping around from the last pane to the first", function() {
        var pane2;
        pane.activateItem(editor1);
        expect(pane.getNextPane()).toBeUndefined;
        pane2 = pane.splitRight(pane.copyActiveItem());
        expect(pane.getNextPane()).toBe(pane2);
        return expect(pane2.getNextPane()).toBe(pane);
      });
    });
    describe("when the pane's active status changes", function() {
      var pane2, pane2Model, _ref2;
      _ref2 = [], pane2 = _ref2[0], pane2Model = _ref2[1];
      beforeEach(function() {
        pane2Model = paneModel.splitRight({
          items: [pane.copyActiveItem()]
        });
        pane2 = containerModel.getView(pane2Model).__spacePenView;
        return expect(pane2Model.isActive()).toBe(true);
      });
      it("adds or removes the .active class as appropriate", function() {
        expect(pane).not.toHaveClass('active');
        paneModel.activate();
        expect(pane).toHaveClass('active');
        pane2Model.activate();
        return expect(pane).not.toHaveClass('active');
      });
      return it("triggers 'pane:became-active' or 'pane:became-inactive' according to the current status", function() {
        var becameActiveHandler, becameInactiveHandler;
        pane.on('pane:became-active', becameActiveHandler = jasmine.createSpy("becameActiveHandler"));
        pane.on('pane:became-inactive', becameInactiveHandler = jasmine.createSpy("becameInactiveHandler"));
        paneModel.activate();
        expect(becameActiveHandler.callCount).toBe(1);
        expect(becameInactiveHandler.callCount).toBe(0);
        pane2Model.activate();
        expect(becameActiveHandler.callCount).toBe(1);
        return expect(becameInactiveHandler.callCount).toBe(1);
      });
    });
    describe("when the pane is focused", function() {
      beforeEach(function() {
        return container.attachToDom();
      });
      it("transfers focus to the active view", function() {
        var focusHandler;
        focusHandler = jasmine.createSpy("focusHandler");
        pane.getActiveItem().on('focus', focusHandler);
        pane.focus();
        return expect(focusHandler).toHaveBeenCalled();
      });
      return it("makes the pane active", function() {
        paneModel.splitRight({
          items: [pane.copyActiveItem()]
        });
        expect(paneModel.isActive()).toBe(false);
        pane.focus();
        return expect(paneModel.isActive()).toBe(true);
      });
    });
    describe("when a pane is split", function() {
      return it("builds the appropriate pane-row and pane-column views", function() {
        var pane1, pane1Model, pane2, pane2Model, pane3, pane3Model;
        pane1 = pane;
        pane1Model = pane.getModel();
        pane.activateItem(editor1);
        pane2Model = pane1Model.splitRight({
          items: [pane1Model.copyActiveItem()]
        });
        pane3Model = pane2Model.splitDown({
          items: [pane2Model.copyActiveItem()]
        });
        pane2 = pane2Model._view;
        pane2 = containerModel.getView(pane2Model).__spacePenView;
        pane3 = containerModel.getView(pane3Model).__spacePenView;
        expect(container.find('> .pane-row > .pane').toArray()).toEqual([pane1[0]]);
        expect(container.find('> .pane-row > .pane-column > .pane').toArray()).toEqual([pane2[0], pane3[0]]);
        pane1Model.destroy();
        return expect(container.find('> .pane-column > .pane').toArray()).toEqual([pane2[0], pane3[0]]);
      });
    });
    return describe("serialization", function() {
      return it("focuses the pane after attach only if had focus when serialized", function() {
        var container2, container3, pane2, pane3;
        container.attachToDom();
        pane.focus();
        container2 = new PaneContainerView(container.model.testSerialization());
        pane2 = container2.getRoot();
        container2.attachToDom();
        expect(pane2).toMatchSelector(':has(:focus)');
        $(document.activeElement).blur();
        container3 = new PaneContainerView(container.model.testSerialization());
        pane3 = container3.getRoot();
        container3.attachToDom();
        return expect(pane3).not.toMatchSelector(':has(:focus)');
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1FQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxpQkFBQSxHQUFvQixPQUFBLENBQVEsNEJBQVIsQ0FBcEIsQ0FBQTs7QUFBQSxFQUNBLFFBQUEsR0FBVyxPQUFBLENBQVEsa0JBQVIsQ0FEWCxDQUFBOztBQUFBLEVBRUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxTQUFSLENBRkwsQ0FBQTs7QUFBQSxFQUdDLFVBQVcsT0FBQSxDQUFRLFdBQVIsRUFBWCxPQUhELENBQUE7O0FBQUEsRUFJQSxPQUFZLE9BQUEsQ0FBUSxNQUFSLENBQVosRUFBQyxTQUFBLENBQUQsRUFBSSxZQUFBLElBSkosQ0FBQTs7QUFBQSxFQUtBLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUxQLENBQUE7O0FBQUEsRUFNQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FOUCxDQUFBOztBQUFBLEVBUUEsUUFBQSxDQUFTLFVBQVQsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLFFBQUEsMkZBQUE7QUFBQSxJQUFBLFFBQStFLEVBQS9FLEVBQUMsb0JBQUQsRUFBWSx5QkFBWixFQUE0QixnQkFBNUIsRUFBbUMsZ0JBQW5DLEVBQTBDLGtCQUExQyxFQUFtRCxrQkFBbkQsRUFBNEQsZUFBNUQsRUFBa0Usb0JBQWxFLENBQUE7QUFBQSxJQUVNO0FBQ0osaUNBQUEsQ0FBQTs7OztPQUFBOztBQUFBLE1BQUEsUUFBQyxDQUFBLFdBQUQsR0FBYyxTQUFDLElBQUQsR0FBQTtBQUFnQixZQUFBLFFBQUE7QUFBQSxRQUFkLFVBQUEsSUFBSSxZQUFBLElBQVUsQ0FBQTtlQUFJLElBQUEsUUFBQSxDQUFTO0FBQUEsVUFBQyxJQUFBLEVBQUQ7QUFBQSxVQUFLLE1BQUEsSUFBTDtTQUFULEVBQXBCO01BQUEsQ0FBZCxDQUFBOztBQUFBLE1BQ0EsUUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLElBQUQsR0FBQTtBQUFnQixZQUFBLFFBQUE7QUFBQSxRQUFkLFVBQUEsSUFBSSxZQUFBLElBQVUsQ0FBQTtlQUFBLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxVQUFBLE9BQUEsRUFBTyxXQUFQO0FBQUEsVUFBb0IsRUFBQSxFQUFJLEVBQXhCO0FBQUEsVUFBNEIsUUFBQSxFQUFVLENBQUEsQ0FBdEM7U0FBTCxFQUErQyxJQUEvQyxFQUFoQjtNQUFBLENBRFYsQ0FBQTs7QUFBQSx5QkFFQSxVQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7QUFDVixRQURZLElBQUMsQ0FBQSxVQUFBLElBQUksSUFBQyxDQUFBLFlBQUEsSUFDbEIsQ0FBQTtlQUFBLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FBQSxDQUFBLFFBREQ7TUFBQSxDQUZaLENBQUE7O0FBQUEseUJBSUEsU0FBQSxHQUFXLFNBQUEsR0FBQTtlQUFHO0FBQUEsVUFBRSxZQUFBLEVBQWMsVUFBaEI7QUFBQSxVQUE2QixJQUFELElBQUMsQ0FBQSxFQUE3QjtBQUFBLFVBQWtDLE1BQUQsSUFBQyxDQUFBLElBQWxDO1VBQUg7TUFBQSxDQUpYLENBQUE7O0FBQUEseUJBS0EsTUFBQSxHQUFRLFNBQUEsR0FBQTtlQUFHLElBQUMsQ0FBQSxHQUFKO01BQUEsQ0FMUixDQUFBOztBQUFBLHlCQU1BLE9BQUEsR0FBUyxTQUFDLEtBQUQsR0FBQTtlQUFXLGVBQUEsSUFBVyxJQUFDLENBQUEsRUFBRCxLQUFPLEtBQUssQ0FBQyxFQUF4QixJQUErQixJQUFDLENBQUEsSUFBRCxLQUFTLEtBQUssQ0FBQyxLQUF6RDtNQUFBLENBTlQsQ0FBQTs7QUFBQSx5QkFPQSxXQUFBLEdBQWEsU0FBQSxHQUFBO2VBQ1gsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsa0JBQWQsRUFBa0MsT0FBbEMsRUFEVztNQUFBLENBUGIsQ0FBQTs7QUFBQSx5QkFTQSxnQkFBQSxHQUFrQixTQUFDLFFBQUQsR0FBQTtlQUNoQixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxrQkFBWixFQUFnQyxRQUFoQyxFQURnQjtNQUFBLENBVGxCLENBQUE7O3NCQUFBOztPQURxQixLQUZ2QixDQUFBO0FBQUEsSUFlQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsTUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQW5CLENBQXVCLFFBQXZCLENBQUEsQ0FBQTtBQUFBLE1BQ0EsU0FBQSxHQUFZLEdBQUEsQ0FBQSxpQkFEWixDQUFBO0FBQUEsTUFFQSxjQUFBLEdBQWlCLFNBQVMsQ0FBQyxLQUYzQixDQUFBO0FBQUEsTUFHQSxLQUFBLEdBQVksSUFBQSxRQUFBLENBQVM7QUFBQSxRQUFBLEVBQUEsRUFBSSxRQUFKO0FBQUEsUUFBYyxJQUFBLEVBQU0sUUFBcEI7T0FBVCxDQUhaLENBQUE7QUFBQSxNQUlBLEtBQUEsR0FBWSxJQUFBLFFBQUEsQ0FBUztBQUFBLFFBQUEsRUFBQSxFQUFJLFFBQUo7QUFBQSxRQUFjLElBQUEsRUFBTSxRQUFwQjtPQUFULENBSlosQ0FBQTtBQUFBLE1BS0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7ZUFDZCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsV0FBcEIsQ0FBZ0MsQ0FBQyxJQUFqQyxDQUFzQyxTQUFDLENBQUQsR0FBQTtpQkFBTyxPQUFBLEdBQVUsRUFBakI7UUFBQSxDQUF0QyxFQURjO01BQUEsQ0FBaEIsQ0FMQSxDQUFBO0FBQUEsTUFRQSxlQUFBLENBQWdCLFNBQUEsR0FBQTtlQUNkLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixZQUFwQixDQUFpQyxDQUFDLElBQWxDLENBQXVDLFNBQUMsQ0FBRCxHQUFBO2lCQUFPLE9BQUEsR0FBVSxFQUFqQjtRQUFBLENBQXZDLEVBRGM7TUFBQSxDQUFoQixDQVJBLENBQUE7YUFXQSxJQUFBLENBQUssU0FBQSxHQUFBO0FBQ0gsUUFBQSxJQUFBLEdBQU8sU0FBUyxDQUFDLE9BQVYsQ0FBQSxDQUFQLENBQUE7QUFBQSxRQUNBLFNBQUEsR0FBWSxJQUFJLENBQUMsUUFBTCxDQUFBLENBRFosQ0FBQTtlQUVBLFNBQVMsQ0FBQyxRQUFWLENBQW1CLENBQUMsS0FBRCxFQUFRLE9BQVIsRUFBaUIsS0FBakIsRUFBd0IsT0FBeEIsQ0FBbkIsRUFIRztNQUFBLENBQUwsRUFaUztJQUFBLENBQVgsQ0FmQSxDQUFBO0FBQUEsSUFnQ0EsU0FBQSxDQUFVLFNBQUEsR0FBQTthQUNSLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBbkIsQ0FBMEIsUUFBMUIsRUFEUTtJQUFBLENBQVYsQ0FoQ0EsQ0FBQTtBQUFBLElBbUNBLFFBQUEsQ0FBUyxtQ0FBVCxFQUE4QyxTQUFBLEdBQUE7QUFDNUMsTUFBQSxFQUFBLENBQUcsNENBQUgsRUFBaUQsU0FBQSxHQUFBO0FBQy9DLFFBQUEsTUFBQSxDQUFPLElBQUksQ0FBQyxhQUFMLENBQUEsQ0FBUCxDQUE0QixDQUFDLElBQTdCLENBQWtDLEtBQWxDLENBQUEsQ0FBQTtBQUFBLFFBQ0EsTUFBQSxDQUFPLEtBQUssQ0FBQyxHQUFOLENBQVUsU0FBVixDQUFQLENBQTRCLENBQUMsR0FBRyxDQUFDLElBQWpDLENBQXNDLE1BQXRDLENBREEsQ0FBQTtBQUFBLFFBR0EsSUFBSSxDQUFDLFlBQUwsQ0FBa0IsS0FBbEIsQ0FIQSxDQUFBO0FBQUEsUUFJQSxNQUFBLENBQU8sS0FBSyxDQUFDLEdBQU4sQ0FBVSxTQUFWLENBQVAsQ0FBNEIsQ0FBQyxJQUE3QixDQUFrQyxNQUFsQyxDQUpBLENBQUE7ZUFLQSxNQUFBLENBQU8sS0FBSyxDQUFDLEdBQU4sQ0FBVSxTQUFWLENBQVAsQ0FBNEIsQ0FBQyxHQUFHLENBQUMsSUFBakMsQ0FBc0MsTUFBdEMsRUFOK0M7TUFBQSxDQUFqRCxDQUFBLENBQUE7QUFBQSxNQVFBLEVBQUEsQ0FBRyxxQ0FBSCxFQUEwQyxTQUFBLEdBQUE7QUFDeEMsWUFBQSxrQkFBQTtBQUFBLFFBQUEsa0JBQUEsR0FBcUIsT0FBTyxDQUFDLFNBQVIsQ0FBa0Isb0JBQWxCLENBQXJCLENBQUE7QUFBQSxRQUNBLFNBQVMsQ0FBQyxFQUFWLENBQWEsMEJBQWIsRUFBeUMsa0JBQXpDLENBREEsQ0FBQTtBQUFBLFFBR0EsTUFBQSxDQUFPLElBQUksQ0FBQyxhQUFMLENBQUEsQ0FBUCxDQUE0QixDQUFDLElBQTdCLENBQWtDLEtBQWxDLENBSEEsQ0FBQTtBQUFBLFFBSUEsU0FBUyxDQUFDLFlBQVYsQ0FBdUIsS0FBdkIsQ0FKQSxDQUFBO0FBQUEsUUFLQSxTQUFTLENBQUMsWUFBVixDQUF1QixLQUF2QixDQUxBLENBQUE7QUFBQSxRQU9BLE1BQUEsQ0FBTyxrQkFBa0IsQ0FBQyxTQUExQixDQUFvQyxDQUFDLElBQXJDLENBQTBDLENBQTFDLENBUEEsQ0FBQTtBQUFBLFFBUUEsTUFBQSxDQUFPLGtCQUFrQixDQUFDLFdBQVksQ0FBQSxDQUFBLENBQUcsQ0FBQSxDQUFBLENBQXpDLENBQTRDLENBQUMsSUFBN0MsQ0FBa0QsS0FBbEQsQ0FSQSxDQUFBO0FBQUEsUUFTQSxrQkFBa0IsQ0FBQyxLQUFuQixDQUFBLENBVEEsQ0FBQTtBQUFBLFFBV0EsU0FBUyxDQUFDLFlBQVYsQ0FBdUIsT0FBdkIsQ0FYQSxDQUFBO0FBQUEsUUFZQSxNQUFBLENBQU8sa0JBQVAsQ0FBMEIsQ0FBQyxnQkFBM0IsQ0FBQSxDQVpBLENBQUE7QUFBQSxRQWFBLE1BQUEsQ0FBTyxrQkFBa0IsQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUF6QyxDQUE0QyxDQUFDLElBQTdDLENBQWtELE9BQWxELENBYkEsQ0FBQTtlQWNBLGtCQUFrQixDQUFDLEtBQW5CLENBQUEsRUFmd0M7TUFBQSxDQUExQyxDQVJBLENBQUE7QUFBQSxNQXlCQSxFQUFBLENBQUcseUVBQUgsRUFBOEUsU0FBQSxHQUFBO0FBQzVFLFFBQUEsU0FBUyxDQUFDLFdBQVYsQ0FBQSxDQUFBLENBQUE7QUFBQSxRQUNBLElBQUksQ0FBQyxLQUFMLENBQUEsQ0FEQSxDQUFBO0FBQUEsUUFFQSxNQUFBLENBQU8sSUFBSSxDQUFDLFVBQVosQ0FBdUIsQ0FBQyxHQUFHLENBQUMsSUFBNUIsQ0FBaUMsS0FBakMsQ0FGQSxDQUFBO0FBQUEsUUFHQSxNQUFBLENBQU8sSUFBSSxDQUFDLFVBQVosQ0FBdUIsQ0FBQyxlQUF4QixDQUF3QyxRQUF4QyxDQUhBLENBQUE7QUFBQSxRQUlBLFNBQVMsQ0FBQyxZQUFWLENBQXVCLEtBQXZCLENBSkEsQ0FBQTtlQUtBLE1BQUEsQ0FBTyxLQUFQLENBQWEsQ0FBQyxlQUFkLENBQThCLFFBQTlCLEVBTjRFO01BQUEsQ0FBOUUsQ0F6QkEsQ0FBQTtBQUFBLE1BaUNBLFFBQUEsQ0FBUyxvQ0FBVCxFQUErQyxTQUFBLEdBQUE7ZUFDN0MsRUFBQSxDQUFHLG1GQUFILEVBQXdGLFNBQUEsR0FBQTtBQUN0RixjQUFBLGdDQUFBO0FBQUEsVUFBQSxnQkFBQSxHQUFtQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsWUFBcEIsQ0FBaUMsQ0FBQyxNQUFyRCxDQUFBO0FBQUEsVUFFQSxNQUFBLEdBQ0U7QUFBQSxZQUFBLEVBQUEsRUFBSSxjQUFKO0FBQUEsWUFDQSxJQUFBLEVBQU0sY0FETjtBQUFBLFlBRUEsU0FBQSxFQUFXLFNBQUEsR0FBQTtxQkFBRztBQUFBLGdCQUFFLElBQUQsSUFBQyxDQUFBLEVBQUY7QUFBQSxnQkFBTyxNQUFELElBQUMsQ0FBQSxJQUFQO2dCQUFIO1lBQUEsQ0FGWDtBQUFBLFlBR0EsWUFBQSxFQUFjLFNBQUEsR0FBQTtxQkFBRyxTQUFIO1lBQUEsQ0FIZDtXQUhGLENBQUE7QUFBQSxVQVFBLE1BQUEsR0FDRTtBQUFBLFlBQUEsRUFBQSxFQUFJLGNBQUo7QUFBQSxZQUNBLElBQUEsRUFBTSxjQUROO0FBQUEsWUFFQSxTQUFBLEVBQVcsU0FBQSxHQUFBO3FCQUFHO0FBQUEsZ0JBQUUsSUFBRCxJQUFDLENBQUEsRUFBRjtBQUFBLGdCQUFPLE1BQUQsSUFBQyxDQUFBLElBQVA7Z0JBQUg7WUFBQSxDQUZYO0FBQUEsWUFHQSxZQUFBLEVBQWMsU0FBQSxHQUFBO3FCQUFHLFNBQUg7WUFBQSxDQUhkO1dBVEYsQ0FBQTtBQUFBLFVBY0EsU0FBUyxDQUFDLFlBQVYsQ0FBdUIsTUFBdkIsQ0FkQSxDQUFBO0FBQUEsVUFlQSxTQUFTLENBQUMsWUFBVixDQUF1QixNQUF2QixDQWZBLENBQUE7QUFBQSxVQWdCQSxNQUFBLENBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFlBQXBCLENBQWlDLENBQUMsTUFBekMsQ0FBZ0QsQ0FBQyxJQUFqRCxDQUFzRCxnQkFBQSxHQUFtQixDQUF6RSxDQWhCQSxDQUFBO0FBQUEsVUFrQkEsU0FBUyxDQUFDLG9CQUFWLENBQUEsQ0FsQkEsQ0FBQTtBQUFBLFVBbUJBLE1BQUEsQ0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsWUFBcEIsQ0FBaUMsQ0FBQyxNQUF6QyxDQUFnRCxDQUFDLElBQWpELENBQXNELGdCQUFBLEdBQW1CLENBQXpFLENBbkJBLENBQUE7QUFBQSxVQXFCQSxTQUFTLENBQUMsV0FBVixDQUFzQixNQUF0QixDQXJCQSxDQUFBO0FBQUEsVUFzQkEsTUFBQSxDQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixZQUFwQixDQUFpQyxDQUFDLE1BQXpDLENBQWdELENBQUMsSUFBakQsQ0FBc0QsZ0JBQUEsR0FBbUIsQ0FBekUsQ0F0QkEsQ0FBQTtBQUFBLFVBd0JBLFNBQVMsQ0FBQyxXQUFWLENBQXNCLE1BQXRCLENBeEJBLENBQUE7aUJBeUJBLE1BQUEsQ0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsWUFBcEIsQ0FBaUMsQ0FBQyxNQUF6QyxDQUFnRCxDQUFDLElBQWpELENBQXNELGdCQUF0RCxFQTFCc0Y7UUFBQSxDQUF4RixFQUQ2QztNQUFBLENBQS9DLENBakNBLENBQUE7YUE4REEsUUFBQSxDQUFTLG1DQUFULEVBQThDLFNBQUEsR0FBQTtlQUM1QyxFQUFBLENBQUcsaUZBQUgsRUFBc0YsU0FBQSxHQUFBO0FBQ3BGLFVBQUEsTUFBQSxDQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBZixDQUFvQixTQUFwQixDQUFQLENBQXNDLENBQUMsR0FBRyxDQUFDLE9BQTNDLENBQUEsQ0FBQSxDQUFBO0FBQUEsVUFDQSxTQUFTLENBQUMsWUFBVixDQUF1QixLQUF2QixDQURBLENBQUE7QUFBQSxVQUVBLE1BQUEsQ0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsU0FBcEIsQ0FBUCxDQUFzQyxDQUFDLE9BQXZDLENBQUEsQ0FGQSxDQUFBO0FBQUEsVUFHQSxTQUFTLENBQUMsWUFBVixDQUF1QixLQUF2QixDQUhBLENBQUE7QUFBQSxVQUlBLFNBQVMsQ0FBQyxZQUFWLENBQXVCLEtBQXZCLENBSkEsQ0FBQTtpQkFLQSxNQUFBLENBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFNBQXBCLENBQThCLENBQUMsTUFBdEMsQ0FBNkMsQ0FBQyxJQUE5QyxDQUFtRCxDQUFuRCxFQU5vRjtRQUFBLENBQXRGLEVBRDRDO01BQUEsQ0FBOUMsRUEvRDRDO0lBQUEsQ0FBOUMsQ0FuQ0EsQ0FBQTtBQUFBLElBMkdBLFFBQUEsQ0FBUywyQkFBVCxFQUFzQyxTQUFBLEdBQUE7QUFDcEMsTUFBQSxFQUFBLENBQUcsMkVBQUgsRUFBZ0YsU0FBQSxHQUFBO0FBQzlFLFlBQUEsa0JBQUE7QUFBQSxRQUFBLGtCQUFBLEdBQXFCLE9BQU8sQ0FBQyxTQUFSLENBQWtCLG9CQUFsQixDQUFyQixDQUFBO0FBQUEsUUFDQSxJQUFJLENBQUMsRUFBTCxDQUFRLG1CQUFSLEVBQTZCLGtCQUE3QixDQURBLENBQUE7QUFBQSxRQUVBLFNBQVMsQ0FBQyxXQUFWLENBQXNCLE9BQXRCLENBRkEsQ0FBQTtBQUFBLFFBR0EsTUFBQSxDQUFPLGtCQUFQLENBQTBCLENBQUMsZ0JBQTNCLENBQUEsQ0FIQSxDQUFBO2VBSUEsTUFBQSxDQUFPLGtCQUFrQixDQUFDLFdBQVksQ0FBQSxDQUFBLENBQUcsWUFBekMsQ0FBK0MsQ0FBQyxPQUFoRCxDQUF3RCxDQUFDLE9BQUQsRUFBVSxDQUFWLENBQXhELEVBTDhFO01BQUEsQ0FBaEYsQ0FBQSxDQUFBO0FBQUEsTUFPQSxRQUFBLENBQVMsbUNBQVQsRUFBOEMsU0FBQSxHQUFBO2VBQzVDLEVBQUEsQ0FBRyw0Q0FBSCxFQUFpRCxTQUFBLEdBQUE7QUFDL0MsVUFBQSxNQUFBLENBQU8sS0FBSyxDQUFDLE1BQU4sQ0FBQSxDQUFQLENBQXNCLENBQUMsZUFBdkIsQ0FBdUMsSUFBSSxDQUFDLFNBQTVDLENBQUEsQ0FBQTtBQUFBLFVBQ0EsU0FBUyxDQUFDLFdBQVYsQ0FBc0IsS0FBdEIsQ0FEQSxDQUFBO2lCQUVBLE1BQUEsQ0FBTyxLQUFLLENBQUMsTUFBTixDQUFBLENBQVAsQ0FBc0IsQ0FBQyxHQUFHLENBQUMsZUFBM0IsQ0FBMkMsSUFBSSxDQUFDLFNBQWhELEVBSCtDO1FBQUEsQ0FBakQsRUFENEM7TUFBQSxDQUE5QyxDQVBBLENBQUE7YUFhQSxRQUFBLENBQVMsb0NBQVQsRUFBK0MsU0FBQSxHQUFBO2VBQzdDLEVBQUEsQ0FBRyw2QkFBSCxFQUFrQyxTQUFBLEdBQUE7QUFDaEMsVUFBQSxTQUFTLENBQUMsWUFBVixDQUF1QixPQUF2QixDQUFBLENBQUE7QUFBQSxVQUNBLE1BQUEsQ0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsU0FBcEIsQ0FBOEIsQ0FBQyxNQUF0QyxDQUE2QyxDQUFDLElBQTlDLENBQW1ELENBQW5ELENBREEsQ0FBQTtBQUFBLFVBRUEsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsT0FBakIsQ0FGQSxDQUFBO2lCQUdBLE1BQUEsQ0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsU0FBcEIsQ0FBOEIsQ0FBQyxNQUF0QyxDQUE2QyxDQUFDLElBQTlDLENBQW1ELENBQW5ELEVBSmdDO1FBQUEsQ0FBbEMsRUFENkM7TUFBQSxDQUEvQyxFQWRvQztJQUFBLENBQXRDLENBM0dBLENBQUE7QUFBQSxJQWdJQSxRQUFBLENBQVMsNENBQVQsRUFBdUQsU0FBQSxHQUFBO2FBQ3JELEVBQUEsQ0FBRyxpRUFBSCxFQUFzRSxTQUFBLEdBQUE7QUFDcEUsWUFBQSxnQkFBQTtBQUFBLFFBQUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxpQkFBUixFQUEyQixnQkFBQSxHQUFtQixPQUFPLENBQUMsU0FBUixDQUFrQixrQkFBbEIsQ0FBOUMsQ0FBQSxDQUFBO0FBQUEsUUFDQSxTQUFTLENBQUMsUUFBVixDQUFtQixLQUFuQixFQUEwQixDQUExQixDQURBLENBQUE7QUFBQSxRQUVBLE1BQUEsQ0FBTyxnQkFBUCxDQUF3QixDQUFDLGdCQUF6QixDQUFBLENBRkEsQ0FBQTtlQUdBLE1BQUEsQ0FBTyxnQkFBZ0IsQ0FBQyxXQUFZLENBQUEsQ0FBQSxDQUFHLFlBQXZDLENBQTZDLENBQUMsT0FBOUMsQ0FBc0QsQ0FBQyxLQUFELEVBQVEsQ0FBUixDQUF0RCxFQUpvRTtNQUFBLENBQXRFLEVBRHFEO0lBQUEsQ0FBdkQsQ0FoSUEsQ0FBQTtBQUFBLElBdUlBLFFBQUEsQ0FBUyx1Q0FBVCxFQUFrRCxTQUFBLEdBQUE7YUFDaEQsRUFBQSxDQUFHLGtEQUFILEVBQXVELFNBQUEsR0FBQTtBQUNyRCxZQUFBLFVBQUE7QUFBQSxRQUFBLFVBQUEsR0FBYSxTQUFTLENBQUMsVUFBVixDQUFBLENBQWIsQ0FBQTtBQUFBLFFBQ0EsS0FBSyxDQUFDLElBQU4sQ0FBVyxjQUFYLEVBQTJCLElBQTNCLENBREEsQ0FBQTtBQUFBLFFBRUEsU0FBUyxDQUFDLGNBQVYsQ0FBeUIsS0FBekIsRUFBZ0MsVUFBaEMsRUFBNEMsQ0FBNUMsQ0FGQSxDQUFBO0FBQUEsUUFHQSxNQUFBLENBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxjQUFYLENBQVAsQ0FBa0MsQ0FBQyxJQUFuQyxDQUF3QyxJQUF4QyxDQUhBLENBQUE7QUFBQSxRQUlBLFVBQVUsQ0FBQyxtQkFBWCxDQUErQixDQUEvQixDQUpBLENBQUE7ZUFLQSxNQUFBLENBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxjQUFYLENBQVAsQ0FBa0MsQ0FBQyxJQUFuQyxDQUF3QyxJQUF4QyxFQU5xRDtNQUFBLENBQXZELEVBRGdEO0lBQUEsQ0FBbEQsQ0F2SUEsQ0FBQTtBQUFBLElBZ0pBLFFBQUEsQ0FBUywyQ0FBVCxFQUFzRCxTQUFBLEdBQUE7QUFDcEQsTUFBQSxRQUFBLENBQVMsMENBQVQsRUFBcUQsU0FBQSxHQUFBO0FBQ25ELFFBQUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFVBQUEsS0FBSyxDQUFDLGdCQUFOLEdBQXlCLElBQXpCLENBQUE7QUFBQSxVQUNBLEtBQUssQ0FBQyxnQkFBTixHQUF5QixJQUR6QixDQUFBO0FBQUEsVUFHQSxJQUFJLENBQUMsWUFBTCxDQUFrQixLQUFsQixDQUhBLENBQUE7aUJBSUEsSUFBSSxDQUFDLFlBQUwsQ0FBa0IsS0FBbEIsRUFMUztRQUFBLENBQVgsQ0FBQSxDQUFBO2VBT0EsRUFBQSxDQUFHLHNDQUFILEVBQTJDLFNBQUEsR0FBQTtBQUN6QyxjQUFBLDZCQUFBO0FBQUEsVUFBQSw2QkFBQSxHQUFnQyxPQUFPLENBQUMsU0FBUixDQUFrQiwrQkFBbEIsQ0FBaEMsQ0FBQTtBQUFBLFVBQ0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxnQ0FBUixFQUEwQyw2QkFBMUMsQ0FEQSxDQUFBO0FBQUEsVUFHQSxNQUFBLENBQU8sSUFBSSxDQUFDLGFBQUwsQ0FBQSxDQUFQLENBQTRCLENBQUMsSUFBN0IsQ0FBa0MsS0FBbEMsQ0FIQSxDQUFBO0FBQUEsVUFLQSxLQUFLLENBQUMsT0FBTixDQUFjLGVBQWQsQ0FMQSxDQUFBO0FBQUEsVUFNQSxNQUFBLENBQU8sNkJBQVAsQ0FBcUMsQ0FBQyxHQUFHLENBQUMsZ0JBQTFDLENBQUEsQ0FOQSxDQUFBO0FBQUEsVUFRQSxLQUFLLENBQUMsT0FBTixDQUFjLGVBQWQsQ0FSQSxDQUFBO0FBQUEsVUFTQSxNQUFBLENBQU8sNkJBQVAsQ0FBcUMsQ0FBQyxnQkFBdEMsQ0FBQSxDQVRBLENBQUE7QUFBQSxVQVVBLDZCQUE2QixDQUFDLEtBQTlCLENBQUEsQ0FWQSxDQUFBO0FBQUEsVUFZQSxJQUFJLENBQUMsWUFBTCxDQUFrQixLQUFsQixDQVpBLENBQUE7QUFBQSxVQWFBLEtBQUssQ0FBQyxPQUFOLENBQWMsZUFBZCxDQWJBLENBQUE7aUJBY0EsTUFBQSxDQUFPLDZCQUFQLENBQXFDLENBQUMsZ0JBQXRDLENBQUEsRUFmeUM7UUFBQSxDQUEzQyxFQVJtRDtNQUFBLENBQXJELENBQUEsQ0FBQTthQXlCQSxRQUFBLENBQVMseUNBQVQsRUFBb0QsU0FBQSxHQUFBO2VBQ2xELEVBQUEsQ0FBRyxzQ0FBSCxFQUEyQyxTQUFBLEdBQUE7QUFDekMsY0FBQSw2QkFBQTtBQUFBLFVBQUEsNkJBQUEsR0FBZ0MsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsK0JBQWxCLENBQWhDLENBQUE7QUFBQSxVQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsZ0NBQVIsRUFBMEMsNkJBQTFDLENBREEsQ0FBQTtBQUFBLFVBR0EsTUFBQSxDQUFPLElBQUksQ0FBQyxhQUFMLENBQUEsQ0FBUCxDQUE0QixDQUFDLElBQTdCLENBQWtDLEtBQWxDLENBSEEsQ0FBQTtBQUFBLFVBSUEsS0FBSyxDQUFDLFdBQU4sQ0FBQSxDQUpBLENBQUE7QUFBQSxVQUtBLE1BQUEsQ0FBTyw2QkFBUCxDQUFxQyxDQUFDLEdBQUcsQ0FBQyxnQkFBMUMsQ0FBQSxDQUxBLENBQUE7QUFBQSxVQU9BLEtBQUssQ0FBQyxXQUFOLENBQUEsQ0FQQSxDQUFBO0FBQUEsVUFRQSxNQUFBLENBQU8sNkJBQVAsQ0FBcUMsQ0FBQyxnQkFBdEMsQ0FBQSxDQVJBLENBQUE7QUFBQSxVQVNBLDZCQUE2QixDQUFDLEtBQTlCLENBQUEsQ0FUQSxDQUFBO0FBQUEsVUFXQSxJQUFJLENBQUMsWUFBTCxDQUFrQixLQUFsQixDQVhBLENBQUE7QUFBQSxVQVlBLEtBQUssQ0FBQyxXQUFOLENBQUEsQ0FaQSxDQUFBO2lCQWFBLE1BQUEsQ0FBTyw2QkFBUCxDQUFxQyxDQUFDLGdCQUF0QyxDQUFBLEVBZHlDO1FBQUEsQ0FBM0MsRUFEa0Q7TUFBQSxDQUFwRCxFQTFCb0Q7SUFBQSxDQUF0RCxDQWhKQSxDQUFBO0FBQUEsSUEyTEEsUUFBQSxDQUFTLDRDQUFULEVBQXVELFNBQUEsR0FBQTthQUNyRCxFQUFBLENBQUcsdUJBQUgsRUFBNEIsU0FBQSxHQUFBO0FBQzFCLFlBQUEsZ0JBQUE7QUFBQSxRQUFBLE1BQUEsR0FBUyxJQUFULENBQUE7QUFBQSxRQUNBLE9BQU8sQ0FBQyxLQUFSLENBQWMsTUFBZCxFQUFzQixZQUF0QixDQURBLENBQUE7QUFBQSxRQUVBLFFBQUEsR0FBVyxJQUFJLENBQUMsSUFBTCxDQUFVLElBQUksQ0FBQyxTQUFMLENBQUEsQ0FBVixFQUE0QixVQUE1QixDQUZYLENBQUE7QUFBQSxRQUdBLEVBQUUsQ0FBQyxhQUFILENBQWlCLFFBQWpCLEVBQTJCLEVBQTNCLENBSEEsQ0FBQTtBQUFBLFFBS0EsZUFBQSxDQUFnQixTQUFBLEdBQUE7aUJBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFFBQXBCLENBQTZCLENBQUMsSUFBOUIsQ0FBbUMsU0FBQyxDQUFELEdBQUE7bUJBQU8sTUFBQSxHQUFTLEVBQWhCO1VBQUEsQ0FBbkMsRUFEYztRQUFBLENBQWhCLENBTEEsQ0FBQTtBQUFBLFFBUUEsSUFBQSxDQUFLLFNBQUEsR0FBQTtBQUNILFVBQUEsSUFBSSxDQUFDLFlBQUwsQ0FBa0IsTUFBbEIsQ0FBQSxDQUFBO0FBQUEsVUFDQSxNQUFBLENBQU8sSUFBSSxDQUFDLEtBQVosQ0FBa0IsQ0FBQyxZQUFuQixDQUFnQyxDQUFoQyxDQURBLENBQUE7aUJBRUEsRUFBRSxDQUFDLFVBQUgsQ0FBYyxRQUFkLEVBSEc7UUFBQSxDQUFMLENBUkEsQ0FBQTtlQWFBLFFBQUEsQ0FBUyxTQUFBLEdBQUE7aUJBQ1AsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFYLEtBQXFCLEVBRGQ7UUFBQSxDQUFULEVBZDBCO01BQUEsQ0FBNUIsRUFEcUQ7SUFBQSxDQUF2RCxDQTNMQSxDQUFBO0FBQUEsSUE2TUEsUUFBQSxDQUFTLDBCQUFULEVBQXFDLFNBQUEsR0FBQTtBQUNuQyxVQUFBLHdCQUFBO0FBQUEsTUFBQSxRQUFzQixFQUF0QixFQUFDLGdCQUFELEVBQVEscUJBQVIsQ0FBQTtBQUFBLE1BRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULFFBQUEsVUFBQSxHQUFhLFNBQVMsQ0FBQyxVQUFWLENBQUEsQ0FBYixDQUFBO2VBQ0EsS0FBQSxHQUFRLGNBQWMsQ0FBQyxPQUFmLENBQXVCLFVBQXZCLENBQWtDLENBQUMsZUFGbEM7TUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLE1BTUEsRUFBQSxDQUFHLCtDQUFILEVBQW9ELFNBQUEsR0FBQTtBQUNsRCxZQUFBLGNBQUE7QUFBQSxRQUFBLGNBQUEsR0FBaUIsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsZ0JBQWxCLENBQWpCLENBQUE7QUFBQSxRQUNBLFNBQVMsQ0FBQyxFQUFWLENBQWEsY0FBYixFQUE2QixjQUE3QixDQURBLENBQUE7QUFBQSxRQUVBLFNBQVMsQ0FBQyxPQUFWLENBQUEsQ0FGQSxDQUFBO0FBQUEsUUFHQSxNQUFBLENBQU8sY0FBUCxDQUFzQixDQUFDLGdCQUF2QixDQUFBLENBSEEsQ0FBQTtlQUlBLE1BQUEsQ0FBTyxjQUFjLENBQUMsV0FBWSxDQUFBLENBQUEsQ0FBRyxDQUFBLENBQUEsQ0FBckMsQ0FBd0MsQ0FBQyxJQUF6QyxDQUE4QyxJQUE5QyxFQUxrRDtNQUFBLENBQXBELENBTkEsQ0FBQTthQWFBLFFBQUEsQ0FBUyxpQ0FBVCxFQUE0QyxTQUFBLEdBQUE7QUFDMUMsWUFBQSw4QkFBQTtBQUFBLFFBQUEsUUFBNEIsRUFBNUIsRUFBQyxxQkFBRCxFQUFhLHNCQUFiLENBQUE7ZUFFQSxFQUFBLENBQUcsdUJBQUgsRUFBNEIsU0FBQSxHQUFBO0FBQzFCLFVBQUEsU0FBUyxDQUFDLFdBQVYsQ0FBQSxDQUFBLENBQUE7QUFBQSxVQUNBLEtBQUssQ0FBQyxRQUFOLENBQUEsQ0FEQSxDQUFBO0FBQUEsVUFFQSxNQUFBLENBQU8sSUFBSSxDQUFDLFFBQUwsQ0FBQSxDQUFQLENBQXVCLENBQUMsSUFBeEIsQ0FBNkIsS0FBN0IsQ0FGQSxDQUFBO0FBQUEsVUFHQSxNQUFBLENBQU8sS0FBSyxDQUFDLFFBQU4sQ0FBQSxDQUFQLENBQXdCLENBQUMsSUFBekIsQ0FBOEIsSUFBOUIsQ0FIQSxDQUFBO0FBQUEsVUFJQSxVQUFVLENBQUMsT0FBWCxDQUFBLENBSkEsQ0FBQTtpQkFLQSxNQUFBLENBQU8sSUFBSSxDQUFDLFFBQUwsQ0FBQSxDQUFQLENBQXVCLENBQUMsSUFBeEIsQ0FBNkIsSUFBN0IsRUFOMEI7UUFBQSxDQUE1QixFQUgwQztNQUFBLENBQTVDLEVBZG1DO0lBQUEsQ0FBckMsQ0E3TUEsQ0FBQTtBQUFBLElBc09BLFFBQUEsQ0FBUyxpQkFBVCxFQUE0QixTQUFBLEdBQUE7YUFDMUIsRUFBQSxDQUFHLHNGQUFILEVBQTJGLFNBQUEsR0FBQTtBQUN6RixZQUFBLEtBQUE7QUFBQSxRQUFBLElBQUksQ0FBQyxZQUFMLENBQWtCLE9BQWxCLENBQUEsQ0FBQTtBQUFBLFFBQ0EsTUFBQSxDQUFPLElBQUksQ0FBQyxXQUFMLENBQUEsQ0FBUCxDQUEwQixDQUFDLGFBRDNCLENBQUE7QUFBQSxRQUVBLEtBQUEsR0FBUSxJQUFJLENBQUMsVUFBTCxDQUFnQixJQUFJLENBQUMsY0FBTCxDQUFBLENBQWhCLENBRlIsQ0FBQTtBQUFBLFFBR0EsTUFBQSxDQUFPLElBQUksQ0FBQyxXQUFMLENBQUEsQ0FBUCxDQUEwQixDQUFDLElBQTNCLENBQWdDLEtBQWhDLENBSEEsQ0FBQTtlQUlBLE1BQUEsQ0FBTyxLQUFLLENBQUMsV0FBTixDQUFBLENBQVAsQ0FBMkIsQ0FBQyxJQUE1QixDQUFpQyxJQUFqQyxFQUx5RjtNQUFBLENBQTNGLEVBRDBCO0lBQUEsQ0FBNUIsQ0F0T0EsQ0FBQTtBQUFBLElBOE9BLFFBQUEsQ0FBUyx1Q0FBVCxFQUFrRCxTQUFBLEdBQUE7QUFDaEQsVUFBQSx3QkFBQTtBQUFBLE1BQUEsUUFBc0IsRUFBdEIsRUFBQyxnQkFBRCxFQUFRLHFCQUFSLENBQUE7QUFBQSxNQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxRQUFBLFVBQUEsR0FBYSxTQUFTLENBQUMsVUFBVixDQUFxQjtBQUFBLFVBQUEsS0FBQSxFQUFPLENBQUMsSUFBSSxDQUFDLGNBQUwsQ0FBQSxDQUFELENBQVA7U0FBckIsQ0FBYixDQUFBO0FBQUEsUUFDQSxLQUFBLEdBQVEsY0FBYyxDQUFDLE9BQWYsQ0FBdUIsVUFBdkIsQ0FBa0MsQ0FBQyxjQUQzQyxDQUFBO2VBRUEsTUFBQSxDQUFPLFVBQVUsQ0FBQyxRQUFYLENBQUEsQ0FBUCxDQUE2QixDQUFDLElBQTlCLENBQW1DLElBQW5DLEVBSFM7TUFBQSxDQUFYLENBRkEsQ0FBQTtBQUFBLE1BT0EsRUFBQSxDQUFHLGtEQUFILEVBQXVELFNBQUEsR0FBQTtBQUNyRCxRQUFBLE1BQUEsQ0FBTyxJQUFQLENBQVksQ0FBQyxHQUFHLENBQUMsV0FBakIsQ0FBNkIsUUFBN0IsQ0FBQSxDQUFBO0FBQUEsUUFDQSxTQUFTLENBQUMsUUFBVixDQUFBLENBREEsQ0FBQTtBQUFBLFFBRUEsTUFBQSxDQUFPLElBQVAsQ0FBWSxDQUFDLFdBQWIsQ0FBeUIsUUFBekIsQ0FGQSxDQUFBO0FBQUEsUUFHQSxVQUFVLENBQUMsUUFBWCxDQUFBLENBSEEsQ0FBQTtlQUlBLE1BQUEsQ0FBTyxJQUFQLENBQVksQ0FBQyxHQUFHLENBQUMsV0FBakIsQ0FBNkIsUUFBN0IsRUFMcUQ7TUFBQSxDQUF2RCxDQVBBLENBQUE7YUFjQSxFQUFBLENBQUcseUZBQUgsRUFBOEYsU0FBQSxHQUFBO0FBQzVGLFlBQUEsMENBQUE7QUFBQSxRQUFBLElBQUksQ0FBQyxFQUFMLENBQVEsb0JBQVIsRUFBOEIsbUJBQUEsR0FBc0IsT0FBTyxDQUFDLFNBQVIsQ0FBa0IscUJBQWxCLENBQXBELENBQUEsQ0FBQTtBQUFBLFFBQ0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxzQkFBUixFQUFnQyxxQkFBQSxHQUF3QixPQUFPLENBQUMsU0FBUixDQUFrQix1QkFBbEIsQ0FBeEQsQ0FEQSxDQUFBO0FBQUEsUUFFQSxTQUFTLENBQUMsUUFBVixDQUFBLENBRkEsQ0FBQTtBQUFBLFFBSUEsTUFBQSxDQUFPLG1CQUFtQixDQUFDLFNBQTNCLENBQXFDLENBQUMsSUFBdEMsQ0FBMkMsQ0FBM0MsQ0FKQSxDQUFBO0FBQUEsUUFLQSxNQUFBLENBQU8scUJBQXFCLENBQUMsU0FBN0IsQ0FBdUMsQ0FBQyxJQUF4QyxDQUE2QyxDQUE3QyxDQUxBLENBQUE7QUFBQSxRQU9BLFVBQVUsQ0FBQyxRQUFYLENBQUEsQ0FQQSxDQUFBO0FBQUEsUUFRQSxNQUFBLENBQU8sbUJBQW1CLENBQUMsU0FBM0IsQ0FBcUMsQ0FBQyxJQUF0QyxDQUEyQyxDQUEzQyxDQVJBLENBQUE7ZUFTQSxNQUFBLENBQU8scUJBQXFCLENBQUMsU0FBN0IsQ0FBdUMsQ0FBQyxJQUF4QyxDQUE2QyxDQUE3QyxFQVY0RjtNQUFBLENBQTlGLEVBZmdEO0lBQUEsQ0FBbEQsQ0E5T0EsQ0FBQTtBQUFBLElBeVFBLFFBQUEsQ0FBUywwQkFBVCxFQUFxQyxTQUFBLEdBQUE7QUFDbkMsTUFBQSxVQUFBLENBQVcsU0FBQSxHQUFBO2VBQ1QsU0FBUyxDQUFDLFdBQVYsQ0FBQSxFQURTO01BQUEsQ0FBWCxDQUFBLENBQUE7QUFBQSxNQUdBLEVBQUEsQ0FBRyxvQ0FBSCxFQUF5QyxTQUFBLEdBQUE7QUFDdkMsWUFBQSxZQUFBO0FBQUEsUUFBQSxZQUFBLEdBQWUsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsY0FBbEIsQ0FBZixDQUFBO0FBQUEsUUFDQSxJQUFJLENBQUMsYUFBTCxDQUFBLENBQW9CLENBQUMsRUFBckIsQ0FBd0IsT0FBeEIsRUFBaUMsWUFBakMsQ0FEQSxDQUFBO0FBQUEsUUFFQSxJQUFJLENBQUMsS0FBTCxDQUFBLENBRkEsQ0FBQTtlQUdBLE1BQUEsQ0FBTyxZQUFQLENBQW9CLENBQUMsZ0JBQXJCLENBQUEsRUFKdUM7TUFBQSxDQUF6QyxDQUhBLENBQUE7YUFTQSxFQUFBLENBQUcsdUJBQUgsRUFBNEIsU0FBQSxHQUFBO0FBQzFCLFFBQUEsU0FBUyxDQUFDLFVBQVYsQ0FBcUI7QUFBQSxVQUFBLEtBQUEsRUFBTyxDQUFDLElBQUksQ0FBQyxjQUFMLENBQUEsQ0FBRCxDQUFQO1NBQXJCLENBQUEsQ0FBQTtBQUFBLFFBQ0EsTUFBQSxDQUFPLFNBQVMsQ0FBQyxRQUFWLENBQUEsQ0FBUCxDQUE0QixDQUFDLElBQTdCLENBQWtDLEtBQWxDLENBREEsQ0FBQTtBQUFBLFFBRUEsSUFBSSxDQUFDLEtBQUwsQ0FBQSxDQUZBLENBQUE7ZUFHQSxNQUFBLENBQU8sU0FBUyxDQUFDLFFBQVYsQ0FBQSxDQUFQLENBQTRCLENBQUMsSUFBN0IsQ0FBa0MsSUFBbEMsRUFKMEI7TUFBQSxDQUE1QixFQVZtQztJQUFBLENBQXJDLENBelFBLENBQUE7QUFBQSxJQXlSQSxRQUFBLENBQVMsc0JBQVQsRUFBaUMsU0FBQSxHQUFBO2FBQy9CLEVBQUEsQ0FBRyx1REFBSCxFQUE0RCxTQUFBLEdBQUE7QUFDMUQsWUFBQSx1REFBQTtBQUFBLFFBQUEsS0FBQSxHQUFRLElBQVIsQ0FBQTtBQUFBLFFBQ0EsVUFBQSxHQUFhLElBQUksQ0FBQyxRQUFMLENBQUEsQ0FEYixDQUFBO0FBQUEsUUFFQSxJQUFJLENBQUMsWUFBTCxDQUFrQixPQUFsQixDQUZBLENBQUE7QUFBQSxRQUlBLFVBQUEsR0FBYSxVQUFVLENBQUMsVUFBWCxDQUFzQjtBQUFBLFVBQUEsS0FBQSxFQUFPLENBQUMsVUFBVSxDQUFDLGNBQVgsQ0FBQSxDQUFELENBQVA7U0FBdEIsQ0FKYixDQUFBO0FBQUEsUUFLQSxVQUFBLEdBQWEsVUFBVSxDQUFDLFNBQVgsQ0FBcUI7QUFBQSxVQUFBLEtBQUEsRUFBTyxDQUFDLFVBQVUsQ0FBQyxjQUFYLENBQUEsQ0FBRCxDQUFQO1NBQXJCLENBTGIsQ0FBQTtBQUFBLFFBTUEsS0FBQSxHQUFRLFVBQVUsQ0FBQyxLQU5uQixDQUFBO0FBQUEsUUFPQSxLQUFBLEdBQVEsY0FBYyxDQUFDLE9BQWYsQ0FBdUIsVUFBdkIsQ0FBa0MsQ0FBQyxjQVAzQyxDQUFBO0FBQUEsUUFRQSxLQUFBLEdBQVEsY0FBYyxDQUFDLE9BQWYsQ0FBdUIsVUFBdkIsQ0FBa0MsQ0FBQyxjQVIzQyxDQUFBO0FBQUEsUUFVQSxNQUFBLENBQU8sU0FBUyxDQUFDLElBQVYsQ0FBZSxxQkFBZixDQUFxQyxDQUFDLE9BQXRDLENBQUEsQ0FBUCxDQUF1RCxDQUFDLE9BQXhELENBQWdFLENBQUMsS0FBTSxDQUFBLENBQUEsQ0FBUCxDQUFoRSxDQVZBLENBQUE7QUFBQSxRQVdBLE1BQUEsQ0FBTyxTQUFTLENBQUMsSUFBVixDQUFlLG9DQUFmLENBQW9ELENBQUMsT0FBckQsQ0FBQSxDQUFQLENBQXNFLENBQUMsT0FBdkUsQ0FBK0UsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFQLEVBQVcsS0FBTSxDQUFBLENBQUEsQ0FBakIsQ0FBL0UsQ0FYQSxDQUFBO0FBQUEsUUFhQSxVQUFVLENBQUMsT0FBWCxDQUFBLENBYkEsQ0FBQTtlQWNBLE1BQUEsQ0FBTyxTQUFTLENBQUMsSUFBVixDQUFlLHdCQUFmLENBQXdDLENBQUMsT0FBekMsQ0FBQSxDQUFQLENBQTBELENBQUMsT0FBM0QsQ0FBbUUsQ0FBQyxLQUFNLENBQUEsQ0FBQSxDQUFQLEVBQVcsS0FBTSxDQUFBLENBQUEsQ0FBakIsQ0FBbkUsRUFmMEQ7TUFBQSxDQUE1RCxFQUQrQjtJQUFBLENBQWpDLENBelJBLENBQUE7V0EyU0EsUUFBQSxDQUFTLGVBQVQsRUFBMEIsU0FBQSxHQUFBO2FBQ3hCLEVBQUEsQ0FBRyxpRUFBSCxFQUFzRSxTQUFBLEdBQUE7QUFDcEUsWUFBQSxvQ0FBQTtBQUFBLFFBQUEsU0FBUyxDQUFDLFdBQVYsQ0FBQSxDQUFBLENBQUE7QUFBQSxRQUNBLElBQUksQ0FBQyxLQUFMLENBQUEsQ0FEQSxDQUFBO0FBQUEsUUFHQSxVQUFBLEdBQWlCLElBQUEsaUJBQUEsQ0FBa0IsU0FBUyxDQUFDLEtBQUssQ0FBQyxpQkFBaEIsQ0FBQSxDQUFsQixDQUhqQixDQUFBO0FBQUEsUUFJQSxLQUFBLEdBQVEsVUFBVSxDQUFDLE9BQVgsQ0FBQSxDQUpSLENBQUE7QUFBQSxRQUtBLFVBQVUsQ0FBQyxXQUFYLENBQUEsQ0FMQSxDQUFBO0FBQUEsUUFNQSxNQUFBLENBQU8sS0FBUCxDQUFhLENBQUMsZUFBZCxDQUE4QixjQUE5QixDQU5BLENBQUE7QUFBQSxRQVFBLENBQUEsQ0FBRSxRQUFRLENBQUMsYUFBWCxDQUF5QixDQUFDLElBQTFCLENBQUEsQ0FSQSxDQUFBO0FBQUEsUUFTQSxVQUFBLEdBQWlCLElBQUEsaUJBQUEsQ0FBa0IsU0FBUyxDQUFDLEtBQUssQ0FBQyxpQkFBaEIsQ0FBQSxDQUFsQixDQVRqQixDQUFBO0FBQUEsUUFVQSxLQUFBLEdBQVEsVUFBVSxDQUFDLE9BQVgsQ0FBQSxDQVZSLENBQUE7QUFBQSxRQVdBLFVBQVUsQ0FBQyxXQUFYLENBQUEsQ0FYQSxDQUFBO2VBWUEsTUFBQSxDQUFPLEtBQVAsQ0FBYSxDQUFDLEdBQUcsQ0FBQyxlQUFsQixDQUFrQyxjQUFsQyxFQWJvRTtNQUFBLENBQXRFLEVBRHdCO0lBQUEsQ0FBMUIsRUE1U21CO0VBQUEsQ0FBckIsQ0FSQSxDQUFBO0FBQUEiCn0=
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/pane-view-spec.coffee