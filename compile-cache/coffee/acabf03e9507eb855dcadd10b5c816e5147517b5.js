(function() {
  var NotificationView, Ripper, packageManager,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Ripper = require('./ripper');

  NotificationView = require('./notification-view');

  packageManager = atom.packages;

  module.exports = {
    activate: function() {
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

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHdDQUFBO0lBQUEscUpBQUE7O0FBQUEsRUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVIsQ0FBVCxDQUFBOztBQUFBLEVBQ0EsZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHFCQUFSLENBRG5CLENBQUE7O0FBQUEsRUFHWSxpQkFBbUIsS0FBN0IsUUFIRixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsUUFBQSxFQUFVLFNBQUEsR0FBQTtBQUNSLE1BQUEsSUFBVSxlQUFjLGNBQWMsQ0FBQyx3QkFBZixDQUFBLENBQWQsRUFBQSxVQUFBLE1BQUEsSUFDQSxDQUFBLGNBQWUsQ0FBQyxpQkFBZixDQUFpQyxVQUFqQyxDQURYO0FBQUEsY0FBQSxDQUFBO09BQUE7YUFFQSxHQUFBLENBQUEsaUJBSFE7SUFBQSxDQUFWO0FBQUEsSUFJQSxVQUFBLEVBQVksU0FBQSxHQUFBLENBSlo7QUFBQSxJQUtBLFNBQUEsRUFBVyxTQUFBLEdBQUEsQ0FMWDtBQUFBLElBTUEsTUFBQSxFQUFRLE1BTlI7R0FORixDQUFBO0FBQUEiCn0=
//# sourceURL=/Users/daniel/.atom/packages/coffee-refactor/lib/coffee-refactor.coffee