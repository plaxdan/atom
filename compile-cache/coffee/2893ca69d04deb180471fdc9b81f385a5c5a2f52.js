(function() {
  var CoveringView, SideView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CoveringView = require('./covering-view');

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
      this.side.conflict.on('conflict:resolved', (function(_this) {
        return function() {
          _this.deleteMarker(_this.side.refBannerMarker);
          if (!_this.side.wasChosen()) {
            _this.deleteMarker(_this.side.marker);
          }
          return _this.remove();
        };
      })(this));
      return this.side.marker.on('changed', (function(_this) {
        return function(event) {
          var headDifferent, marker, tailSame;
          marker = _this.side.marker;
          tailSame = event.oldTailBufferPosition.isEqual(marker.getTailBufferPosition());
          headDifferent = !event.oldHeadBufferPosition.isEqual(marker.getHeadBufferPosition());
          if (tailSame && headDifferent) {
            return _this.detectDirty();
          }
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
      var currentText, wasDirty;
      wasDirty = this.side.isDirty;
      currentText = this.editor().getTextInBufferRange(this.side.marker.getBufferRange());
      this.side.isDirty = currentText !== this.side.originalText;
      if (this.side.isDirty && !wasDirty) {
        this.addClass('dirty');
      }
      if (!this.side.isDirty && wasDirty) {
        return this.removeClass('dirty');
      }
    };

    return SideView;

  })(CoveringView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBQWYsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFFSiwrQkFBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxRQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsSUFBRCxFQUFPLFVBQVAsR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBUSxPQUFBLEdBQU0sQ0FBQSxJQUFJLENBQUMsS0FBTCxDQUFBLENBQUEsQ0FBTixHQUFvQixHQUFwQixHQUFzQixJQUFJLENBQUMsUUFBM0IsR0FBcUMsV0FBckMsR0FBK0MsQ0FBQSxJQUFJLENBQUMsSUFBTCxDQUFBLENBQUEsQ0FBdkQ7T0FBTCxFQUE0RSxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO2lCQUMxRSxLQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsWUFBQSxPQUFBLEVBQU8sVUFBUDtXQUFMLEVBQXdCLFNBQUEsR0FBQTtBQUN0QixZQUFBLEtBQUMsQ0FBQSxLQUFELENBQU87QUFBQSxjQUFBLE9BQUEsRUFBTyxnQkFBUDthQUFQLEVBQWdDLElBQUksQ0FBQyxHQUFyQyxDQUFBLENBQUE7QUFBQSxZQUNBLEtBQUMsQ0FBQSxJQUFELENBQU07QUFBQSxjQUFBLE9BQUEsRUFBTyxhQUFQO2FBQU4sRUFBNkIsS0FBQSxHQUFJLENBQUEsSUFBSSxDQUFDLFdBQUwsQ0FBQSxDQUFBLENBQWpDLENBREEsQ0FBQTttQkFFQSxLQUFDLENBQUEsSUFBRCxDQUFNO0FBQUEsY0FBQSxPQUFBLEVBQU8sWUFBUDthQUFOLEVBQTJCLFNBQUEsR0FBQTtBQUN6QixjQUFBLEtBQUMs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
//# sourceURL=/Users/daniel/.atom/packages/merge-conflicts/lib/side-view.coffee