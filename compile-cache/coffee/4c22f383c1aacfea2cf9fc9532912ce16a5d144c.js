(function() {
  var ErrorHandler,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  module.exports = ErrorHandler = (function() {
    function ErrorHandler() {
      this.activate = __bind(this.activate, this);
    }

    ErrorHandler.prototype.activate = function() {
      return atom.on("omnisharp-atom:error", function(err) {
        return console.error(err);
      });
    };

    return ErrorHandler;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLFlBQUE7SUFBQSxrRkFBQTs7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQ1E7OztLQUVKOztBQUFBLDJCQUFBLFFBQUEsR0FBVSxTQUFBLEdBQUE7YUFDUixJQUFJLENBQUMsRUFBTCxDQUFRLHNCQUFSLEVBQWdDLFNBQUMsR0FBRCxHQUFBO2VBQVMsT0FBTyxDQUFDLEtBQVIsQ0FBYyxHQUFkLEVBQVQ7TUFBQSxDQUFoQyxFQURRO0lBQUEsQ0FBVixDQUFBOzt3QkFBQTs7TUFISixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/omnisharp-atom/lib/omnisharp-atom/features/error-handler.coffee