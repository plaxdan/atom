(function() {
  var CoveringView, SideView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CoveringView = require('./covering-view').CoveringView;

  module.exports = SideView = (function(_super) {
    __extends(SideView, _super);

    function SideView() {
      return SideView.__super__.constructor.apply(this, arguments);
    }

    SideView.content = function(side, editorView) {
      return this.div({
        "class": "side " + (side.klass()) + " " + side.position + " ui-site-" + (side.site())
      }, (function(_this) {
        return function() {
          return _this.div({
            "class": 'controls'
          }, function() {
            _this.label({
              "class": 'text-highlight'
            }, side.ref);
            _this.span({
              "class": 'text-subtle'
            }, "// " + (side.description()));
            return _this.span({
              "class": 'pull-right'
            }, function() {
              _this.button({
                "class": 'btn btn-xs inline-block-tight revert',
                click: 'revert',
                outlet: 'revertBtn'
              }, 'Revert');
              return _this.button({
                "class": 'btn btn-xs inline-block-tight',
                click: 'useMe',
                outlet: 'useMeBtn'
              }, 'Use Me');
            });
          });
        };
      })(this));
    };

    SideView.prototype.initialize = function(side, editorView) {
      this.side = side;
      SideView.__super__.initialize.call(this, editorView);
      this.detectDirty();
      this.prependKeystroke(this.side.eventName(), this.useMeBtn);
      this.prependKeystroke('merge-conflicts:revert-current', this.revertBtn);
      return this.side.conflict.on('conflict:resolved', (function(_this) {
        return function() {
          _this.deleteMarker(_this.side.refBannerMarker);
          if (!_this.side.wasChosen()) {
            _this.deleteMarker(_this.side.marker);
          }
          return _this.remove();
        };
      })(this));
    };

    SideView.prototype.cover = function() {
      return this.side.refBannerMarker;
    };

    SideView.prototype.conflict = function() {
      return this.side.conflict;
    };

    SideView.prototype.isDirty = function() {
      return this.side.isDirty;
    };

    SideView.prototype.useMe = function() {
      return this.side.resolve();
    };

    SideView.prototype.revert = function() {
      return this.editor().setTextInBufferRange(this.side.marker.getBufferRange(), this.side.originalText);
    };

    SideView.prototype.detectDirty = function() {
      var currentText;
      currentText = this.editor().getTextInBufferRange(this.side.marker.getBufferRange());
      this.side.isDirty = currentText !== this.side.originalText;
      this.removeClass('dirty');
      if (this.side.isDirty) {
        return this.addClass('dirty');
      }
    };

    return SideView;

  })(CoveringView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQyxlQUFnQixPQUFBLENBQVEsaUJBQVIsRUFBaEIsWUFBRCxDQUFBOztBQUFBLEVBRUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUVKLCtCQUFBLENBQUE7Ozs7S0FBQTs7QUFBQSxJQUFBLFFBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxJQUFELEVBQU8sVUFBUCxHQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztBQUFBLFFBQUEsT0FBQSxFQUFRLE9BQUEsR0FBTSxDQUFBLElBQUksQ0FBQyxLQUFMLENBQUEsQ0FBQSxDQUFOLEdBQW9CLEdBQXBCLEdBQXNCLElBQUksQ0FBQyxRQUEzQixHQUFxQyxXQUFyQyxHQUErQyxDQUFBLElBQUksQ0FBQyxJQUFMLENBQUEsQ0FBQSxDQUF2RDtPQUFMLEVBQTRFLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQzFFLEtBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxZQUFBLE9BQUEsRUFBTyxVQUFQO1dBQUwsRUFBd0IsU0FBQSxHQUFBO0FBQ3RCLFlBQUEsS0FBQyxDQUFBLEtBQUQsQ0FBTztBQUFBLGNBQUEsT0FBQSxFQUFPLGdCQUFQO2FBQVAsRUFBZ0MsSUFBSSxDQUFDLEdBQXJDLENBQUEsQ0FBQTtBQUFBLFlBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTTtBQUFBLGNBQUEsT0FBQSxFQUFPLGFBQVA7YUFBTixFQUE2QixLQUFBLEdBQUksQ0FBQSxJQUFJLENBQUMsV0FBTCxDQUFBLENBQUEsQ0FBakMsQ0FEQSxDQUFBO21CQUVBLEtBQUMsQ0FBQSxJQUFELENBQU07QUFBQSxjQUFBLE9BQUEsRUFBTyxZQUFQO2FBQU4sRUFBMkIsU0FBQSxHQUFBO0FBQ3pCLGNBQUEsS0FB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
//# sourceURL=/Users/daniel/.atom/packages/merge-conflicts/lib/side-view.coffee