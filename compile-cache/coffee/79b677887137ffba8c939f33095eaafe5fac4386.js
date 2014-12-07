(function() {
  var Completion, CompletionProvider;

  CompletionProvider = require("./lib/completion-provider");

  module.exports = Completion = (function() {
    Completion.prototype.editorSubscription = null;

    Completion.prototype.autocomplete = null;

    Completion.prototype.providers = [];

    function Completion() {
      atom.packages.activatePackage("autocomplete-plus-async").then((function(_this) {
        return function(pkg) {
          _this.autocomplete = pkg.mainModule;
          return _this.registerProviders();
        };
      })(this));
    }

    Completion.prototype.registerProviders = function() {
      return this.editorSubscription = atom.workspaceView.eachEditorView((function(_this) {
        return function(editorView) {
          var provider;
          if (editorView.attached && !editorView.mini) {
            provider = new CompletionProvider(editorView);
            _this.autocomplete.registerProviderForEditorView(provider, editorView);
            return _this.providers.push(provider);
          }
        };
      })(this));
    };

    Completion.prototype.deactivate = function() {
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
    };

    return Completion;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDhCQUFBOztBQUFBLEVBQUEsa0JBQUEsR0FBcUIsT0FBQSxDQUFRLDJCQUFSLENBQXJCLENBQUE7O0FBQUEsRUFFQSxNQUFNLENBQUMsT0FBUCxHQUNNO0FBQ0oseUJBQUEsa0JBQUEsR0FBb0IsSUFBcEIsQ0FBQTs7QUFBQSx5QkFDQSxZQUFBLEdBQWMsSUFEZCxDQUFBOztBQUFBLHlCQUVBLFNBQUEsR0FBVyxFQUZYLENBQUE7O0FBR2EsSUFBQSxvQkFBQSxHQUFBO0FBQ1gsTUFBQSxJQUFJLENBQUMsUUFBUSxDQUFDLGVBQWQsQ0FBOEIseUJBQTlCLENBQ0UsQ0FBQyxJQURILENBQ1EsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUMsR0FBRCxHQUFBO0FBQ0osVUFBQSxLQUFDLENBQUEsWUFBRCxHQUFnQixHQUFHLENBQUMsVUFBcEIsQ0FBQTtpQkFDQSxLQUFDLENBQUEsaUJBQUQsQ0FBQSxFQUZJO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FEUixDQUFBLENBRFc7SUFBQSxDQUhiOztBQUFBLHlCQVNBLGlCQUFBLEdBQW1CLFNBQUEsR0FBQTthQUNqQixJQUFDLENBQUEsa0JBQUQsR0FBc0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxjQUFuQixDQUFrQyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxVQUFELEdBQUE7QUFDdEQsY0FBQSxRQUFBO0FBQUEsVUFBQSxJQUFHLFVBQVUsQ0FBQyxRQUFYLElBQXdCLENBQUEsVUFBYyxDQUFDLElBQTFDO0FBQ0UsWUFBQSxRQUFBLEdBQWUsSUFBQSxrQkFBQSxDQUFtQixVQUFuQixDQUFmLENBQUE7QUFBQSxZQUVBLEtBQUMsQ0FBQSxZQUFZLENBQUMsNkJBQWQsQ0FBNEMsUUFBNUMsRUFBc0QsVUFBdEQsQ0FGQSxDQUFBO21CQUlBLEtBQUMsQ0FBQSxTQUFTLENBQUMsSUFBWCxDQUFnQixRQUFoQixFQUxGO1dBRHNEO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBbEMsRUFETDtJQUFBLENBVG5CLENBQUE7O0FBQUEseUJBa0JBLFVBQUEsR0FBWSxTQUFBLEdBQUE7QUFDVixVQUFBLElBQUE7O1lBQW1CLENBQUUsR0FBckIsQ0FBQTtPQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsa0JBQUQsR0FBc0IsSUFEdEIsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLFNBQVMsQ0FBQyxPQUFYLENBQW1CLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLFFBQUQsR0FBQTtpQkFDakIsS0FBQyxDQUFBLFlBQVksQ0FBQyxrQkFBZCxDQUFpQyxRQUFqQyxFQURpQjtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5CLENBSEEsQ0FBQTthQU1BLElBQUMsQ0FBQSxTQUFELEdBQWEsR0FQSDtJQUFBLENBbEJaLENBQUE7O3NCQUFBOztNQUpGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/omnisharp-atom/lib/omnisharp-atom/features/completion.coffee