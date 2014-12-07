(function() {
  var $$, DiffView, FileView, View, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  _ref = require('atom'), $$ = _ref.$$, View = _ref.View;

  DiffView = require('../diffs/diff-view');

  FileView = (function(_super) {
    __extends(FileView, _super);

    function FileView() {
      this.showDiff = __bind(this.showDiff, this);
      this.showSelection = __bind(this.showSelection, this);
      this.clicked = __bind(this.clicked, this);
      this.beforeRemove = __bind(this.beforeRemove, this);
      return FileView.__super__.constructor.apply(this, arguments);
    }

    FileView.content = function(file) {
      return this.div({
        "class": 'file',
        mousedown: 'clicked'
      }, (function(_this) {
        return function() {
          _this.span({
            "class": 'mode'
          }, file.getMode());
          return _this.span({
            "class": 'path'
          }, file.path());
        };
      })(this));
    };

    FileView.prototype.initialize = function(model) {
      this.model = model;
      this.model.on('change:selected', this.showSelection);
      this.model.on('change:diff', this.showDiff);
      this.showSelection();
      return this.showDiff();
    };

    FileView.prototype.beforeRemove = function() {
      this.model.off('change:selected', this.showSelection);
      return this.model.off('change:diff', this.showDiff);
    };

    FileView.prototype.clicked = function() {
      return this.model.selfSelect();
    };

    FileView.prototype.showSelection = function() {
      return this.toggleClass('selected', this.model.isSelected());
    };

    FileView.prototype.showDiff = function() {
      this.find('.diff').remove();
      if (this.model.showDiffP()) {
        return this.append(new DiffView(this.model.diff()));
      }
    };

    return FileView;

  })(View);

  module.exports = FileView;

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGtDQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUEsT0FBYSxPQUFBLENBQVEsTUFBUixDQUFiLEVBQUMsVUFBQSxFQUFELEVBQUssWUFBQSxJQUFMLENBQUE7O0FBQUEsRUFDQSxRQUFBLEdBQVcsT0FBQSxDQUFRLG9CQUFSLENBRFgsQ0FBQTs7QUFBQSxFQUlNO0FBQ0osK0JBQUEsQ0FBQTs7Ozs7Ozs7S0FBQTs7QUFBQSxJQUFBLFFBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxJQUFELEdBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO0FBQUEsUUFBQSxPQUFBLEVBQU8sTUFBUDtBQUFBLFFBQWUsU0FBQSxFQUFXLFNBQTFCO09BQUwsRUFBMEMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUN4QyxVQUFBLEtBQUMsQ0FBQSxJQUFELENBQU07QUFBQSxZQUFBLE9BQUEsRUFBTyxNQUFQO1dBQU4sRUFBcUIsSUFBSSxDQUFDLE9BQUwsQ0FBQSxDQUFyQixDQUFBLENBQUE7aUJBQ0EsS0FBQyxDQUFBLElBQUQsQ0FBTTtBQUFBLFlBQUEsT0FBQSxFQUFPLE1BQVA7V0FBTixFQUFxQixJQUFJLENBQUMsSUFBTCxDQUFBLENBQXJCLEVBRndDO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBMUMsRUFEUTtJQUFBLENBQVYsQ0FBQTs7QUFBQSx1QkFNQSxVQUFBLEdBQVksU0FBRSxLQUFGLEdBQUE7QUFDVixNQURXLElBQUMsQ0FBQSxRQUFBLEtBQ1osQ0FBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsaUJBQVYsRUFBNkIsSUFBQyxDQUFBLGFBQTlCLENBQUEsQ0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxFQUFQLENBQVUsYUFBVixFQUF5QixJQUFDLENBQUEsUUFBMUIsQ0FEQSxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsYUFBRCxDQUFBLENBRkEsQ0FBQTthQUdBLElBQUMsQ0FBQSxRQUFELENBQUEsRUFKVTtJQUFBLENBTlosQ0FBQTs7QUFBQSx1QkFhQSxZQUFBLEdBQWMsU0FBQSxHQUFBO0FBQ1osTUFBQSxJQUFDLENBQUEsS0FBSyxDQUFDLEdBQVAsQ0FBVyxpQkFBWCxFQUE4QixJQUFDLENBQUEsYUFBL0IsQ0FBQSxDQUFBO2FBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxHQUFQLENBQVcsYUFBWCxFQUEwQixJQUFDLENBQUEsUUFBM0IsRUFGWTtJQUFBLENBYmQsQ0FBQTs7QUFBQSx1QkFrQkEsT0FBQSxHQUFTLFNBQUEsR0FBQTthQUNQLElBQUMsQ0FBQSxLQUFLLENBQUMsVUFBUCxDQUFBLEVBRE87SUFBQSxDQWxCVCxDQUFBOztBQUFBLHVCQXNCQSxhQUFBLEdBQWUsU0FBQSxHQUFBO2FBQ2IsSUFBQyxDQUFBLFdBQUQsQ0FBYSxVQUFiLEVBQXlCLElBQUMsQ0FBQSxLQUFLLENBQUMsVUFBUCxDQUFBLENBQXpCLEVBRGE7SUFBQSxDQXRCZixDQUFBOztBQUFBLHVCQTBCQSxRQUFBLEdBQVUsU0FBQSxHQUFBO0FBQ1IsTUFBQSxJQUFDLENBQUEsSUFBRCxDQUFNLE9BQU4sQ0FBYyxDQUFDLE1BQWYsQ0FBQSxDQUFBLENBQUE7QUFDQSxNQUFBLElBQXVDLElBQUMsQ0FBQSxLQUFLLENBQUMsU0FBUCxDQUFBLENBQXZDO2VBQUEsSUFBQyxDQUFBLE1BQUQsQ0FBWSxJQUFBLFFBQUEsQ0FBUyxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQSxDQUFULENBQVosRUFBQTtPQUZRO0lBQUEsQ0ExQlYsQ0FBQTs7b0JBQUE7O0tBRHFCLEtBSnZCLENBQUE7O0FBQUEsRUFtQ0EsTUFBTSxDQUFDLE9BQVAsR0FBaUIsUUFuQ2pCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/atomatigit/lib/views/files/file-view.coffee