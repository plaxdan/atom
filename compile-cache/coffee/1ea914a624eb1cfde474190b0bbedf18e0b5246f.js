(function() {
  module.exports = {
    unique: function(arr) {
      var i, item, out, seen;
      out = [];
      seen = new Set;
      i = arr.length;
      while (i--) {
        item = arr[i];
        if (!seen.has(item)) {
          out.push(item);
          seen.add(item);
        }
      }
      return out;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBT0U7QUFBQSxJQUFBLE1BQUEsRUFBUSxTQUFDLEdBQUQsR0FBQTtBQUNOLFVBQUEsa0JBQUE7QUFBQSxNQUFBLEdBQUEsR0FBTSxFQUFOLENBQUE7QUFBQSxNQUNBLElBQUEsR0FBTyxHQUFBLENBQUEsR0FEUCxDQUFBO0FBQUEsTUFHQSxDQUFBLEdBQUksR0FBRyxDQUFDLE1BSFIsQ0FBQTtBQUlBLGFBQU0sQ0FBQSxFQUFOLEdBQUE7QUFDRSxRQUFBLElBQUEsR0FBTyxHQUFJLENBQUEsQ0FBQSxDQUFYLENBQUE7QUFDQSxRQUFBLElBQUEsQ0FBQSxJQUFXLENBQUMsR0FBTCxDQUFTLElBQVQsQ0FBUDtBQUNFLFVBQUEsR0FBRyxDQUFDLElBQUosQ0FBUyxJQUFULENBQUEsQ0FBQTtBQUFBLFVBQ0EsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFULENBREEsQ0FERjtTQUZGO01BQUEsQ0FKQTtBQVVBLGFBQU8sR0FBUCxDQVhNO0lBQUEsQ0FBUjtHQVBGLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/autocomplete-paths/node_modules/autocomplete-plus/lib/utils.coffee