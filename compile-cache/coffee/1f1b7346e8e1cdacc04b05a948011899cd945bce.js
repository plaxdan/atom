(function() {
  var GitBridge, ResolverView, View,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  View = require('atom').View;

  GitBridge = require('./git-bridge');

  module.exports = ResolverView = (function(_super) {
    __extends(ResolverView, _super);

    function ResolverView() {
      return ResolverView.__super__.constructor.apply(this, arguments);
    }

    ResolverView.content = function(editor) {
      return this.div({
        "class": 'overlay from-top resolver'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'block text-highlight'
          }, "We're done here");
          _this.div({
            "class": 'block'
          }, function() {
            _this.div({
              "class": 'block text-info'
            }, function() {
              return _this.text("You've dealt with all of the conflicts in this file.");
            });
            return _this.div({
              "class": 'block text-info'
            }, function() {
              _this.span({
                outlet: 'actionText'
              }, 'Save and stage');
              return _this.text(' this file for commit?');
            });
          });
          return _this.div({
            "class": 'pull-right'
          }, function() {
            return _this.button({
              "class": 'btn btn-primary',
              click: 'resolve'
            }, 'Mark Resolved');
          });
        };
      })(this));
    };

    ResolverView.prototype.initialize = function(editor) {
      this.editor = editor;
      this.refresh();
      return this.editor.getBuffer().on('saved', (function(_this) {
        return function() {
          return _this.refresh();
        };
      })(this));
    };

    ResolverView.prototype.getModel = function() {
      return null;
    };

    ResolverView.prototype.relativePath = function() {
      return atom.project.getRepo().relativize(this.editor.getUri());
    };

    ResolverView.prototype.refresh = function() {
      return GitBridge.isStaged(this.relativePath(), (function(_this) {
        return function(staged) {
          var modified, needsSaved, needsStaged;
          modified = _this.editor.isModified();
          needsSaved = modified;
          needsStaged = modified || !staged;
          if (!(needsSaved || needsStaged)) {
            _this.hide('fast', function() {
              return this.remove();
            });
            atom.emit('merge-conflicts:staged', {
              file: _this.editor.getUri()
            });
            return;
          }
          if (needsSaved) {
            return _this.actionText.text('Save and stage');
          } else if (needsStaged) {
            return _this.actionText.text('Stage');
          }
        };
      })(this));
    };

    ResolverView.prototype.resolve = function() {
      this.editor.save();
      return GitBridge.add(this.relativePath(), (function(_this) {
        return function() {
          return _this.refresh();
        };
      })(this));
    };

    return ResolverView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxPQUFRLE9BQUEsQ0FBUSxNQUFSLEVBQVIsSUFBRCxDQUFBOztBQUFBLEVBQ0EsU0FBQSxHQUFZLE9BQUEsQ0FBUSxjQUFSLENBRFosQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFFSixtQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxZQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsTUFBRCxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFPLDJCQUFQO09BQUwsRUFBeUMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUN2QyxVQUFBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxzQkFBUDtXQUFMLEVBQW9DLGlCQUFwQyxDQUFBLENBQUE7QUFBQSxVQUNBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxPQUFQO1dBQUwsRUFBcUIsU0FBQSxHQUFBO0FBQ25CLFlBQUEsS0FBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLGNBQUEsT0FBQSxFQUFPLGlCQUFQO2FBQUwsRUFBK0IsU0FBQSxHQUFBO3FCQUM3QixLQUFDLENBQUEsSUFBRCxDQUFNLHNEQUFOLEVBRDZCO1lBQUEsQ0FBL0IsQ0FBQSxDQUFBO21CQUVBLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxjQUFBLE9BQUEsRUFBTyxpQkFBUDthQUFMLEVBQStCLFNBQUEsR0FBQTtBQUM3QixjQUFBLEtBQUMsQ0FBQSxJQUFELENBQU07QUFBQSxnQkFBQSxNQUFBLEVBQVEsWUFBUjtlQUFOLEVBQTRCLGdCQUE1QixDQUFBLENBQUE7cUJBQ0EsS0FBQyxD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
//# sourceURL=/Users/daniel/.atom/packages/merge-conflicts/lib/resolver-view.coffee