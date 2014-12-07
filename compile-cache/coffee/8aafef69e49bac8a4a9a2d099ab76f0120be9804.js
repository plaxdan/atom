(function() {
  var FilesizeCalculator, FilesizeView;

  FilesizeView = require("./filesize-view");

  FilesizeCalculator = require("./filesize-calculator");

  module.exports = {
    configDefaults: {
      KibibyteRepresentation: true
    },
    filesizeView: null,
    filesizeCalculator: null,
    activate: function() {
      this.filesizeView = new FilesizeView();
      this.filesizeCalculator = new FilesizeCalculator(this.filesizeView);
      atom.workspaceView.on("filesize:activate", (function(_this) {
        return function() {
          return _this.exec();
        };
      })(this));
      atom.workspaceView.on("editor:path-changed", (function(_this) {
        return function() {
          return _this.exec();
        };
      })(this));
      atom.workspaceView.on("pane-container:active-pane-item-changed", (function(_this) {
        return function() {
          return _this.exec();
        };
      })(this));
      atom.workspaceView.on("core:save", (function(_this) {
        return function() {
          return _this.exec();
        };
      })(this));
      atom.config.observe("filesize.KibibyteRepresentation", (function(_this) {
        return function() {
          var multiple;
          multiple = 1024;
          if (atom.config.get("filesize.KibibyteRepresentation")) {
            multiple = 1024;
          } else {
            multiple = 1000;
          }
          return _this.filesizeCalculator.setMultiple(multiple);
        };
      })(this));
      return atom.workspaceView.trigger("filesize:activate");
    },
    deactivate: function() {
      if (this.filesizeView != null) {
        this.filesizeView.destroy();
        this.filesizeView = null;
      }
      if (this.filesizeCalculator != null) {
        this.filesizeCalculator = null;
      }
      atom.workspaceView.off("filesize:activate", (function(_this) {
        return function() {
          return _this.exec();
        };
      })(this));
      atom.workspaceView.off("editor:path-changed", (function(_this) {
        return function() {
          return _this.exec();
        };
      })(this));
      atom.workspaceView.off("pane-container:active-pane-item-changed", (function(_this) {
        return function() {
          return _this.exec();
        };
      })(this));
      return atom.workspaceView.off("core:save", (function(_this) {
        return function() {
          return _this.exec();
        };
      })(this));
    },
    exec: function(callback) {
      var _ref;
      return (_ref = this.filesizeCalculator) != null ? _ref.fetchReadableSize((function(_this) {
        return function(info, err) {
          if (err == null) {
            _this.filesizeView.display(info);
            if ((callback != null) && typeof callback === "function") {
              return callback.apply(_this, [null]);
            }
          } else {
            _this.filesizeView.hide();
            if ((callback != null) && typeof callback === "function") {
              return callback.apply(_this, [err]);
            }
          }
        };
      })(this)) : void 0;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdDQUFBOztBQUFBLEVBQUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUixDQUFmLENBQUE7O0FBQUEsRUFDQSxrQkFBQSxHQUFxQixPQUFBLENBQVEsdUJBQVIsQ0FEckIsQ0FBQTs7QUFBQSxFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBRUU7QUFBQSxJQUFBLGNBQUEsRUFDRTtBQUFBLE1BQUEsc0JBQUEsRUFBd0IsSUFBeEI7S0FERjtBQUFBLElBR0EsWUFBQSxFQUFjLElBSGQ7QUFBQSxJQUlBLGtCQUFBLEVBQW9CLElBSnBCO0FBQUEsSUFNQSxRQUFBLEVBQVUsU0FBQSxHQUFBO0FBRVIsTUFBQSxJQUFDLENBQUEsWUFBRCxHQUFvQixJQUFBLFlBQUEsQ0FBQSxDQUFwQixDQUFBO0FBQUEsTUFHQSxJQUFDLENBQUEsa0JBQUQsR0FBMEIsSUFBQSxrQkFBQSxDQUFtQixJQUFDLENBQUEsWUFBcEIsQ0FIMUIsQ0FBQTtBQUFBLE1BTUEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFuQixDQUFzQixtQkFBdEIsRUFBMkMsQ0FBQSxTQUFBLEtBQUEsR0FBQTtlQUFBLFNBQUEsR0FBQTtpQkFBRyxLQUFDLENBQUEsSUFBRCxDQUFBLEVBQUg7UUFBQSxFQUFBO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQyxDQU5BLENBQUE7QUFBQSxNQU9BLElBQUksQ0FBQyxhQUFhLENBQUMsRUFBbkIsQ0FBc0IscUJBQXRCLEVBQTZDLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFBLEdBQUE7aUJBQUcsS0FBQyxDQUFBLElBQUQsQ0FBQSxFQUFIO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0MsQ0FQQSxDQUFBO0FBQUEsTUFRQSxJQUFJLENBQUMsYUFBYSxDQUFD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
//# sourceURL=/Users/daniel/.atom/packages/filesize/lib/filesize.coffee