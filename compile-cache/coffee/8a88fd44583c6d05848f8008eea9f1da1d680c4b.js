(function() {
  var CoveringView, NavigationView,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CoveringView = require('./covering-view');

  module.exports = NavigationView = (function(_super) {
    __extends(NavigationView, _super);

    function NavigationView() {
      return NavigationView.__super__.constructor.apply(this, arguments);
    }

    NavigationView.content = function(navigator, editorView) {
      return this.div({
        "class": 'controls navigation'
      }, (function(_this) {
        return function() {
          _this.text(' ');
          return _this.span({
            "class": 'pull-right'
          }, function() {
            _this.button({
              "class": 'btn btn-xs',
              click: 'up',
              outlet: 'prevBtn'
            }, 'prev');
            return _this.button({
              "class": 'btn btn-xs',
              click: 'down',
              outlet: 'nextBtn'
            }, 'next');
          });
        };
      })(this));
    };

    NavigationView.prototype.initialize = function(navigator, editorView) {
      this.navigator = navigator;
      NavigationView.__super__.initialize.call(this, editorView);
      this.prependKeystroke('merge-conflicts:previous-unresolved', this.prevBtn);
      this.prependKeystroke('merge-conflicts:next-unresolved', this.nextBtn);
      return this.navigator.conflict.on('conflict:resolved', (function(_this) {
        return function() {
          _this.deleteMarker(_this.cover());
          return _this.hide();
        };
      })(this));
    };

    NavigationView.prototype.cover = function() {
      return this.navigator.separatorMarker;
    };

    NavigationView.prototype.up = function() {
      var _ref;
      return this.scrollTo((_ref = this.navigator.previousUnresolved()) != null ? _ref.scrollTarget() : void 0);
    };

    NavigationView.prototype.down = function() {
      var _ref;
      return this.scrollTo((_ref = this.navigator.nextUnresolved()) != null ? _ref.scrollTarget() : void 0);
    };

    NavigationView.prototype.conflict = function() {
      return this.navigator.conflict;
    };

    return NavigationView;

  })(CoveringView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDRCQUFBO0lBQUE7bVNBQUE7O0FBQUEsRUFBQSxZQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSLENBQWYsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFDSixxQ0FBQSxDQUFBOzs7O0tBQUE7O0FBQUEsSUFBQSxjQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsU0FBRCxFQUFZLFVBQVosR0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUs7QUFBQSxRQUFBLE9BQUEsRUFBTyxxQkFBUDtPQUFMLEVBQW1DLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7QUFDakMsVUFBQSxLQUFDLENBQUEsSUFBRCxDQUFNLEdBQU4sQ0FBQSxDQUFBO2lCQUNBLEtBQUMsQ0FBQSxJQUFELENBQU07QUFBQSxZQUFBLE9BQUEsRUFBTyxZQUFQO1dBQU4sRUFBMkIsU0FBQSxHQUFBO0FBQ3pCLFlBQUEsS0FBQyxDQUFBLE1BQUQsQ0FBUTtBQUFBLGNBQUEsT0FBQSxFQUFPLFlBQVA7QUFBQSxjQUFxQixLQUFBLEVBQU8sSUFBNUI7QUFBQSxjQUFrQyxNQUFBLEVBQVEsU0FBMUM7YUFBUixFQUE2RCxNQUE3RCxDQUFBLENBQUE7bUJBQ0EsS0FBQyxDQUFBLE1BQUQsQ0FBUTtBQUFBLGNBQUEsT0FBQSxFQUFPLFlBQVA7QUFBQSxjQUFxQixLQUFBLEVBQU8sTUFBNUI7QUFBQSxjQUFvQyxNQUFBLEVBQVEsU0FBNUM7YUFBUixFQUErRCxNQUEvRCxFQUZ5QjtVQUFBLENBQTNCLEVBRmlDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbkMsRUFEUTtJQUFBLENBQVYsQ0FBQTs7QUFBQSw2QkFPQSxVQUFBLEdBQVksU0FBRSxTQUFGLEVBQWEsVUFBYixHQUFBO0FBQ1YsTUFEVyxJQUFDLENBQUEsWUFBQSxTQUNaLENBQUE7QUFBQSxNQUFBLCtDQUFNLFVBQU4sQ0FBQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsZ0JBQUQsQ0FBa0IscUNBQWxCLEVBQXlELElBQUMsQ0FBQSxPQUExRCxDQUZBLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixpQ0FBbEIsRUFBcUQsSUFBQyxDQUFBLE9BQXRELENBSEEsQ0FBQTthQUtBLElBQUMsQ0FBQSxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQXBCLENBQXVCLG1CQUF2QixFQUE0QyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxHQUFBO0FBQzFDLFVBQUEsS0FBQyxDQUFBLFlBQUQsQ0FBYyxLQUFDLENBQUEsS0FBRCxDQUFBLENBQWQsQ0FBQSxDQUFBO2lCQUNBLEtBQUMsQ0FBQSxJQUFELENBQUEsRUFGMEM7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUE1QyxFQU5VO0lBQUEsQ0FQWixDQUFBOztBQUFBLDZCQWlCQSxLQUFBLEdBQU8sU0FBQSxHQUFBO2FBQUcsSUFBQyxDQUFBLFNBQVMsQ0FBQyxnQkFBZDtJQUFBLENBakJQLENBQUE7O0FBQUEsNkJBbUJBLEVBQUEsR0FBSSxTQUFBLEdBQUE7QUFBRyxVQUFBLElBQUE7YUFBQSxJQUFDLENBQUEsUUFBRCw0REFBeUMsQ0FBRSxZQUFqQyxDQUFBLFVBQVYsRUFBSDtJQUFBLENBbkJKLENBQUE7O0FBQUEsNkJBcUJBLElBQUEsR0FBTSxTQUFBLEdBQUE7QUFBRyxVQUFBLElBQUE7YUFBQSxJQUFDLENBQUEsUUFBRCx3REFBcUMsQ0FBRSxZQUE3QixDQUFBLFVBQVYsRUFBSDtJQUFBLENBckJOLENBQUE7O0FBQUEsNkJBdUJBLFFBQUEsR0FBVSxTQUFBLEdBQUE7YUFBRyxJQUFDLENBQUEsU0FBUyxDQUFDLFNBQWQ7SUFBQSxDQXZCVixDQUFBOzswQkFBQTs7S0FEMkIsYUFIN0IsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/merge-conflicts/lib/navigation-view.coffee