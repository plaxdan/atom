(function() {
  var FilesizeCalculator, fs;

  fs = require("fs");

  module.exports = FilesizeCalculator = (function() {
    FilesizeCalculator.BASE_1024 = ["bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];

    FilesizeCalculator.BASE_1000 = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    FilesizeCalculator.prototype.activeBase = null;

    function FilesizeCalculator(multiple) {
      this.multiple = multiple;
      if ((this.multiple == null) || typeof this.multiple !== "number") {
        this.multiple = 1024;
      }
      this.setActiveBase(multiple);
    }

    FilesizeCalculator.prototype.fetchReadableSize = function(callback) {
      return this.getSize((function(_this) {
        return function(size, err) {
          return _this.makeReadable(size, err, callback);
        };
      })(this));
    };

    FilesizeCalculator.prototype.setMultiple = function(multiple) {
      this.multiple = multiple;
      return this.setActiveBase(multiple);
    };

    FilesizeCalculator.prototype.setActiveBase = function(multiple) {
      if (this.multiple === 1024) {
        this.activeBase = FilesizeCalculator.BASE_1024;
      }
      if (this.multiple === 1000) {
        return this.activeBase = FilesizeCalculator.BASE_1000;
      }
    };

    FilesizeCalculator.prototype.getSize = function(callback) {
      var editor, error, file, filePath;
      editor = atom.workspace.getActivePaneItem();
      filePath = null;
      try {
        file = editor != null ? editor.buffer.file : void 0;
        filePath = file != null ? file.path : void 0;
      } catch (_error) {
        error = _error;
        callback.apply(this, [null, "Can't get size now"]);
        return;
      }
      if (filePath != null) {
        return fs.stat(filePath, function(err, stats) {
          if (err != null) {
            console.warn("File size not available, path not found.");
            return callback.apply(this, [null, "File not found"]);
          } else {
            return callback.apply(this, [stats.size, null]);
          }
        });
      } else {
        return callback.apply(this, [null, "Can't get size now"]);
      }
    };

    FilesizeCalculator.prototype.makeReadable = function(size, err, callback) {
      var metric, result, scale;
      if ((err != null) || (size == null)) {
        callback.apply(this, [null, err]);
        return null;
      }
      if (size === 0) {
        if ((callback != null) && typeof callback === "function") {
          callback.apply(this, ["0 bytes", null]);
          return;
        } else {
          return "0 bytes";
        }
      }
      if (size === 1) {
        if ((callback != null) && typeof callback === "function") {
          callback.apply(this, ["1 byte", null]);
          return;
        } else {
          return "1 byte";
        }
      }
      scale = Math.floor(Math.log(size) / Math.log(this.multiple));
      metric = this.activeBase[scale];
      size = size / Math.pow(this.multiple, scale);
      size = Number(Math.round(size + "e+2") + "e-2");
      result = "" + size + " " + metric;
      if ((callback != null) && typeof callback === "function") {
        return callback.apply(this, [result, null]);
      } else {
        return result;
      }
    };

    return FilesizeCalculator;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHNCQUFBOztBQUFBLEVBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSLENBQUwsQ0FBQTs7QUFBQSxFQUVBLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFFSixJQUFBLGtCQUFDLENBQUEsU0FBRCxHQUFhLENBQ1gsT0FEVyxFQUVYLEtBRlcsRUFHWCxLQUhXLEVBSVgsS0FKVyxFQUtYLEtBTFcsRUFNWCxLQU5XLEVBT1gsS0FQVyxFQVFYLEtBUlcsRUFTWCxLQVRXLENBQWIsQ0FBQTs7QUFBQSxJQVlBLGtCQUFDLENBQUEsU0FBRCxHQUFhLENBQ1gsT0FEVyxFQUVYLElBRlcsRUFHWCxJQUhXLEVBSVgsSUFKVyxFQUtYLElBTFcsRUFNWCxJQU5XLEVBT1gsSUFQVyxFQVFYLElBUlcsRUFTWCxJQVRXLENBWmIsQ0FBQTs7QUFBQSxpQ0F3QkEsVUFBQSxHQUFZLElBeEJaLENBQUE7O0FBMEJhLElBQUEsNEJBQUUsUUFBRixHQUFBO0FBQ1gsTUFEWSxJQUFDLENBQUEsV0FBQSxRQUNiLENBQUE7QUFBQSxNQUFBLElBQU8sdUJBQUosSUFBa0IsTUFBQSxDQUFBLElBQVEsQ0FBQSxRQUFSLEtBQXNCLFFBQTNDO0FBQXlELFFBQUEsSUFBQyxDQUFBLFFBQUQsR0FBWSxJQUFaLENBQXpEO09BQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxhQUFELENBQWUsUUFBZixDQURBLENBRFc7SUFBQSxDQTFCYjs7QUFBQSxpQ0E4QkEsaUJBQUEsR0FBbUIsU0FBQyxRQUFELEdBQUE7YUFDakIsSUFBQyxDQUFBLE9BQUQsQ0FBUyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQyxJQUFELEVBQU8sR0FBUCxHQUFBO2lCQUNQLEtBQUMsQ0FBQSxZQUFELENBQWMsSUFBZCxFQUFvQixHQUFwQixFQUF5QixR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
//# sourceURL=/Users/daniel/.atom/packages/filesize/lib/filesize-calculator.coffee