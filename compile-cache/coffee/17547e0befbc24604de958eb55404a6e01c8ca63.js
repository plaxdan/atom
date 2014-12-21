(function() {
  var RegexRailroadDiagramView;

  RegexRailroadDiagramView = require('./regex-railroad-diagram-view');

  module.exports = {
    regexRailroadDiagramView: null,
    activate: function(state) {
      return this.regexRailroadDiagramView = new RegexRailroadDiagramView(state.regexRailroadDiagramViewState);
    },
    deactivate: function() {
      return this.regexRailroadDiagramView.destroy();
    },
    serialize: function() {
      return {
        regexRailroadDiagramViewState: this.regexRailroadDiagramView.serialize()
      };
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdCQUFBOztBQUFBLEVBQUEsd0JBQUEsR0FBMkIsT0FBQSxDQUFRLCtCQUFSLENBQTNCLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNFO0FBQUEsSUFBQSx3QkFBQSxFQUEwQixJQUExQjtBQUFBLElBRUEsUUFBQSxFQUFVLFNBQUMsS0FBRCxHQUFBO2FBRVIsSUFBQyxDQUFBLHdCQUFELEdBQWdDLElBQUEsd0JBQUEsQ0FBeUIsS0FBSyxDQUFDLDZCQUEvQixFQUZ4QjtJQUFBLENBRlY7QUFBQSxJQU9BLFVBQUEsRUFBWSxTQUFBLEdBQUE7YUFDVixJQUFDLENBQUEsd0JBQXdCLENBQUMsT0FBMUIsQ0FBQSxFQURVO0lBQUEsQ0FQWjtBQUFBLElBVUEsU0FBQSxFQUFXLFNBQUEsR0FBQTthQUNUO0FBQUEsUUFBQSw2QkFBQSxFQUErQixJQUFDLENBQUEsd0JBQXdCLENBQUMsU0FBMUIsQ0FBQSxDQUEvQjtRQURTO0lBQUEsQ0FWWDtHQUhGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/regex-railroad-diagram/lib/regex-railroad-diagram.coffee