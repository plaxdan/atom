(function() {
  var $$, Regex2RailRoadDiagram, RegexRailroadDiagramView, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), View = _ref.View, $$ = _ref.$$;

  Regex2RailRoadDiagram = require('./regex-to-railroad').Regex2RailRoadDiagram;

  module.exports = RegexRailroadDiagramView = (function(_super) {
    __extends(RegexRailroadDiagramView, _super);

    function RegexRailroadDiagramView() {
      this.updateRailRoadDiagram = __bind(this.updateRailRoadDiagram, this);
      return RegexRailroadDiagramView.__super__.constructor.apply(this, arguments);
    }

    RegexRailroadDiagramView.content = function() {
      return this.div({
        "class": 'regex-railroad-diagram'
      });
    };

    RegexRailroadDiagramView.prototype.initialize = function(serializeState) {
      this.isVisible = false;
      this.currentRegex = null;
      return atom.workspaceView.on('cursor:moved', this.updateRailRoadDiagram);
    };

    RegexRailroadDiagramView.prototype.updateRailRoadDiagram = function() {
      var editor, error, flavour, m, range, sp, text;
      editor = atom.workspace.getActiveEditor();
      if (editor == null) {
        return;
      }
      flavour = "python";
      range = editor.bufferRangeForScopeAtCursor(".raw-regex");
      if (!range) {
        range = editor.bufferRangeForScopeAtCursor(".unicode-raw-regex");
      }
      if (!range) {
        range = editor.bufferRangeForScopeAtCursor(".regexp");
        flavour = "regexp";
      }
      if (!range) {
        if (this.isVisible) {
          this.hideRailRoadDiagram();
          this.currentRegex = null;
        }
      } else {
        text = editor.getTextInBufferRange(range);
        text = text.replace(/^\s+/, "").replace(/\s+$/, "");
        if (text.length === 1 && text === "/") {
          return;
        }
        if (editor.bufferRangeForScopeAtCursor(".php")) {
          m = /^"\/(.*)\/\w*"$/.exec(text);
          if (m != null) {
            text = m[1];
          } else {
            m = /^'\/(.*)\/\w*'$/.exec(text);
            if (m != null) {
              text = m[1];
            }
          }
        } else {
          m = /^u?r('''|"""|"|')(.*)\1$/.exec(text);
          if (m != null) {
            text = m[2];
          }
          m = /^\/\/\/(.*)\/\/\/\w*$/.exec(text);
          if (m != null) {
            text = m[1].replace(/\s+/, "");
          } else {
            m = /^\/(.*)\/\w*$/.exec(text);
            if (m != null) {
              text = m[1];
            }
          }
        }
        if (!this.isVisible || this.currentRegex !== text) {
          this.find('div.error-message').remove();
          try {
            this.showRailRoadDiagram(text, flavour);
          } catch (_error) {
            error = _error;
            if (!this.isVisible) {
              this.showRailRoadDiagram("", flavour);
            }
            sp = " ".repeat(error.offset);
            this.append($$(function() {
              return this.div({
                "class": "error-message"
              }, (function(_this) {
                return function() {
                  return _this.pre("" + text + "\n" + sp + "^\n" + sp + error.message, {
                    "class": "text-error"
                  });
                };
              })(this));
            }));
          }
        }
      }
      return this.currentRegex = text;
    };

    RegexRailroadDiagramView.prototype.serialize = function() {};

    RegexRailroadDiagramView.prototype.destroy = function() {
      return this.detach();
    };

    RegexRailroadDiagramView.prototype.getRegexScope = function(scope) {
      var name, scopeName, _i, _len;
      scopeName = [];
      for (_i = 0, _len = scope.length; _i < _len; _i++) {
        name = scope[_i];
        scopeName.push(name);
        if (/^string\.regexp/.test(name)) {
          scopeName;
        }
      }
      return false;
    };

    RegexRailroadDiagramView.prototype.showRailRoadDiagram = function(regex, flavour) {
      var rr;
      rr = atom.workspaceView.find('.regex-railroad-diagram');
      if (!rr.length) {
        this.hide();
        atom.workspaceView.getActivePaneView().parents('.panes').eq(0).after(this);
      }
      this.children().remove();
      Regex2RailRoadDiagram(regex, this.get(0), {
        flavour: flavour
      });
      this.show();
      return this.isVisible = true;
    };

    RegexRailroadDiagramView.prototype.hideRailRoadDiagram = function() {
      this.hide();
      return this.isVisible = false;
    };

    RegexRailroadDiagramView.prototype.toggle = function() {
      var statusBar;
      statusBar = atom.workspaceView.find('.status-bar');
      if (statusBar.length > 0) {
        this.insertBefore(statusBar);
      } else {
        atom.workspace.getActivePane().append(this);
      }
      Diagram(Choice(0, Skip(), '-'), Choice(0, NonTerminal('name-start char'), NonTerminal('escape')), ZeroOrMore(Choice(0, NonTerminal('name char'), NonTerminal('escape')))).addTo(this.get(0));
      return this;
    };

    return RegexRailroadDiagramView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLCtEQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsT0FBYSxPQUFBLENBQVEsTUFBUixDQUFiLEVBQUMsWUFBQSxJQUFELEVBQU8sVUFBQSxFQUFQLENBQUE7O0FBQUEsRUFDQyx3QkFBeUIsT0FBQSxDQUFRLHFCQUFSLEVBQXpCLHFCQURELENBQUE7O0FBQUEsRUFHQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0osK0NBQUEsQ0FBQTs7Ozs7S0FBQTs7QUFBQSxJQUFBLHdCQUFDLENBQUEsT0FBRCxHQUFVLFNBQUEsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyx3QkFBUDtPQUFMLEVBRFE7SUFBQSxDQUFWLENBQUE7O0FBQUEsdUNBR0EsVUFBQSxHQUFZLFNBQUMsY0FBRCxHQUFBO0FBR1YsTUFBQSxJQUFDLENBQUEsU0FBRCxHQUFnQixLQUFoQixDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQURoQixDQUFBO2FBSUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFuQixDQUFzQixjQUF0QixFQUFzQyxJQUFDLENBQUEscUJBQXZDLEVBUFU7SUFBQSxDQUhaLENBQUE7O0FBQUEsdUNBWUEscUJBQUEsR0FBdUIsU0FBQSxHQUFBO0FBQ3JCLFVBQUEsMENBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGVBQWYsQ0FBQSxDQUFULENBQUE7QUFDQSxNQUFBLElBQWMsY0FBZDtBQUFBLGNBQUEsQ0FBQTtPQURBO0FBQUEsTUFHQSxPQUFBLEdBQVUsUUFIVixDQUFBO0FBQUEsTUFPQSxLQUFBLEdBQVEsTUFBTSxDQUFDLDJCQUFQLENBQW1DLFlBQW5DLENBUFIsQ0FBQTtBQVNBLE1BQUEsSUFBQSxD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
//# sourceURL=/Users/daniel/.atom/packages/regex-railroad-diagram/lib/regex-railroad-diagram-view.coffee