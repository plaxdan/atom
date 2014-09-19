(function() {
  var $, $$, CoffeeNavigatorView, Q, View, coffee, coffeeNodes, fs, _s,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  $ = require('atom').$;

  $$ = require('atom').$$;

  coffee = require('coffee-script');

  coffeeNodes = require('coffee-script').nodes;

  fs = require('fs');

  _s = require('underscore.string');

  Q = require('q');

  module.exports = CoffeeNavigatorView = (function(_super) {
    __extends(CoffeeNavigatorView, _super);

    function CoffeeNavigatorView() {
      this.onChange = __bind(this.onChange, this);
      return CoffeeNavigatorView.__super__.constructor.apply(this, arguments);
    }

    CoffeeNavigatorView.content = function() {
      return this.div({
        id: 'coffee-navigator',
        "class": 'tool-panel panel-bottom padded'
      }, (function(_this) {
        return function() {
          return _this.ul({
            "class": 'list-tree',
            outlet: 'tree'
          });
        };
      })(this));
    };

    CoffeeNavigatorView.prototype.initialize = function(serializeState) {
      atom.workspaceView.command('coffee-navigator:toggle', (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
      this.subscribe(atom.workspaceView, 'pane-container:active-pane-item-changed', (function(_this) {
        return function() {
          if (_this.visible) {
            return _this.show();
          }
        };
      })(this));
      this.visible = false;
      return this.debug = false;
    };

    CoffeeNavigatorView.prototype.serialize = function() {};

    CoffeeNavigatorView.prototype.destroy = function() {
      return this.detach();
    };

    CoffeeNavigatorView.prototype.log = function() {
      if (this.debug) {
        return console.log(arguments);
      }
    };

    CoffeeNavigatorView.prototype.getActiveEditorView = function() {
      var deferred, interval;
      deferred = Q.defer();
      interval = setInterval((function(_this) {
        return function() {
          var editorView, _i, _len, _ref, _results;
          _ref = atom.workspaceView.getEditorViews();
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            editorView = _ref[_i];
            if (editorView.getEditor() === atom.workspace.getActiveEditor()) {
              deferred.resolve(editorView);
              _results.push(clearInterval(interval));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
      })(this), 10);
      return deferred.promise;
    };

    CoffeeNavigatorView.prototype.parseBlock = function(block) {
      var element, expression, result, _i, _len, _ref;
      this.log('Block', block);
      element = $('<div>');
      _ref = block.expressions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        expression = _ref[_i];
        result = null;
        switch (expression.constructor.name) {
          case 'Assign':
            result = this.parseAssign(expression);
            break;
          case 'Value':
            result = this.parseValue(expression);
        }
        if (!!result) {
          element.append(result);
        }
      }
      return element.find('>');
    };

    CoffeeNavigatorView.prototype.parseValue = function(expression) {
      var element, obj, property, result, value, _i, _j, _len, _len1, _ref, _ref1;
      this.log('Value', expression);
      switch (expression.base.constructor.name) {
        case 'Literal':
          value = expression.base.value;
          if (expression.properties.length > 0) {
            _ref = expression.properties;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              property = _ref[_i];
              if (property.constructor.name !== 'Index') {
                value += '.' + property.name.value;
              }
            }
          }
          return value;
        case 'Obj':
          element = $('<div>');
          _ref1 = expression.base.objects;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            obj = _ref1[_j];
            result = this.parseAssign(obj);
            if (!!result) {
              element.append(result);
            }
          }
          return element.find('>');
      }
    };

    CoffeeNavigatorView.prototype.parseAssign = function(expression) {
      var className, element, icon, value, _ref, _ref1, _ref2, _ref3;
      this.log('Assign', expression);
      element = null;
      if (((_ref = expression.value) != null ? _ref.constructor.name : void 0) === 'Code') {
        value = this.parseValue(expression.variable);
        if (expression.value.bound) {
          icon = 'icon-bound';
        } else {
          icon = 'icon-unbound';
        }
        element = $$(function() {
          return this.li({
            "class": 'list-nested-item'
          }, (function(_this) {
            return function() {
              return _this.div({
                "class": 'list-item'
              }, function() {
                return _this.a({
                  "class": 'icon ' + icon,
                  "data-line": expression.locationData.first_line,
                  "data-column": expression.locationData.first_column
                }, value);
              });
            };
          })(this));
        });
        element.append(this.parseBlock(expression.value.body));
      } else if (((_ref1 = expression.value) != null ? _ref1.constructor.name : void 0) === 'Class') {
        className = this.parseValue(expression.value.variable);
        element = $$(function() {
          return this.li({
            "class": 'list-nested-item'
          }, (function(_this) {
            return function() {
              _this.div({
                "class": 'list-item'
              }, function() {
                return _this.span({
                  "class": 'icon icon-class'
                }, className);
              });
              return _this.ul({
                "class": 'list-tree'
              });
            };
          })(this));
        });
        element.find('ul').append(this.parseBlock(expression.value.body));
      } else if (((_ref2 = expression.base) != null ? _ref2.constructor.name : void 0) === 'Obj') {
        element = $('<li />');
        element.append(this.parseValue(expression.base));
      } else if (((_ref3 = expression.value) != null ? _ref3.constructor.name : void 0) === 'Value') {
        element = this.parseValue(expression.value);
      }
      return element;
    };

    CoffeeNavigatorView.prototype.parseCurrentFile = function() {
      this.tree.empty();
      return fs.readFile(atom.workspace.getActiveEditor().getPath(), (function(_this) {
        return function(err, code) {
          var e, nodes;
          try {
            nodes = coffee.nodes(code.toString());
            _this.tree.append(_this.parseBlock(nodes));
          } catch (_error) {
            e = _error;
            _this.tree.append($$(function() {
              return this.ul({
                "class": 'list-tree'
              }, (function(_this) {
                return function() {
                  return _this.li({
                    "class": 'list-nested-item'
                  }, function() {
                    return _this.div({
                      "class": 'list-item'
                    }, function() {
                      return _this.a({
                        "class": 'icon icon-issue-opened text-error',
                        "data-line": e.location.first_line,
                        "data-column": e.location.first_column
                      }, e.message);
                    });
                  });
                };
              })(this));
            }));
          }
          return _this.tree.find('a').on('click', function(el) {
            var column, line;
            line = $(this).attr('data-line');
            column = $(this).attr('data-column');
            return atom.workspace.getActiveEditor().setCursorBufferPosition([line, column]);
          });
        };
      })(this));
    };

    CoffeeNavigatorView.prototype.toggle = function() {
      if (this.visible) {
        this.hide();
      } else {
        this.show();
      }
      return this.visible = !this.visible;
    };

    CoffeeNavigatorView.prototype.show = function() {
      var activeEditor, promise;
      if (this.hasParent()) {
        this.hide();
      }
      activeEditor = atom.workspace.getActiveEditor();
      if (!!activeEditor) {
        if (_s.endsWith(activeEditor.getPath(), '.coffee')) {
          promise = this.getActiveEditorView();
          return promise.then((function(_this) {
            return function(activeEditorView) {
              activeEditorView.addClass('has-navigator');
              activeEditorView.append(_this);
              activeEditor.getBuffer().on('saved', _this.onChange);
              return _this.parseCurrentFile();
            };
          })(this));
        }
      }
    };

    CoffeeNavigatorView.prototype.hide = function() {
      if (this.hasParent()) {
        this.parent().removeClass('has-navigator');
        $(this.parent()).data('view').editor.getBuffer().off('saved', this.onChange);
        return this.detach();
      }
    };

    CoffeeNavigatorView.prototype.onChange = function() {
      return this.parseCurrentFile();
    };

    return CoffeeNavigatorView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdFQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsTUFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxPQUFBLENBQVEsTUFBUixDQUFlLENBQUMsQ0FEcEIsQ0FBQTs7QUFBQSxFQUVBLEVBQUEsR0FBSyxPQUFBLENBQVEsTUFBUixDQUFlLENBQUMsRUFGckIsQ0FBQTs7QUFBQSxFQUdBLE1BQUEsR0FBUyxPQUFBLENBQVEsZUFBUixDQUhULENBQUE7O0FBQUEsRUFJQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGVBQVIsQ0FBd0IsQ0FBQyxLQUp2QyxDQUFBOztBQUFBLEVBS0EsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBTEwsQ0FBQTs7QUFBQSxFQU1BLEVBQUEsR0FBSyxPQUFBLENBQVEsbUJBQVIsQ0FOTCxDQUFBOztBQUFBLEVBT0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxHQUFSLENBUEosQ0FBQTs7QUFBQSxFQVNBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSiwwQ0FBQSxDQUFBOzs7OztLQUFBOztBQUFBLElBQUEsbUJBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsRUFBQSxFQUFJLGtCQUFKO0FBQUEsUUFBd0IsT0FBQSxFQUFPLGdDQUEvQjtPQUFMLEVBQXNFLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQ3BFLEtBQUMsQ0FBQSxFQUFELENBQUk7QUFBQSxZQUFBLE9BQUEsRUFBTyxXQUFQO0FBQUEsWUFBb0IsTUFBQSxFQUFRLE1BQTVCO1dBQUosRUFEb0U7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0RSxF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
//# sourceURL=/Users/daniel/.atom/packages/coffee-navigator/lib/coffee-navigator-view.coffee