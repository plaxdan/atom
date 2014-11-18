(function() {
  var CommandRegistry;

  CommandRegistry = require('../src/command-registry');

  describe("CommandRegistry", function() {
    var child, grandchild, parent, registry, _ref;
    _ref = [], registry = _ref[0], parent = _ref[1], child = _ref[2], grandchild = _ref[3];
    beforeEach(function() {
      parent = document.createElement("div");
      child = document.createElement("div");
      grandchild = document.createElement("div");
      parent.classList.add('parent');
      child.classList.add('child');
      grandchild.classList.add('grandchild');
      child.appendChild(grandchild);
      parent.appendChild(child);
      document.querySelector('#jasmine-content').appendChild(parent);
      return registry = new CommandRegistry(parent);
    });
    describe("command dispatch", function() {
      it("invokes callbacks with selectors matching the target", function() {
        var called;
        called = false;
        registry.add('.grandchild', 'command', function(event) {
          expect(this).toBe(grandchild);
          expect(event.type).toBe('command');
          expect(event.eventPhase).toBe(Event.BUBBLING_PHASE);
          expect(event.target).toBe(grandchild);
          expect(event.currentTarget).toBe(grandchild);
          return called = true;
        });
        grandchild.dispatchEvent(new CustomEvent('command', {
          bubbles: true
        }));
        return expect(called).toBe(true);
      });
      it("invokes callbacks with selectors matching ancestors of the target", function() {
        var calls;
        calls = [];
        registry.add('.child', 'command', function(event) {
          expect(this).toBe(child);
          expect(event.target).toBe(grandchild);
          expect(event.currentTarget).toBe(child);
          return calls.push('child');
        });
        registry.add('.parent', 'command', function(event) {
          expect(this).toBe(parent);
          expect(event.target).toBe(grandchild);
          expect(event.currentTarget).toBe(parent);
          return calls.push('parent');
        });
        grandchild.dispatchEvent(new CustomEvent('command', {
          bubbles: true
        }));
        return expect(calls).toEqual(['child', 'parent']);
      });
      it("orders multiple matching listeners for an element by selector specificity", function() {
        var calls;
        child.classList.add('foo', 'bar');
        calls = [];
        registry.add('.foo.bar', 'command', function() {
          return calls.push('.foo.bar');
        });
        registry.add('.foo', 'command', function() {
          return calls.push('.foo');
        });
        registry.add('.bar', 'command', function() {
          return calls.push('.bar');
        });
        grandchild.dispatchEvent(new CustomEvent('command', {
          bubbles: true
        }));
        return expect(calls).toEqual(['.foo.bar', '.bar', '.foo']);
      });
      it("stops bubbling through ancestors when .stopPropagation() is called on the event", function() {
        var calls, dispatchedEvent;
        calls = [];
        registry.add('.parent', 'command', function() {
          return calls.push('parent');
        });
        registry.add('.child', 'command', function() {
          return calls.push('child-2');
        });
        registry.add('.child', 'command', function(event) {
          calls.push('child-1');
          return event.stopPropagation();
        });
        dispatchedEvent = new CustomEvent('command', {
          bubbles: true
        });
        spyOn(dispatchedEvent, 'stopPropagation');
        grandchild.dispatchEvent(dispatchedEvent);
        expect(calls).toEqual(['child-1', 'child-2']);
        return expect(dispatchedEvent.stopPropagation).toHaveBeenCalled();
      });
      it("stops invoking callbacks when .stopImmediatePropagation() is called on the event", function() {
        var calls, dispatchedEvent;
        calls = [];
        registry.add('.parent', 'command', function() {
          return calls.push('parent');
        });
        registry.add('.child', 'command', function() {
          return calls.push('child-2');
        });
        registry.add('.child', 'command', function(event) {
          calls.push('child-1');
          return event.stopImmediatePropagation();
        });
        dispatchedEvent = new CustomEvent('command', {
          bubbles: true
        });
        spyOn(dispatchedEvent, 'stopImmediatePropagation');
        grandchild.dispatchEvent(dispatchedEvent);
        expect(calls).toEqual(['child-1']);
        return expect(dispatchedEvent.stopImmediatePropagation).toHaveBeenCalled();
      });
      it("forwards .preventDefault() calls from the synthetic event to the original", function() {
        var calls, dispatchedEvent;
        calls = [];
        registry.add('.child', 'command', function(event) {
          return event.preventDefault();
        });
        dispatchedEvent = new CustomEvent('command', {
          bubbles: true
        });
        spyOn(dispatchedEvent, 'preventDefault');
        grandchild.dispatchEvent(dispatchedEvent);
        return expect(dispatchedEvent.preventDefault).toHaveBeenCalled();
      });
      it("allows listeners to be removed via a disposable returned by ::add", function() {
        var calls, disposable1, disposable2;
        calls = [];
        disposable1 = registry.add('.parent', 'command', function() {
          return calls.push('parent');
        });
        disposable2 = registry.add('.child', 'command', function() {
          return calls.push('child');
        });
        disposable1.dispose();
        grandchild.dispatchEvent(new CustomEvent('command', {
          bubbles: true
        }));
        expect(calls).toEqual(['child']);
        calls = [];
        disposable2.dispose();
        grandchild.dispatchEvent(new CustomEvent('command', {
          bubbles: true
        }));
        return expect(calls).toEqual([]);
      });
      return it("allows multiple commands to be registered under one selector when called with an object", function() {
        var calls, disposable;
        calls = [];
        disposable = registry.add('.child', {
          'command-1': function() {
            return calls.push('command-1');
          },
          'command-2': function() {
            return calls.push('command-2');
          }
        });
        grandchild.dispatchEvent(new CustomEvent('command-1', {
          bubbles: true
        }));
        grandchild.dispatchEvent(new CustomEvent('command-2', {
          bubbles: true
        }));
        expect(calls).toEqual(['command-1', 'command-2']);
        calls = [];
        disposable.dispose();
        grandchild.dispatchEvent(new CustomEvent('command-1', {
          bubbles: true
        }));
        grandchild.dispatchEvent(new CustomEvent('command-2', {
          bubbles: true
        }));
        return expect(calls).toEqual([]);
      });
    });
    describe("::findCommands({target})", function() {
      return it("returns commands that can be invoked on the target or its ancestors", function() {
        registry.add('.parent', 'namespace:command-1', function() {});
        registry.add('.child', 'namespace:command-2', function() {});
        registry.add('.grandchild', 'namespace:command-3', function() {});
        registry.add('.grandchild.no-match', 'namespace:command-4', function() {});
        return expect(registry.findCommands({
          target: grandchild
        }).slice(0, 3)).toEqual([
          {
            name: 'namespace:command-3',
            displayName: 'Namespace: Command 3'
          }, {
            name: 'namespace:command-2',
            displayName: 'Namespace: Command 2'
          }, {
            name: 'namespace:command-1',
            displayName: 'Namespace: Command 1'
          }
        ]);
      });
    });
    describe("::dispatch(target, commandName)", function() {
      it("simulates invocation of the given command ", function() {
        var called;
        called = false;
        registry.add('.grandchild', 'command', function(event) {
          expect(this).toBe(grandchild);
          expect(event.type).toBe('command');
          expect(event.eventPhase).toBe(Event.BUBBLING_PHASE);
          expect(event.target).toBe(grandchild);
          expect(event.currentTarget).toBe(grandchild);
          return called = true;
        });
        registry.dispatch(grandchild, 'command');
        return expect(called).toBe(true);
      });
      return it("returns a boolean indicating whether any listeners matched the command", function() {
        registry.add('.grandchild', 'command', function() {});
        expect(registry.dispatch(grandchild, 'command')).toBe(true);
        expect(registry.dispatch(grandchild, 'bogus')).toBe(false);
        return expect(registry.dispatch(parent, 'command')).toBe(false);
      });
    });
    return describe("::getSnapshot and ::restoreSnapshot", function() {
      return it("removes all command handlers except for those in the snapshot", function() {
        var snapshot;
        registry.add('.parent', 'namespace:command-1', function() {});
        registry.add('.child', 'namespace:command-2', function() {});
        snapshot = registry.getSnapshot();
        registry.add('.grandchild', 'namespace:command-3', function() {});
        expect(registry.findCommands({
          target: grandchild
        }).slice(0, 3)).toEqual([
          {
            name: 'namespace:command-3',
            displayName: 'Namespace: Command 3'
          }, {
            name: 'namespace:command-2',
            displayName: 'Namespace: Command 2'
          }, {
            name: 'namespace:command-1',
            displayName: 'Namespace: Command 1'
          }
        ]);
        registry.restoreSnapshot(snapshot);
        expect(registry.findCommands({
          target: grandchild
        }).slice(0, 2)).toEqual([
          {
            name: 'namespace:command-2',
            displayName: 'Namespace: Command 2'
          }, {
            name: 'namespace:command-1',
            displayName: 'Namespace: Command 1'
          }
        ]);
        registry.add('.grandchild', 'namespace:command-3', function() {});
        registry.restoreSnapshot(snapshot);
        return expect(registry.findCommands({
          target: grandchild
        }).slice(0, 2)).toEqual([
          {
            name: 'namespace:command-2',
            displayName: 'Namespace: Command 2'
          }, {
            name: 'namespace:command-1',
            displayName: 'Namespace: Command 1'
          }
        ]);
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGVBQUE7O0FBQUEsRUFBQSxlQUFBLEdBQWtCLE9BQUEsQ0FBUSx5QkFBUixDQUFsQixDQUFBOztBQUFBLEVBRUEsUUFBQSxDQUFTLGlCQUFULEVBQTRCLFNBQUEsR0FBQTtBQUMxQixRQUFBLHlDQUFBO0FBQUEsSUFBQSxPQUF3QyxFQUF4QyxFQUFDLGtCQUFELEVBQVcsZ0JBQVgsRUFBbUIsZUFBbkIsRUFBMEIsb0JBQTFCLENBQUE7QUFBQSxJQUVBLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLE1BQUEsR0FBUyxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUFULENBQUE7QUFBQSxNQUNBLEtBQUEsR0FBUSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQURSLENBQUE7QUFBQSxNQUVBLFVBQUEsR0FBYSxRQUFRLENBQUMsYUFBVCxDQUF1QixLQUF2QixDQUZiLENBQUE7QUFBQSxNQUdBLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBakIsQ0FBcUIsUUFBckIsQ0FIQSxDQUFBO0FBQUEsTUFJQSxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQWhCLENBQW9CLE9BQXBCLENBSkEsQ0FBQTtBQUFBLE1BS0EsVUFBVSxDQUFDLFNBQVMsQ0FBQyxHQUFyQixDQUF5QixZQUF6QixDQUxBLENBQUE7QUFBQSxNQU1BLEtBQUssQ0FBQyxXQUFOLENBQWtCLFVBQWxCLENBTkEsQ0FBQTtBQUFBLE1BT0EsTUFBTSxDQUFDLFdBQVAsQ0FBbUIsS0FBbkIsQ0FQQSxDQUFBO0FBQUEsTUFRQSxRQUFRLENBQUMsYUFBVCxDQUF1QixrQkFBdkIsQ0FBMEMsQ0FBQyxXQUEzQyxDQUF1RCxNQUF2RCxDQVJBLENBQUE7YUFVQSxRQUFBLEdBQWUsSUFBQSxlQUFBLENBQWdCLE1BQWhCLEVBWE47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
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/command-registry-spec.coffee