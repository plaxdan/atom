(function() {
  var $, $$, CoffeeNavigatorView, Q, TagGenerator, View, fs, _s,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  $ = $$ = fs = _s = Q = null;

  TagGenerator = require('./tag-generator');

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
          return _this.div({
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
      atom.workspace.onDidChangeActivePaneItem((function(_this) {
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

    CoffeeNavigatorView.prototype.getPath = function() {
      var _ref;
      return (_ref = atom.workspace.getActiveEditor()) != null ? _ref.getPath() : void 0;
    };

    CoffeeNavigatorView.prototype.getScopeName = function() {
      var _ref, _ref1;
      return (_ref = atom.workspace.getActiveEditor()) != null ? (_ref1 = _ref.getGrammar()) != null ? _ref1.scopeName : void 0 : void 0;
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

    CoffeeNavigatorView.prototype.parseCurrentFile = function() {
      var scrollTop;
      scrollTop = this.scrollTop();
      if ($ == null) {
        $ = require('atom').$;
      }
      if ($$ == null) {
        $$ = require('atom').$$;
      }
      this.tree.empty();
      return new TagGenerator(this.getPath(), this.getScopeName()).generate().done((function(_this) {
        return function(tags) {
          var icon, lastIdentation, root, tag, _i, _len;
          lastIdentation = -1;
          for (_i = 0, _len = tags.length; _i < _len; _i++) {
            tag = tags[_i];
            if (tag.identation > lastIdentation) {
              root = _this.tree.find('li:last').length ? _this.tree.find('li:last') : _this.tree;
              root.append($$(function() {
                return this.ul({
                  "class": 'list-tree'
                });
              }));
              root = root.find('ul:last');
            } else if (tag.identation === lastIdentation) {
              root = _this.tree.find('li:last');
            } else {
              root = _this.tree.find('li[data-identation=' + tag.identation + ']:last').parent();
            }
            icon = '';
            switch (tag.kind) {
              case 'function':
                icon = 'icon-unbound';
                break;
              case 'function-bind':
                icon = 'icon-bound';
                break;
              case 'class':
                icon = 'icon-class';
            }
            if (_s.startsWith(tag.name, '@')) {
              tag.name = tag.name.slice(1);
              if (tag.kind === 'function') {
                icon += '-static';
              }
            } else if (tag.name === 'module.exports') {
              icon = 'icon-package';
            }
            root.append($$(function() {
              return this.li({
                "class": 'list-nested-item',
                'data-identation': tag.identation
              }, (function(_this) {
                return function() {
                  return _this.div({
                    "class": 'list-item'
                  }, function() {
                    return _this.a({
                      "class": 'icon ' + icon,
                      "data-line": tag.position.row,
                      "data-column": tag.position.column
                    }, tag.name);
                  });
                };
              })(this));
            }));
            lastIdentation = tag.identation;
          }
          _this.scrollTop(scrollTop);
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
        this.parent()[0].getModel().getBuffer().off('saved', this.onChange);
        return this.detach();
      }
    };

    CoffeeNavigatorView.prototype.onChange = function() {
      return this.parseCurrentFile();
    };

    return CoffeeNavigatorView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlEQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsTUFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxFQUFBLEdBQUssRUFBQSxHQUFLLEVBQUEsR0FBSyxDQUFBLEdBQUksSUFEdkIsQ0FBQTs7QUFBQSxFQUVBLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVIsQ0FGZixDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLDBDQUFBLENBQUE7Ozs7O0tBQUE7O0FBQUEsSUFBQSxtQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxFQUFBLEVBQUksa0JBQUo7QUFBQSxRQUF3QixPQUFBLEVBQU8sZ0NBQS9CO09BQUwsRUFBc0UsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDcEUsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsTUFBQSxFQUFRLE1BQVI7V0FBTCxFQURvRTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRFLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsa0NBSUEsVUFBQSxHQUFZLFNBQUMsY0FBRCxHQUFBO0FBQ1YsTUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLHlCQUEzQixFQUFzRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxNQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRELENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyx5QkFBZixD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
//# sourceURL=/Users/daniel/.atom/packages/coffee-navigator/lib/coffee-navigator-view.coffee