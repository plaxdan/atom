(function() {
  var CoffeeNavigatorView;

  CoffeeNavigatorView = require('./coffee-navigator-view');

  module.exports = {
    coffeeNavigatorView: null,
    activate: function(state) {
      return this.coffeeNavigatorView = new CoffeeNavigatorView(state.coffeeNavigatorViewState);
    },
    deactivate: function() {
      return this.coffeeNavigatorView.destroy();
    },
    serialize: function() {
      return {
        coffeeNavigatorViewState: this.coffeeNavigatorView.serialize()
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLG1CQUFBOztBQUFBLEVBQUEsbUJBQUEsR0FBc0IsT0FBQSxDQUFRLHlCQUFSLENBQXRCLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSxtQkFBQSxFQUFxQixJQUFyQjtBQUFBLElBRUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO2FBQ1IsSUFBQyxDQUFBLG1CQUFELEdBQTJCLElBQUEsbUJBQUEsQ0FDekIsS0FBSyxDQUFDLHdCQURtQixFQURuQjtJQUFBLENBRlY7QUFBQSxJQU1BLFVBQUEsRUFBWSxTQUFBLEdBQUE7YUFDVixJQUFDLENBQUEsbUJBQW1CLENBQUMsT0FBckIsQ0FBQSxFQURVO0lBQUEsQ0FOWjtBQUFBLElBU0EsU0FBQSxFQUFXLFNBQUEsR0FBQTthQUNUO0FBQUEsUUFBQSx3QkFBQSxFQUEwQixJQUFDLENBQUEsbUJBQW1CLENBQUMsU0FBckIsQ0FBQSxDQUExQjtRQURTO0lBQUEsQ0FUWDtHQUhGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/coffee-navigator/lib/coffee-navigator.coffee