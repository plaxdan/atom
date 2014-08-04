(function() {
  var $, $$, PaneContainerView, PaneView, View, path, temp, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  path = require('path');

  temp = require('temp');

  PaneContainerView = require('../src/pane-container-view');

  PaneView = require('../src/pane-view');

  _ref = require('atom'), $ = _ref.$, View = _ref.View, $$ = _ref.$$;

  describe("PaneContainerView", function() {
    var TestView, container, pane1, pane2, pane3, _ref1;
    _ref1 = [], TestView = _ref1[0], container = _ref1[1], pane1 = _ref1[2], pane2 = _ref1[3], pane3 = _ref1[4];
    beforeEach(function() {
      TestView = (function(_super) {
        __extends(TestView, _super);

        function TestView() {
          return TestView.__super__.constructor.apply(this, arguments);
        }

        atom.deserializers.add(TestView);

        TestView.deserialize = function(_arg) {
          var name;
          name = _arg.name;
          return new TestView(name);
        };

        TestView.content = function() {
          return this.div({
            tabindex: -1
          });
        };

        TestView.prototype.initialize = function(name) {
          this.name = name;
          return this.text(this.name);
        };

        TestView.prototype.serialize = function() {
          return {
            deserializer: 'TestView',
            name: this.name
          };
        };

        TestView.prototype.getUri = function() {
          return path.join(temp.dir, this.name);
        };

        TestView.prototype.save = function() {
          return this.saved = true;
        };

        TestView.prototype.isEqual = function(other) {
          return this.name === (other != null ? other.name : void 0);
        };

        return TestView;

      })(View);
      container = new PaneContainerView;
      pane1 = container.getRoot();
      pane1.activateItem(new TestView('1'));
      pane2 = pane1.splitRight(new TestView('2'));
      return pane3 = pane2.splitDown(new TestView('3'));
    });
    afterEach(function() {
      return atom.deserializers.remove(TestView);
    });
    describe(".getActivePaneView()", function() {
      return it("returns the most-recently focused pane", function() {
        var focusStealer;
        focusStealer = $$(function() {
          return this.div({
            tabindex: -1
          }, "focus stealer");
        });
        focusStealer.attachToDom();
        container.attachToDom();
        pane2.focus();
        expect(container.getFocusedPane()).toBe(pane2);
        expect(container.getActivePaneView()).toBe(pane2);
        focusStealer.focus();
        expect(container.getFocusedPane()).toBeUndefined();
        expect(container.getActivePaneView()).toBe(pane2);
        pane3.focus();
        expect(container.getFocusedPane()).toBe(pane3);
        return expect(container.getActivePaneView()).toBe(pane3);
      });
    });
    describe(".eachPaneView(callback)", function() {
      return it("runs the callback with all current and future panes until the subscription is cancelled", function() {
        var pane4, panes, subscription;
        panes = [];
        subscription = container.eachPaneView(function(pane) {
          return panes.push(pane);
        });
        expect(panes).toEqual([pane1, pane2, pane3]);
        panes = [];
        pane4 = pane3.splitRight(pane3.copyActiveItem());
        expect(panes).toEqual([pane4]);
        panes = [];
        subscription.off();
        pane4.splitDown();
        return expect(panes).toEqual([]);
      });
    });
    describe(".saveAll()", function() {
      return it("saves all open pane items", function() {
        var item, pane, _i, _len, _ref2, _results;
        pane1.activateItem(new TestView('4'));
        container.saveAll();
        _ref2 = container.getPaneViews();
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          pane = _ref2[_i];
          _results.push((function() {
            var _j, _len1, _ref3, _results1;
            _ref3 = pane.getItems();
            _results1 = [];
            for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
              item = _ref3[_j];
              _results1.push(expect(item.saved).toBeTruthy());
            }
            return _results1;
          })());
        }
        return _results;
      });
    });
    describe(".confirmClose()", function() {
      it("returns true after modified files are saved", function() {
        var saved;
        pane1.itemAtIndex(0).shouldPromptToSave = function() {
          return true;
        };
        pane2.itemAtIndex(0).shouldPromptToSave = function() {
          return true;
        };
        spyOn(atom, "confirm").andReturn(0);
        saved = container.confirmClose();
        return runs(function() {
          expect(saved).toBeTruthy();
          return expect(atom.confirm).toHaveBeenCalled();
        });
      });
      return it("returns false if the user cancels saving", function() {
        var saved;
        pane1.itemAtIndex(0).shouldPromptToSave = function() {
          return true;
        };
        pane2.itemAtIndex(0).shouldPromptToSave = function() {
          return true;
        };
        spyOn(atom, "confirm").andReturn(1);
        saved = container.confirmClose();
        return runs(function() {
          expect(saved).toBeFalsy();
          return expect(atom.confirm).toHaveBeenCalled();
        });
      });
    });
    describe("serialization", function() {
      it("can be serialized and deserialized, and correctly adjusts dimensions of deserialized panes after attach", function() {
        var newContainer;
        newContainer = new PaneContainerView(container.model.testSerialization());
        expect(newContainer.find('.pane-row > :contains(1)')).toExist();
        expect(newContainer.find('.pane-row > .pane-column > :contains(2)')).toExist();
        expect(newContainer.find('.pane-row > .pane-column > :contains(3)')).toExist();
        newContainer.height(200).width(300).attachToDom();
        expect(newContainer.find('.pane-row > :contains(1)').width()).toBe(150);
        return expect(newContainer.find('.pane-row > .pane-column > :contains(2)').height()).toBe(100);
      });
      return describe("if there are empty panes after deserialization", function() {
        beforeEach(function() {
          return TestView.deserialize = function(_arg) {
            var name;
            name = _arg.name;
            if (name === '1') {
              return new TestView(name);
            }
          };
        });
        describe("if the 'core.destroyEmptyPanes' config option is false (the default)", function() {
          return it("leaves the empty panes intact", function() {
            var newContainer;
            newContainer = new PaneContainerView(container.model.testSerialization());
            expect(newContainer.find('.pane-row > :contains(1)')).toExist();
            return expect(newContainer.find('.pane-row > .pane-column > .pane').length).toBe(2);
          });
        });
        return describe("if the 'core.destroyEmptyPanes' config option is true", function() {
          return it("removes empty panes on deserialization", function() {
            var newContainer;
            atom.config.set('core.destroyEmptyPanes', true);
            newContainer = new PaneContainerView(container.model.testSerialization());
            expect(newContainer.find('.pane-row, .pane-column')).not.toExist();
            return expect(newContainer.find('> :contains(1)')).toExist();
          });
        });
      });
    });
    describe("pane-container:active-pane-item-changed", function() {
      var activeItemChangedHandler, item1a, item1b, item2a, item2b, item3a, _ref2;
      _ref2 = [], pane1 = _ref2[0], item1a = _ref2[1], item1b = _ref2[2], item2a = _ref2[3], item2b = _ref2[4], item3a = _ref2[5], container = _ref2[6], activeItemChangedHandler = _ref2[7];
      beforeEach(function() {
        item1a = new TestView('1a');
        item1b = new TestView('1b');
        item2a = new TestView('2a');
        item2b = new TestView('2b');
        item3a = new TestView('3a');
        container = new PaneContainerView;
        pane1 = container.getRoot();
        pane1.activateItem(item1a);
        container.attachToDom();
        activeItemChangedHandler = jasmine.createSpy("activeItemChangedHandler");
        return container.on('pane-container:active-pane-item-changed', activeItemChangedHandler);
      });
      describe("when there is one pane", function() {
        it("is triggered when a new pane item is added", function() {
          pane1.activateItem(item1b);
          expect(activeItemChangedHandler.callCount).toBe(1);
          return expect(activeItemChangedHandler.argsForCall[0][1]).toEqual(item1b);
        });
        it("is not triggered when the active pane item is shown again", function() {
          pane1.activateItem(item1a);
          return expect(activeItemChangedHandler).not.toHaveBeenCalled();
        });
        it("is triggered when switching to an existing pane item", function() {
          pane1.activateItem(item1b);
          activeItemChangedHandler.reset();
          pane1.activateItem(item1a);
          expect(activeItemChangedHandler.callCount).toBe(1);
          return expect(activeItemChangedHandler.argsForCall[0][1]).toEqual(item1a);
        });
        it("is triggered when the active pane item is destroyed", function() {
          pane1.activateItem(item1b);
          activeItemChangedHandler.reset();
          pane1.destroyItem(item1b);
          expect(activeItemChangedHandler.callCount).toBe(1);
          return expect(activeItemChangedHandler.argsForCall[0][1]).toEqual(item1a);
        });
        it("is not triggered when an inactive pane item is destroyed", function() {
          pane1.activateItem(item1b);
          activeItemChangedHandler.reset();
          pane1.destroyItem(item1a);
          return expect(activeItemChangedHandler).not.toHaveBeenCalled();
        });
        return it("is triggered when all pane items are destroyed", function() {
          pane1.destroyItem(item1a);
          expect(activeItemChangedHandler.callCount).toBe(1);
          return expect(activeItemChangedHandler.argsForCall[0][1]).toBe(void 0);
        });
      });
      describe("when there are two panes", function() {
        pane2 = [][0];
        beforeEach(function() {
          pane2 = pane1.splitLeft(item2a);
          return activeItemChangedHandler.reset();
        });
        it("is triggered when a new pane item is added to the active pane", function() {
          pane2.activateItem(item2b);
          expect(activeItemChangedHandler.callCount).toBe(1);
          return expect(activeItemChangedHandler.argsForCall[0][1]).toEqual(item2b);
        });
        it("is not triggered when a new pane item is added to an inactive pane", function() {
          pane1.activateItem(item1b);
          return expect(activeItemChangedHandler).not.toHaveBeenCalled();
        });
        it("is triggered when the active pane's active item is destroyed", function() {
          pane2.activateItem(item2b);
          activeItemChangedHandler.reset();
          pane2.destroyItem(item2b);
          expect(activeItemChangedHandler.callCount).toBe(1);
          return expect(activeItemChangedHandler.argsForCall[0][1]).toEqual(item2a);
        });
        it("is not triggered when an inactive pane's active item is destroyed", function() {
          pane1.activateItem(item1b);
          activeItemChangedHandler.reset();
          pane1.destroyItem(item1b);
          return expect(activeItemChangedHandler).not.toHaveBeenCalled();
        });
        it("is triggered when the active pane is destroyed", function() {
          pane2.remove();
          expect(activeItemChangedHandler.callCount).toBe(1);
          return expect(activeItemChangedHandler.argsForCall[0][1]).toEqual(item1a);
        });
        it("is not triggered when an inactive pane is destroyed", function() {
          pane1.remove();
          return expect(activeItemChangedHandler).not.toHaveBeenCalled();
        });
        return it("is triggered when the active pane is changed", function() {
          pane1.activate();
          expect(activeItemChangedHandler.callCount).toBe(1);
          return expect(activeItemChangedHandler.argsForCall[0][1]).toEqual(item1a);
        });
      });
      return describe("when there are multiple panes", function() {
        beforeEach(function() {
          pane2 = pane1.splitRight(item2a);
          return activeItemChangedHandler.reset();
        });
        it("is triggered when a new pane is added", function() {
          pane2.splitDown(item3a);
          expect(activeItemChangedHandler.callCount).toBe(1);
          return expect(activeItemChangedHandler.argsForCall[0][1]).toEqual(item3a);
        });
        return it("is not triggered when an inactive pane is destroyed", function() {
          pane3 = pane2.splitDown(item3a);
          activeItemChangedHandler.reset();
          pane1.remove();
          pane2.remove();
          return expect(activeItemChangedHandler).not.toHaveBeenCalled();
        });
      });
    });
    describe(".focusNextPaneView()", function() {
      return it("focuses the pane following the focused pane or the first pane if no pane has focus", function() {
        container.attachToDom();
        container.focusNextPaneView();
        expect(pane1.activeItem).toMatchSelector(':focus');
        container.focusNextPaneView();
        expect(pane2.activeItem).toMatchSelector(':focus');
        container.focusNextPaneView();
        expect(pane3.activeItem).toMatchSelector(':focus');
        container.focusNextPaneView();
        return expect(pane1.activeItem).toMatchSelector(':focus');
      });
    });
    describe(".focusPreviousPaneView()", function() {
      return it("focuses the pane preceding the focused pane or the last pane if no pane has focus", function() {
        container.attachToDom();
        container.getPaneViews()[0].focus();
        container.focusPreviousPaneView();
        expect(pane3.activeItem).toMatchSelector(':focus');
        container.focusPreviousPaneView();
        expect(pane2.activeItem).toMatchSelector(':focus');
        container.focusPreviousPaneView();
        expect(pane1.activeItem).toMatchSelector(':focus');
        container.focusPreviousPaneView();
        return expect(pane3.activeItem).toMatchSelector(':focus');
      });
    });
    return describe("changing focus directionally between panes", function() {
      var pane4, pane5, pane6, pane7, pane8, pane9, _ref2;
      _ref2 = [], pane1 = _ref2[0], pane2 = _ref2[1], pane3 = _ref2[2], pane4 = _ref2[3], pane5 = _ref2[4], pane6 = _ref2[5], pane7 = _ref2[6], pane8 = _ref2[7], pane9 = _ref2[8];
      beforeEach(function() {
        container = new PaneContainerView;
        pane1 = container.getRoot();
        pane1.activateItem(new TestView('1'));
        pane4 = pane1.splitDown(new TestView('4'));
        pane7 = pane4.splitDown(new TestView('7'));
        pane2 = pane1.splitRight(new TestView('2'));
        pane3 = pane2.splitRight(new TestView('3'));
        pane5 = pane4.splitRight(new TestView('5'));
        pane6 = pane5.splitRight(new TestView('6'));
        pane8 = pane7.splitRight(new TestView('8'));
        pane9 = pane8.splitRight(new TestView('9'));
        container.height(400);
        container.width(400);
        return container.attachToDom();
      });
      describe(".focusPaneViewAbove()", function() {
        describe("when there are multiple rows above the focused pane", function() {
          return it("focuses up to the adjacent row", function() {
            pane8.focus();
            container.focusPaneViewAbove();
            return expect(pane5.activeItem).toMatchSelector(':focus');
          });
        });
        return describe("when there are no rows above the focused pane", function() {
          return it("keeps the current pane focused", function() {
            pane2.focus();
            container.focusPaneViewAbove();
            return expect(pane2.activeItem).toMatchSelector(':focus');
          });
        });
      });
      describe(".focusPaneViewBelow()", function() {
        describe("when there are multiple rows below the focused pane", function() {
          return it("focuses down to the adjacent row", function() {
            pane2.focus();
            container.focusPaneViewBelow();
            return expect(pane5.activeItem).toMatchSelector(':focus');
          });
        });
        return describe("when there are no rows below the focused pane", function() {
          return it("keeps the current pane focused", function() {
            pane8.focus();
            container.focusPaneViewBelow();
            return expect(pane8.activeItem).toMatchSelector(':focus');
          });
        });
      });
      describe(".focusPaneViewOnLeft()", function() {
        describe("when there are multiple columns to the left of the focused pane", function() {
          return it("focuses left to the adjacent column", function() {
            pane6.focus();
            container.focusPaneViewOnLeft();
            return expect(pane5.activeItem).toMatchSelector(':focus');
          });
        });
        return describe("when there are no columns to the left of the focused pane", function() {
          return it("keeps the current pane focused", function() {
            pane4.focus();
            container.focusPaneViewOnLeft();
            return expect(pane4.activeItem).toMatchSelector(':focus');
          });
        });
      });
      return describe(".focusPaneViewOnRight()", function() {
        describe("when there are multiple columns to the right of the focused pane", function() {
          return it("focuses right to the adjacent column", function() {
            pane4.focus();
            container.focusPaneViewOnRight();
            return expect(pane5.activeItem).toMatchSelector(':focus');
          });
        });
        return describe("when there are no columns to the right of the focused pane", function() {
          return it("keeps the current pane focused", function() {
            pane6.focus();
            container.focusPaneViewOnRight();
            return expect(pane6.activeItem).toMatchSelector(':focus');
          });
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDBEQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBRFAsQ0FBQTs7QUFBQSxFQUVBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSw0QkFBUixDQUZwQixDQUFBOztBQUFBLEVBR0EsUUFBQSxHQUFXLE9BQUEsQ0FBUSxrQkFBUixDQUhYLENBQUE7O0FBQUEsRUFJQSxPQUFnQixPQUFBLENBQVEsTUFBUixDQUFoQixFQUFDLFNBQUEsQ0FBRCxFQUFJLFlBQUEsSUFBSixFQUFVLFVBQUEsRUFKVixDQUFBOztBQUFBLEVBTUEsUUFBQSxDQUFTLG1CQUFULEVBQThCLFNBQUEsR0FBQTtBQUM1QixRQUFBLCtDQUFBO0FBQUEsSUFBQSxRQUE2QyxFQUE3QyxFQUFDLG1CQUFELEVBQVcsb0JBQVgsRUFBc0IsZ0JBQXRCLEVBQTZCLGdCQUE3QixFQUFvQyxnQkFBcEMsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQU07QUFDSixtQ0FBQSxDQUFBOzs7O1NBQUE7O0FBQUEsUUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQW5CLENBQXVCLFFBQXZCLENBQUEsQ0FBQTs7QUFBQSxRQUNBLFFBQUMsQ0FBQSxXQUFELEdBQWMsU0FBQyxJQUFELEdBQUE7QUFBWSxjQUFBLElBQUE7QUFBQSxVQUFWLE9BQUQsS0FBQyxJQUFVLENBQUE7aUJBQUksSUFBQSxRQUFBLENBQVMsSUFBVCxFQUFoQjtRQUFBLENBRGQsQ0FBQTs7QUFBQSxRQUVBLFFBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2lCQUFHLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZ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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/pane-container-view-spec.coffee