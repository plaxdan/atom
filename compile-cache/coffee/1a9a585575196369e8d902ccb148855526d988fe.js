(function() {
  var View, ViewRegistry,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ViewRegistry = require('../src/view-registry');

  View = require('../src/space-pen-extensions').View;

  describe("ViewRegistry", function() {
    var registry;
    registry = null;
    beforeEach(function() {
      return registry = new ViewRegistry;
    });
    describe("::getView(object)", function() {
      describe("when passed a DOM node", function() {
        return it("returns the given DOM node", function() {
          var node;
          node = document.createElement('div');
          return expect(registry.getView(node)).toBe(node);
        });
      });
      describe("when passed a SpacePen view", function() {
        return it("returns the root node of the view with a __spacePenView property pointing at the SpacePen view", function() {
          var TestView, node, view;
          TestView = (function(_super) {
            __extends(TestView, _super);

            function TestView() {
              return TestView.__super__.constructor.apply(this, arguments);
            }

            TestView.content = function() {
              return this.div("Hello");
            };

            return TestView;

          })(View);
          view = new TestView;
          node = registry.getView(view);
          expect(node.textContent).toBe("Hello");
          return expect(node.__spacePenView).toBe(view);
        });
      });
      return describe("when passed a model object", function() {
        describe("when a view provider is registered matching the object's constructor", function() {
          describe("when the provider has a viewConstructor property", function() {
            return it("constructs a view element and assigns the model on it", function() {
              var TestModel, TestModelSubclass, TestView, model, subclassModel, view, view2;
              TestModel = (function() {
                function TestModel() {}

                return TestModel;

              })();
              TestModelSubclass = (function(_super) {
                __extends(TestModelSubclass, _super);

                function TestModelSubclass() {
                  return TestModelSubclass.__super__.constructor.apply(this, arguments);
                }

                return TestModelSubclass;

              })(TestModel);
              TestView = (function() {
                function TestView() {}

                TestView.prototype.setModel = function(model) {
                  this.model = model;
                };

                return TestView;

              })();
              model = new TestModel;
              registry.addViewProvider({
                modelConstructor: TestModel,
                viewConstructor: TestView
              });
              view = registry.getView(model);
              expect(view instanceof TestView).toBe(true);
              expect(view.model).toBe(model);
              subclassModel = new TestModelSubclass;
              view2 = registry.getView(subclassModel);
              expect(view2 instanceof TestView).toBe(true);
              return expect(view2.model).toBe(subclassModel);
            });
          });
          return describe("when the provider has a createView method", function() {
            return it("constructs a view element by calling the createView method with the model", function() {
              var TestModel, TestView, model, view;
              TestModel = (function() {
                function TestModel() {}

                return TestModel;

              })();
              TestView = (function() {
                function TestView() {}

                TestView.prototype.setModel = function(model) {
                  this.model = model;
                };

                return TestView;

              })();
              registry.addViewProvider({
                modelConstructor: TestModel,
                createView: function(model) {
                  var view;
                  view = new TestView;
                  view.setModel(model);
                  return view;
                }
              });
              model = new TestModel;
              view = registry.getView(model);
              expect(view instanceof TestView).toBe(true);
              return expect(view.model).toBe(model);
            });
          });
        });
        return describe("when no view provider is registered for the object's constructor", function() {
          describe("when the object has a .getViewClass() method", function() {
            return it("builds an instance of the view class with the model, then returns its root node with a __spacePenView property pointing at the view", function() {
              var TestModel, TestView, model, node, view;
              TestView = (function(_super) {
                __extends(TestView, _super);

                function TestView() {
                  return TestView.__super__.constructor.apply(this, arguments);
                }

                TestView.content = function(model) {
                  return this.div(model.name);
                };

                TestView.prototype.initialize = function(model) {
                  this.model = model;
                };

                return TestView;

              })(View);
              TestModel = (function() {
                function TestModel(name) {
                  this.name = name;
                }

                TestModel.prototype.getViewClass = function() {
                  return TestView;
                };

                return TestModel;

              })();
              model = new TestModel("hello");
              node = registry.getView(model);
              expect(node.textContent).toBe("hello");
              view = node.__spacePenView;
              expect(view instanceof TestView).toBe(true);
              expect(view.model).toBe(model);
              return expect(registry.getView(model)).toBe(node);
            });
          });
          return describe("when the object has no .getViewClass() method", function() {
            return it("throws an exception", function() {
              return expect(function() {
                return registry.getView(new Object);
              }).toThrow();
            });
          });
        });
      });
    });
    return describe("::addViewProvider(providerSpec)", function() {
      return it("returns a disposable that can be used to remove the provider", function() {
        var TestModel, TestView, disposable;
        TestModel = (function() {
          function TestModel() {}

          return TestModel;

        })();
        TestView = (function() {
          function TestView() {}

          TestView.prototype.setModel = function(model) {
            this.model = model;
          };

          return TestView;

        })();
        disposable = registry.addViewProvider({
          modelConstructor: TestModel,
          viewConstructor: TestView
        });
        expect(registry.getView(new TestModel) instanceof TestView).toBe(true);
        disposable.dispose();
        return expect(function() {
          return registry.getView(new TestModel);
        }).toThrow();
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxZQUFBLEdBQWUsT0FBQSxDQUFRLHNCQUFSLENBQWYsQ0FBQTs7QUFBQSxFQUNDLE9BQVEsT0FBQSxDQUFRLDZCQUFSLEVBQVIsSUFERCxDQUFBOztBQUFBLEVBR0EsUUFBQSxDQUFTLGNBQVQsRUFBeUIsU0FBQSxHQUFBO0FBQ3ZCLFFBQUEsUUFBQTtBQUFBLElBQUEsUUFBQSxHQUFXLElBQVgsQ0FBQTtBQUFBLElBRUEsVUFBQSxDQUFXLFNBQUEsR0FBQTthQUNULFFBQUEsR0FBVyxHQUFBLENBQUEsYUFERjtJQUFBLENBQVgsQ0FGQSxDQUFBO0FBQUEsSUFLQSxRQUFBLENBQVMsbUJBQVQsRUFBOEIsU0FBQSxHQUFBO0FBQzVCLE1BQUEsUUFBQSxDQUFTLHdCQUFULEVBQW1DLFNBQUEsR0FBQTtlQUNqQyxFQUFBLENBQUcsNEJBQUgsRUFBaUMsU0FBQSxHQUFBO0FBQy9CLGNBQUEsSUFBQTtBQUFBLFVBQUEsSUFBQSxHQUFPLFFBQVEsQ0FBQyxhQUFULENBQXVCLEtBQXZCLENBQVAsQ0FBQTtpQkFDQSxNQUFBLENBQU8sUUFBUSxDQUFDLE9BQVQsQ0FBaUIsSUFBakIsQ0FBUCxDQUE4QixDQUFDLElBQS9CLENBQW9DLElBQXBDLEVBRitCO1FBQUEsQ0FBakMsRUFEaUM7TUFBQSxDQUFuQyxDQUFBLENBQUE7QUFBQSxNQUtBLFFBQUEsQ0FBUyw2QkFBVCxFQUF3QyxTQUFBLEdBQUE7ZUFDdEMsRUFBQSxDQUFHLGdHQUFILEVBQXFHLFNBQUEsR0FBQTtBQUNuRyxjQUFBLG9CQUFBO0FBQUEsVUFBTTtBQUNKLHVDQUFBLENBQUE7Ozs7YUFBQTs7QUFBQSxZQUFBLFFBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO3FCQUFHLElB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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/view-registry-spec.coffee