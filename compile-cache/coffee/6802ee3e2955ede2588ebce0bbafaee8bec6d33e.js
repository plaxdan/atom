(function() {
  var $, $$, CoffeeNavigatorView, Q, View, coffee, coffeeNodes, fs, _s,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  $ = $$ = coffee = coffeeNodes = fs = _s = Q = null;

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
      this.visible = localStorage.getItem('coffeeNavigatorStatus') === 'true';
      if (this.visible) {
        this.show();
      }
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
      if (Q == null) {
        Q = require('q');
      }
      deferred = Q.defer();
      interval = setInterval(function() {
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
      }, 10);
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
        if (_s.startsWith(value, 'this.')) {
          value = value.slice(5);
          icon += '-static';
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
                  'data-line': expression.locationData.first_line,
                  'data-column': expression.locationData.first_column
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
      if ($ == null) {
        $ = require('atom').$;
      }
      if ($$ == null) {
        $$ = require('atom').$$;
      }
      if (coffee == null) {
        coffee = require('coffee-script');
      }
      if (coffeeNodes == null) {
        coffeeNodes = require('coffee-script').nodes;
      }
      if (fs == null) {
        fs = require('fs');
      }
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
            var column, editor, firstRow, line;
            line = parseInt($(this).attr('data-line'));
            column = parseInt($(this).attr('data-column'));
            editor = atom.workspace.getActiveEditor();
            editor.setCursorBufferPosition([line, column]);
            firstRow = editor.getFirstVisibleScreenRow();
            return editor.scrollToBufferPosition([line + (line - firstRow) - 1, column]);
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
      this.visible = !this.visible;
      return localStorage.setItem('coffeeNavigatorStatus', this.visible);
    };

    CoffeeNavigatorView.prototype.show = function() {
      var activeEditor, promise;
      if (this.hasParent()) {
        this.hide();
      }
      if (fs == null) {
        fs = require('fs');
      }
      activeEditor = atom.workspace.getActiveEditor();
      if ((!!activeEditor) && (fs.existsSync(activeEditor.getPath()))) {
        if (_s == null) {
          _s = require('underscore.string');
        }
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdFQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsTUFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxFQUFBLEdBQUssTUFBQSxHQUFTLFdBQUEsR0FBYyxFQUFBLEdBQUssRUFBQSxHQUFLLENBQUEsR0FBSSxJQUQ5QyxDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLDBDQUFBLENBQUE7Ozs7O0tBQUE7O0FBQUEsSUFBQSxtQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxFQUFBLEVBQUksa0JBQUo7QUFBQSxRQUF3QixPQUFBLEVBQU8sZ0NBQS9CO09BQUwsRUFBc0UsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDcEUsS0FBQyxDQUFBLEVBQUQsQ0FBSTtBQUFBLFlBQUEsT0FBQSxFQUFPLFdBQVA7QUFBQSxZQUFvQixNQUFBLEVBQVEsTUFBNUI7V0FBSixFQURvRTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRFLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsa0NBSUEsVUFBQSxHQUFZLFNBQUMsY0FBRCxHQUFBO0FBQ1YsTUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLHlCQUEzQixFQUFzRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxNQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRELENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFJLENB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
//# sourceURL=/Users/daniel/.atom/packages/coffee-navigator/lib/coffee-navigator-view.coffee