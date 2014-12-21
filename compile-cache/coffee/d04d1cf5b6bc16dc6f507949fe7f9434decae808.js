(function() {
  var NotificationView, Ripper, packageManager,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Ripper = require('./ripper');

  NotificationView = require('./notification_view');

  packageManager = atom.packages;

  module.exports = {
    configDefaults: {
      'disable in large files (chars)': 20000
    },
    activate: function() {
      atom.workspace.emit('coffee-refactor-became-active');
      if (__indexOf.call(packageManager.getAvailablePackageNames(), 'refactor') >= 0 && !packageManager.isPackageDisabled('refactor')) {
        return;
      }
      return new NotificationView;
    },
    deactivate: function() {},
    serialize: function() {},
    Ripper: Ripper
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdDQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVIsQ0FBVCxDQUFBOztBQUFBLEVBQ0EsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHFCQUFSLENBRG5CLENBQUE7O0FBQUEsRUFFWSxpQkFBbUIsS0FBN0IsUUFGRixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FFRTtBQUFBLElBQUEsY0FBQSxFQUNFO0FBQUEsTUFBQSxnQ0FBQSxFQUFrQyxLQUFsQztLQURGO0FBQUEsSUFHQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBQ1IsTUFBQSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsK0JBQXBCLENBQUEsQ0FBQTtBQUNBLE1BQUEsSUFBVSxlQUFjLGNBQWMsQ0FBQyx3QkFBZixDQUFBLENBQWQsRUFBQSxVQUFBLE1BQUEsSUFDQSxDQUFBLGNBQWUsQ0FBQyxpQkFBZixDQUFpQyxVQUFqQyxDQURYO0FBQUEsY0FBQSxDQUFBO09BREE7YUFHQSxHQUFBLENBQUEsaUJBSlE7SUFBQSxDQUhWO0FBQUEsSUFRQSxVQUFBLEVBQVksU0FBQSxHQUFBLENBUlo7QUFBQSxJQVNBLFNBQUEsRUFBVyxTQUFBLEdBQUEsQ0FUWDtBQUFBLElBVUEsTUFBQSxFQUFRLE1BVlI7R0FQRixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/coffee-refactor/lib/coffee_refactor.coffee