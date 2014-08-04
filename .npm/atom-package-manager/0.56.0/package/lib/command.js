(function() {
  var Command, child_process,
    __slice = [].slice;

  child_process = require('child_process');

  module.exports = Command = (function() {
    function Command() {}

    Command.prototype.spawn = function() {
      var args, callback, command, errorChunks, options, outputChunks, remaining, spawned;
      command = arguments[0], args = arguments[1], remaining = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      if (remaining.length >= 2) {
        options = remaining.shift();
      }
      callback = remaining.shift();
      spawned = child_process.spawn(command, args, options);
      errorChunks = [];
      outputChunks = [];
      spawned.stdout.on('data', function(chunk) {
        if (options != null ? options.streaming : void 0) {
          return process.stdout.write(chunk);
        } else {
          return outputChunks.push(chunk);
        }
      });
      spawned.stderr.on('data', function(chunk) {
        if (options != null ? options.streaming : void 0) {
          return process.stderr.write(chunk);
        } else {
          return errorChunks.push(chunk);
        }
      });
      spawned.on('error', function(error) {
        return callback(error, Buffer.concat(errorChunks).toString(), Buffer.concat(outputChunks).toString());
      });
      return spawned.on('close', function(code) {
        return callback(code, Buffer.concat(errorChunks).toString(), Buffer.concat(outputChunks).toString());
      });
    };

    Command.prototype.fork = function() {
      var args, remaining, script;
      script = arguments[0], args = arguments[1], remaining = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      args.unshift(script);
      return this.spawn.apply(this, [process.execPath, args].concat(__slice.call(remaining)));
    };

    Command.prototype.showHelp = function(argv) {
      var _ref;
      return typeof this.parseOptions === "function" ? (_ref = this.parseOptions(argv)) != null ? _ref.showHelp() : void 0 : void 0;
    };

    return Command;

  })();

}).call(this);
