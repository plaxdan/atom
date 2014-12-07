(function() {
  var GlistView, mkdirp, path, _ref;

  path = require('path');

  GlistView = require('./glist-view');

  mkdirp = require('mkdirp');

  module.exports = {
    activate: function() {
      return atom.workspaceView.command("glist:toggle", (function(_this) {
        return function() {
          return _this.toggle();
        };
      })(this));
    },
    deactivate: function() {
      console.log("destroy");
      return this.glistView.destroy();
    },
    toggle: function() {
      var gistPath;
      console.log("toggle");
      if (this.previousPath != null) {
        console.log("off");
        atom.project.setPath(this.previousPath);
        this.previousPath = null;
        return this.deactivate();
      } else {
        console.log("on");
        this.previousPath = atom.project.getPath();
        this.glistView = new GlistView();
        gistPath = atom.config.get('glist.gistLocation');
        mkdirp.sync(gistPath);
        return atom.project.setPath(gistPath);
      }
    },
    configDefaults: {
      userName: localStorage.getItem("glist.username") || ((_ref = atom.project.getRepo()) != null ? _ref.getConfigValue("github.user") : void 0),
      gistLocation: path.join(__dirname, "../gists"),
      ispublic: true
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDZCQUFBOztBQUFBLEVBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQVAsQ0FBQTs7QUFBQSxFQUNBLFNBQUEsR0FBWSxPQUFBLENBQVEsY0FBUixDQURaLENBQUE7O0FBQUEsRUFFQSxNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVIsQ0FGVCxDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtBQUFBLElBQUEsUUFBQSxFQUFVLFNBQUEsR0FBQTthQUNSLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBbkIsQ0FBMkIsY0FBM0IsRUFBMkMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsTUFBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQyxFQURRO0lBQUEsQ0FBVjtBQUFBLElBR0EsVUFBQSxFQUFZLFNBQUEsR0FBQTtBQUNWLE1BQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxTQUFaLENBQUEsQ0FBQTthQUNBLElBQUMsQ0FBQSxTQUFTLENBQUMsT0FBWCxDQUFBLEVBRlU7SUFBQSxDQUhaO0FBQUEsSUFPQSxNQUFBLEVBQVEsU0FBQSxHQUFBO0FBQ04sVUFBQSxRQUFBO0FBQUEsTUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLFFBQVosQ0FBQSxDQUFBO0FBQ0EsTUFBQSxJQUFHLHlCQUFIO0FBQ0UsUUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLEtBQVosQ0FBQSxDQUFBO0FBQUEsUUFDQSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQWIsQ0FBcUIsSUFBQyxDQUFBLFlBQXRCLENBREEsQ0FBQTtBQUFBLFFBRUEsSUFBQyxDQUFBLFlBQUQsR0FBYyxJQUZkLENBQUE7ZUFHQSxJQUFDLENBQUEsVUFBRCxDQUFBLEVBSkY7T0FBQSxNQUFBO0FBTUUsUUFBQSxPQUFPLENBQUMsR0FBUixDQUFZLElBQVosQ0FBQSxDQUFBO0FBQUEsUUFDQSxJQUFDLENBQUEsWUFBRCxHQUFnQixJQUFJLENBQUMsT0FBTyxDQUFDLE9BQWIsQ0FBQSxDQURoQixDQUFBO0FBQUEsUUFFQSxJQUFDLENBQUEsU0FBRCxHQUFpQixJQUFBLFNBQUEsQ0FBQSxDQUZqQixDQUFBO0FBQUEsUUFHQSxRQUFBLEdBQVcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9CQUFoQixDQUhYLENBQUE7QUFBQSxRQUlBLE1BQU0sQ0FBQyxJQUFQLENBQVksUUFBWixDQUpBLENBQUE7ZUFLQSxJQUFJLENBQUMsT0FBTyxDQUFDLE9BQWIsQ0FBcUIsUUFBckIsRUFYRjtPQUZNO0lBQUEsQ0FQUjtBQUFBLElBc0JBLGNBQUEsRUFDRTtBQUFBLE1BQUEsUUFBQSxFQUFVLFlBQVksQ0FBQyxPQUFiLENBQXFCLGdCQUFyQixDQUFBLG1EQUFnRSxDQUFFLGNBQXhCLENBQXVDLGFBQXZDLFdBQXBEO0FBQUEsTUFDQSxZQUFBLEVBQWMsSUFBSSxDQUFDLElBQUwsQ0FBVSxTQUFWLEVBQXFCLFVBQXJCLENBRGQ7QUFBQSxNQUVBLFFBQUEsRUFBVSxJQUZWO0tBdkJGO0dBTEYsQ0FBQTtBQUFBIgp9
//# sourceURL=/Users/daniel/.atom/packages/glist/lib/glist.coffee