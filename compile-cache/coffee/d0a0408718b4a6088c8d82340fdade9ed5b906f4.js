(function() {
  var PathsProvider, _;

  _ = require("underscore-plus");

  PathsProvider = require("./paths-provider");

  module.exports = {
    editorSubscription: null,
    providers: [],
    autocomplete: null,

    /*
     * Registers a SnippetProvider for each editor view
     */
    activate: function() {
      return atom.packages.activatePackage("autocomplete-plus").then((function(_this) {
        return function(pkg) {
          _this.autocomplete = pkg.mainModule;
          return _this.registerProviders();
        };
      })(this));
    },

    /*
     * Registers a SnippetProvider for each editor view
     */
    registerProviders: function() {
      return this.editorSubscription = atom.workspaceView.eachEditorView((function(_this) {
        return function(editorView) {
          var provider;
          if (editorView.attached && !editorView.mini) {
            provider = new PathsProvider(editorView);
            _this.autocomplete.registerProviderForEditorView(provider, editorView);
            return _this.providers.push(provider);
          }
        };
      })(this));
    },

    /*
     * Cleans everything up, unregisters all SnippetProvider instances
     */
    deactivate: function() {
      var _ref;
      if ((_ref = this.editorSubscription) != null) {
        _ref.off();
      }
      this.editorSubscription = null;
      this.providers.forEach((function(_this) {
        return function(provider) {
          return _this.autocomplete.unregisterProvider(provider);
        };
      })(this));
      return this.providers = [];
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdCQUFBOztBQUFBLEVBQUEsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQUFKLENBQUE7O0FBQUEsRUFDQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxrQkFBUixDQURoQixDQUFBOztBQUFBLEVBR0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsa0JBQUEsRUFBb0IsSUFBcEI7QUFBQSxJQUNBLFNBQUEsRUFBVyxFQURYO0FBQUEsSUFFQSxZQUFBLEVBQWMsSUFGZDtBQUlBO0FBQUE7O09BSkE7QUFBQSxJQU9BLFFBQUEsRUFBVSxTQUFBLEdBQUE7YUFDUixJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIsbUJBQTlCLENBQ0UsQ0FBQyxJQURILENBQ1EsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsR0FBRCxHQUFBO0FBQ0osVUFBQSxLQUFDLENBQUEsWUFBRCxHQUFnQixHQUFHLENBQUMsVUFBcEIsQ0FBQTtpQkFDQSxLQUFDLENBQUEsaUJBQUQsQ0FBQSxFQUZJO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEUixFQURRO0lBQUEsQ0FQVjtBQWFBO0FBQUE7O09BYkE7QUFBQSxJQWdCQSxpQkFBQSxFQUFtQixTQUFBLEdBQUE7YUFDakIsSUFBQyxDQUFBLGtCQUFELEdBQXNCLElBQUksQ0FBQyxhQUFhLENBQUMsY0FBbkIsQ0FBa0MsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsVUFBRCxHQUFBO0FBQ3RELGNBQUEsUUFBQTtBQUFBLFVBQUEsSUFBRyxVQUFVLENBQUMsUUFBWCxJQUF3QixDQUFBLFVBQWMsQ0FBQyxJQUExQztBQUNFLFlBQUEsUUFBQSxHQUFlLElBQUEsYUFBQSxDQUFjLFVBQWQsQ0FBZixDQUFBO0FBQUEsWUFFQSxLQUFDLENBQUEsWUFBWSxDQUFDLDZCQUFkLENBQTRDLFFBQTVDLEVBQXNELFVBQXRELENBRkEsQ0FBQTttQkFJQSxLQUFDLENBQUEsU0FBUyxDQUFDLElBQVgsQ0FBZ0IsUUFBaEIsRUFMRjtXQURzRDtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDLEVBREw7SUFBQSxDQWhCbkI7QUF5QkE7QUFBQTs7T0F6QkE7QUFBQSxJQTRCQSxVQUFBLEVBQVksU0FBQSxHQUFBO0FBQ1YsVUFBQSxJQUFBOztZQUFtQixDQUFFLEdBQXJCLENBQUE7T0FBQTtBQUFBLE1BQ0EsSUFBQyxDQUFBLGtCQUFELEdBQXNCLElBRHRCLENBQUE7QUFBQSxNQUdBLElBQUMsQ0FBQSxTQUFTLENBQUMsT0FBWCxDQUFtQixDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxRQUFELEdBQUE7aUJBQ2pCLEtBQUMsQ0FBQSxZQUFZLENBQUMsa0JBQWQsQ0FBaUMsUUFBakMsRUFEaUI7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFuQixDQUhBLENBQUE7YUFNQSxJQUFDLENBQUEsU0FBRCxHQUFhLEdBUEg7SUFBQSxDQTVCWjtHQUpGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/autocomplete-paths/lib/autocomplete-paths.coffee