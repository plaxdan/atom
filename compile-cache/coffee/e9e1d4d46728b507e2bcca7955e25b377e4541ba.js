(function() {
  var $;

  $ = require('atom').$;

  describe('"atom" protocol URL', function() {
    return it('sends the file relative in the package as response', function() {
      var callback, called;
      called = false;
      callback = function() {
        return called = true;
      };
      $.ajax({
        url: 'atom://async/package.json',
        success: callback,
        error: callback
      });
      return waitsFor('request to be done', function() {
        return called === true;
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLENBQUE7O0FBQUEsRUFBQyxJQUFLLE9BQUEsQ0FBUSxNQUFSLEVBQUwsQ0FBRCxDQUFBOztBQUFBLEVBRUEsUUFBQSxDQUFTLHFCQUFULEVBQWdDLFNBQUEsR0FBQTtXQUM5QixFQUFBLENBQUcsb0RBQUgsRUFBeUQsU0FBQSxHQUFBO0FBQ3ZELFVBQUEsZ0JBQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxLQUFULENBQUE7QUFBQSxNQUNBLFFBQUEsR0FBVyxTQUFBLEdBQUE7ZUFBRyxNQUFBLEdBQVMsS0FBWjtNQUFBLENBRFgsQ0FBQTtBQUFBLE1BRUEsQ0FBQyxDQUFDLElBQUYsQ0FDRTtBQUFBLFFBQUEsR0FBQSxFQUFLLDJCQUFMO0FBQUEsUUFDQSxPQUFBLEVBQVMsUUFEVDtBQUFBLFFBS0EsS0FBQSxFQUFPLFFBTFA7T0FERixDQUZBLENBQUE7YUFVQSxRQUFBLENBQVMsb0JBQVQsRUFBK0IsU0FBQSxHQUFBO2VBQUcsTUFBQSxLQUFVLEtBQWI7TUFBQSxDQUEvQixFQVh1RDtJQUFBLENBQXpELEVBRDhCO0VBQUEsQ0FBaEMsQ0FGQSxDQUFBO0FBQUEiCn0=
//# sourceURL=/Applications/Atom.app/Contents/Resources/app/spec/atom-protocol-handler-spec.coffee