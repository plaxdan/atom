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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlEQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUMsT0FBUSxPQUFBLENBQVEsTUFBUixFQUFSLElBQUQsQ0FBQTs7QUFBQSxFQUNBLENBQUEsR0FBSSxFQUFBLEdBQUssRUFBQSxHQUFLLEVBQUEsR0FBSyxDQUFBLEdBQUksSUFEdkIsQ0FBQTs7QUFBQSxFQUVBLFlBQUEsR0FBZSxPQUFBLENBQVEsaUJBQVIsQ0FGZixDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUNKLDBDQUFBLENBQUE7Ozs7O0tBQUE7O0FBQUEsSUFBQSxtQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxFQUFBLEVBQUksa0JBQUo7QUFBQSxRQUF3QixPQUFBLEVBQU8sZ0NBQS9CO09BQUwsRUFBc0UsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFDcEUsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFlBQUEsTUFBQSxFQUFRLE1BQVI7V0FBTCxFQURvRTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRFLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsa0NBSUEsVUFBQSxHQUFZLFNBQUMsY0FBRCxHQUFBO0FBQ1YsTUFBQSxJQUFJLENBQUMsYUFBYSxDQUFDLE9BQW5CLENBQTJCLHlCQUEzQixFQUFzRCxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUFHLEtBQUMsQ0FBQSxNQUFELENBQUEsRUFBSDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXRELENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBSSxDQUFDLFNBQVMsQ0FBQyx5QkFBZixD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
//# sourceURL=/Users/daniel/.atom/packages/coffee-navigator/lib/coffee-navigator-view.coffee