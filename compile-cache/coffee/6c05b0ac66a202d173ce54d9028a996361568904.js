(function() {
  var $, $$, View, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), View = _ref.View, $ = _ref.$, $$ = _ref.$$;

  describe("SpacePen extensions", function() {
    var TestView, parent, view, _ref1;
    TestView = (function(_super) {
      __extends(TestView, _super);

      function TestView() {
        return TestView.__super__.constructor.apply(this, arguments);
      }

      TestView.content = function() {
        return this.div();
      };

      return TestView;

    })(View);
    _ref1 = [], view = _ref1[0], parent = _ref1[1];
    beforeEach(function() {
      view = new TestView;
      parent = $$(function() {
        return this.div();
      });
      return parent.append(view);
    });
    describe("View.subscribe(eventEmitter, eventName, callback)", function() {
      var emitter, eventHandler, _ref2;
      _ref2 = [], emitter = _ref2[0], eventHandler = _ref2[1];
      beforeEach(function() {
        eventHandler = jasmine.createSpy('eventHandler');
        emitter = $$(function() {
          return this.div();
        });
        return view.subscribe(emitter, 'foo', eventHandler);
      });
      return it("subscribes to the given event emitter and unsubscribes when unsubscribe is called", function() {
        emitter.trigger("foo");
        return expect(eventHandler).toHaveBeenCalled();
      });
    });
    return describe("tooltips", function() {
      return describe("when the window is resized", function() {
        return it("hides the tooltips", function() {
          var TooltipView;
          TooltipView = (function(_super) {
            __extends(TooltipView, _super);

            function TooltipView() {
              return TooltipView.__super__.constructor.apply(this, arguments);
            }

            TooltipView.content = function() {
              return this.div();
            };

            return TooltipView;

          })(View);
          view = new TooltipView();
          view.attachToDom();
          view.setTooltip('this is a tip');
          view.tooltip('show');
          expect($(document.body).find('.tooltip')).toBeVisible();
          $(window).trigger('resize');
          return expect($(document.body).find('.tooltip')).not.toExist();
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxPQUFnQixPQUFBLENBQVEsTUFBUixDQUFoQixFQUFDLFlBQUEsSUFBRCxFQUFPLFNBQUEsQ0FBUCxFQUFVLFVBQUEsRUFBVixDQUFBOztBQUFBLEVBRUEsUUFBQSxDQUFTLHFCQUFULEVBQWdDLFNBQUEsR0FBQTtBQUM5QixRQUFBLDZCQUFBO0FBQUEsSUFBTTtBQUNKLGlDQUFBLENBQUE7Ozs7T0FBQTs7QUFBQSxNQUFBLFFBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2VBQUcsSUFBQyxDQUFBLEdBQUQsQ0FBQSxFQUFIO01BQUEsQ0FBVixDQUFBOztzQkFBQTs7T0FEcUIsS0FBdkIsQ0FBQTtBQUFBLElBR0EsUUFBaUIsRUFBakIsRUFBQyxlQUFELEVBQU8saUJBSFAsQ0FBQTtBQUFBLElBS0EsVUFBQSxDQUFXLFNBQUEsR0FBQTtBQUNULE1BQUEsSUFBQSxHQUFPLEdBQUEsQ0FBQSxRQUFQLENBQUE7QUFBQSxNQUNBLE1BQUEsR0FBUyxFQUFBLENBQUcsU0FBQSxHQUFBO2VBQUcsSUFBQyxDQUFBLEdBQUQsQ0FBQSxFQUFIO01BQUEsQ0FBSCxDQURULENBQUE7YUFFQSxNQUFNLENBQUMsTUFBUCxDQUFjLElBQWQsRUFIUztJQUFBLENBQVgsQ0FMQSxDQUFBO0FBQUEsSUFVQSxRQUFBLENBQVMsbURBQVQsRUFBOEQsU0FBQSxHQUFBO0FBQzVELFVBQUEsNEJBQUE7QUFBQSxNQUFBLFFBQTBCLEVBQTFCLEVBQUMsa0JBQUQsRUFBVSx1QkFBVixDQUFBO0FBQUEsTUFFQSxVQUFBLENBQVcsU0FBQSxHQUFBO0FBQ1QsUUFBQSxZQUFBLEdBQWUsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsY0FBbEIsQ0FBZixDQUFBO0FBQUEsUUFDQSxPQUFBLEdBQVUsRUFBQSxDQUFHLFNBQUEsR0FBQTtpQkFBRyxJQUFDLENBQUEsR0FBRCxDQUFBLEVBQUg7UUFBQSxDQUFILENBRFYsQ0FBQTtlQUVBLElBQUksQ0FBQyxTQUFMLENBQWUsT0FBZixFQUF3QixLQUF4QixFQUErQixZQUEvQixFQUhTO01BQUEsQ0FBWCxDQUZBLENBQUE7YUFPQSxFQUFBLENBQUcsbUZBQUgsRUFBd0YsU0FBQSxHQUFBO0FBQ3RGLFFBQUEsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsS0FBaEIsQ0FBQSxDQUFBO2VBQ0EsTUFBQSxDQUFPLFlBQVAsQ0FBb0IsQ0FBQyxnQkFBckIsQ0FBQSxFQUZzRjtNQUFBLENBQXhGLEVBUjREO0lBQUEsQ0FBOUQsQ0FWQSxDQUFBO1dBc0JBLFFBQUEsQ0FBUyxVQUFULEVBQXFCLFNBQUEsR0FBQTthQUNuQixRQUFBLENBQVMsNEJBQVQsRUFBdUMsU0FBQSxHQUFBO2VBQ3JDLEVBQUEsQ0FBRyxvQkFBSCxFQUF5QixTQUFBLEdBQUE7QUFDdkIsY0FBQSxXQUFBO0FBQUEsVUFBTTtBQUNKLDBDQUFBLENBQUE7Ozs7YUFBQTs7QUFBQSxZQUFBLFdBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO3FCQUNSLElBQUMsQ0FBQSxHQUFELENBQUEsRUFEUTtZQUFBLENBQVYsQ0FBQTs7K0JBQUE7O2FBRHdCLEtBQTFCLENBQUE7QUFBQSxVQUlBLElBQUEsR0FBVyxJQUFBLFdBQUEsQ0FBQSxDQUpYLENBQUE7QUFBQSxVQUtBLElBQUksQ0FBQyxXQUFMLENBQUEsQ0FMQSxDQUFBO0FBQUEsVUFNQSxJQUFJLENBQUMsVUFBTCxDQUFnQixlQUFoQixDQU5BLENBQUE7QUFBQSxVQVFBLElBQUksQ0FBQyxPQUFMLENBQWEsTUFBYixDQVJBLENBQUE7QUFBQSxVQVNBLE1BQUEsQ0FBTyxDQUFBLENBQUUsUUFBUSxDQUFDLElBQVgsQ0FBZ0IsQ0FBQyxJQUFqQixDQUFzQixVQUF0QixDQUFQLENBQXlDLENBQUMsV0FBMUMsQ0FBQSxDQVRBLENBQUE7QUFBQSxVQVdBLENBQUEsQ0FBRSxNQUFGLENBQVMsQ0FBQyxPQUFWLENBQWtCLFFBQWxCLENBWEEsQ0FBQTtpQkFZQSxNQUFBLENBQU8sQ0FBQSxDQUFFLFFBQVEsQ0FBQyxJQUFYLENBQWdCLENBQUMsSUFBakIsQ0FBc0IsVUFBdEIsQ0FBUCxDQUF5QyxDQUFDLEdBQUcsQ0FBQyxPQUE5QyxDQUFBLEVBYnVCO1FBQUEsQ0FBekIsRUFEcUM7TUFBQSxDQUF2QyxFQURtQjtJQUFBLENBQXJCLEVBdkI4QjtFQUFBLENBQWhDLENBRkEsQ0FBQTtBQUFBIgp9
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/space-pen-extensions-spec.coffee