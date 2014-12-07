(function() {
  var $, ScrollView, TodoListView, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), $ = _ref.$, ScrollView = _ref.ScrollView;

  module.exports = TodoListView = (function(_super) {
    __extends(TodoListView, _super);

    function TodoListView() {
      this.resizeTodoList = __bind(this.resizeTodoList, this);
      this.resizeStopped = __bind(this.resizeStopped, this);
      this.resizeStarted = __bind(this.resizeStarted, this);
      return TodoListView.__super__.constructor.apply(this, arguments);
    }

    TodoListView.content = function() {
      return this.div({
        id: 'todo-list-panel',
        "class": 'tool-panel',
        'data-show-on-right-side': atom.config.get('todo-list.showOnRightSide')
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'todo-list-scroller',
            outlet: 'scroller'
          }, function() {
            return _this.ol({
              "class": 'todo-list full-menu list-tree focusable-panel',
              tabindex: -1,
              outlet: 'list'
            });
          });
          return _this.div({
            "class": 'todo-list-resize-handle',
            outlet: 'resizeHandle'
          });
        };
      })(this));
    };

    TodoListView.prototype.initialize = function(serializeState) {
      atom.workspaceView.command('todo-list:toggle', (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
      atom.workspaceView.command('todo-list:toggle-side', (function(_this) {
        return function() {
          return _this.toggleSide();
        };
      })(this));
      this.on('mousedown', '.todo-list-resize-handle', (function(_this) {
        return function(e) {
          return _this.resizeStarted(e);
        };
      })(this));
      this.on('core:close core:cancel', (function(_this) {
        return function() {
          return _this.detach();
        };
      })(this));
      this.subscribe(atom.config.observe('todo-list.showOnRightSide', {
        callNow: false
      }, (function(_this) {
        return function(newValue) {
          _this.detach();
          _this.attach();
          return _this.element.dataset.showOnRightSide = newValue;
        };
      })(this)));
      this.computedWidth = 200;
      this.changeDisposable = null;
      atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function(element) {
          if (_this.changeDisposable !== null) {
            _this.changeDisposable.dispose();
            _this.changeDisposable = null;
          }
          _this.handleEditorEvents();
          return _this.createReminderList();
        };
      })(this));
      return this.handleEditorEvents();
    };

    TodoListView.prototype.createReminderList = function() {
      var fixme, fixmeElement, fixmeHead, fixmeList, numFixme, numTodo, todo, todoElement, todoHead, todoList, _fn, _fn1, _i, _j, _len, _len1, _results;
      numTodo = 0;
      numFixme = 0;
      todoList = [];
      fixmeList = [];
      this.list[0].innerHTML = '';
      if (this.editor !== void 0) {
        this.editor.scan(/todo:\s*(.*)/gi, (function(_this) {
          return function(match) {
            if (match.match[1] === '') {
              return;
            }
            numTodo++;
            return todoList.push({
              text: match.match[1],
              line: match.range.start.row + 1,
              point: [match.range.start.row, match.range.start.column]
            });
          };
        })(this));
      }
      todoHead = document.createElement('li');
      todoHead.className = numTodo > 0 ? 'head incomplete' : 'head complete';
      todoHead.innerHTML = "TODO (" + numTodo + ")";
      this.list.append(todoHead);
      if (numTodo > 0) {
        _fn = function(editor, todo) {
          this.editor = editor;
          return todoElement.addEventListener('dblclick', (function(_this) {
            return function() {
              return _this.editor.setCursorBufferPosition(todo.point);
            };
          })(this));
        };
        for (_i = 0, _len = todoList.length; _i < _len; _i++) {
          todo = todoList[_i];
          todoElement = document.createElement('li');
          todoElement.innerHTML = this.createReminderElement(todo.text, todo.line);
          _fn(this.editor, todo);
          this.list.append(todoElement);
        }
      }
      if (this.editor !== void 0) {
        this.editor.scan(/fixme:\s*(.*)/gi, (function(_this) {
          return function(match) {
            if (match.match[1] === '') {
              return;
            }
            numFixme++;
            return fixmeList.push({
              text: match.match[1],
              line: match.range.start.row + 1,
              point: [match.range.start.row, match.range.start.column]
            });
          };
        })(this));
      }
      fixmeHead = document.createElement('li');
      fixmeHead.className = numFixme > 0 ? 'head incomplete' : 'head complete';
      fixmeHead.innerHTML = "FIXME (" + numFixme + ")";
      this.list.append(fixmeHead);
      if (numFixme > 0) {
        _fn1 = function(editor, fixme) {
          this.editor = editor;
          return fixmeElement.addEventListener('dblclick', (function(_this) {
            return function() {
              return _this.editor.setCursorBufferPosition(fixme.point);
            };
          })(this));
        };
        _results = [];
        for (_j = 0, _len1 = fixmeList.length; _j < _len1; _j++) {
          fixme = fixmeList[_j];
          fixmeElement = document.createElement('li');
          fixmeElement.innerHTML = this.createReminderElement(fixme.text, fixme.line);
          _fn1(this.editor, fixme);
          _results.push(this.list.append(fixmeElement));
        }
        return _results;
      }
    };

    TodoListView.prototype.createReminderElement = function(text, line) {
      text = this.shortenReminderMsg(text);
      return "<span class=\"msg\">" + text + "</span><hr /><span>on line " + line + "</span>";
    };

    TodoListView.prototype.shortenReminderMsg = function(text, maxLength) {
      if (maxLength == null) {
        maxLength = 30;
      }
      maxLength = Math.floor((this.computedWidth / 10) + 5 * ((this.computedWidth - 100) / 100) + 2);
      if (text.length >= maxLength) {
        return text.substring(0, maxLength - 2) + '...';
      } else {
        return text;
      }
    };

    TodoListView.prototype.handleEditorEvents = function() {
      this.editor = atom.workspace.getActiveTextEditor();
      if (this.editor !== void 0) {
        return this.changeDisposable = this.editor.onDidStopChanging((function(_this) {
          return function() {
            return _this.createReminderList();
          };
        })(this));
      }
    };

    TodoListView.prototype.resizeStarted = function() {
      $(document).on('mousemove', this.resizeTodoList);
      return $(document).on('mouseup', this.resizeStopped);
    };

    TodoListView.prototype.resizeStopped = function() {
      $(document).off('mousemove', this.resizeTodoList);
      return $(document).off('mouseup', this.resizeStopped);
    };

    TodoListView.prototype.resizeTodoList = function(_arg) {
      var pageX, which, width;
      pageX = _arg.pageX, which = _arg.which;
      if (which !== 1) {
        return this.resizeStopped();
      }
      if (atom.config.get('todo-list.showOnRightSide')) {
        width = $(document.body).width() - pageX;
      } else {
        width = pageX;
      }
      if (width < 100) {
        width = 100;
      }
      this.computedWidth = width;
      this.width(width);
      return this.createReminderList();
    };

    TodoListView.prototype.toggleSide = function() {
      return atom.config.toggle('todo-list.showOnRightSide');
    };

    TodoListView.prototype.detach = function() {
      this.list[0].innerHTML = '';
      return TodoListView.__super__.detach.apply(this, arguments);
    };

    TodoListView.prototype.serialize = function() {};

    TodoListView.prototype.destroy = function() {
      return this.detach();
    };

    TodoListView.prototype.attach = function() {
      this.createReminderList();
      if (atom.config.get('todo-list.showOnRightSide')) {
        this.element.classList.remove('panel-left');
        this.element.classList.add('panel-right');
        return atom.workspaceView.appendToRight(this);
      } else {
        this.element.classList.remove('panel-right');
        this.element.classList.add('panel-left');
        return atom.workspaceView.appendToLeft(this);
      }
    };

    TodoListView.prototype.toggle = function() {
      if (this.hasParent()) {
        return this.detach();
      } else {
        return this.attach();
      }
    };

    return TodoListView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGlDQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsT0FBa0IsT0FBQSxDQUFRLE1BQVIsQ0FBbEIsRUFBQyxTQUFBLENBQUQsRUFBSSxrQkFBQSxVQUFKLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osbUNBQUEsQ0FBQTs7Ozs7OztLQUFBOztBQUFBLElBQUEsWUFBQyxDQUFBLE9BQUQsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxFQUFBLEVBQUksaUJBQUo7QUFBQSxRQUF1QixPQUFBLEVBQU8sWUFBOUI7QUFBQSxRQUE0Qyx5QkFBQSxFQUEyQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsMkJBQWhCLENBQXZFO09BQUwsRUFBMEgsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUN4SCxVQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxvQkFBUDtBQUFBLFlBQTZCLE1BQUEsRUFBUSxVQUFyQztXQUFMLEVBQXNELFNBQUEsR0FBQTttQkFDcEQsS0FBQyxDQUFBLEVBQUQsQ0FBSTtBQUFBLGNBQUEsT0FBQSxFQUFPLCtDQUFQO0FBQUEsY0FBd0QsUUFBQSxFQUFVLENBQUEsQ0FBbEU7QUFBQSxjQUFzRSxNQUFBLEVBQVEsTUFBOUU7YUFBSixFQURvRDtVQUFBLENBQXRELENBQUEsQ0FBQTtpQkFFQSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8seUJBQVA7QUFBQSxZQUFrQyxNQUFBLEVBQVEsY0FBMUM7V0FBTCxFQUh3SDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFILEVBRFE7SUFBQSxDQUFW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
//# sourceURL=/Users/daniel/.atom/packages/todo-list/lib/todo-list-view.coffee