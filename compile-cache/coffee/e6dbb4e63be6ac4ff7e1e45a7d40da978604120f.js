(function() {
  var FindUsages, Omni,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Omni = require('../../omni-sharp-server/omni');

  module.exports = FindUsages = (function() {
    function FindUsages(atomSharper) {
      this.activate = __bind(this.activate, this);
      this.atomSharper = atomSharper;
    }

    FindUsages.prototype.activate = function() {
      return atom.workspaceView.command("omnisharp-atom:find-usages", (function(_this) {
        return function() {
          Omni.findUsages();
          return _this.atomSharper.outputView.selectPane("find");
        };
      })(this));
    };

    return FindUsages;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdCQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLDhCQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ1E7QUFFUyxJQUFBLG9CQUFDLFdBQUQsR0FBQTtBQUNYLGlEQUFBLENBQUE7QUFBQSxNQUFBLElBQUMsQ0FBQSxXQUFELEdBQWUsV0FBZixDQURXO0lBQUEsQ0FBYjs7QUFBQSx5QkFHQSxRQUFBLEdBQVUsU0FBQSxHQUFBO2FBQ1IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFuQixDQUEyQiw0QkFBM0IsRUFBeUQsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtBQUN2RCxVQUFBLElBQUksQ0FBQyxVQUFMLENBQUEsQ0FBQSxDQUFBO2lCQUNBLEtBQUMsQ0FBQSxXQUFXLENBQUMsVUFBVSxDQUFDLFVBQXhCLENBQW1DLE1BQW5DLEVBRnVEO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekQsRUFEUTtJQUFBLENBSFYsQ0FBQTs7c0JBQUE7O01BTEosQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/omnisharp-atom/lib/omnisharp-atom/features/find-usages.coffee