(function() {
  var Clean, Install, Update, optimist;

  optimist = require('optimist');

  Clean = require('./clean');

  Install = require('./install');

  module.exports = Update = (function() {
    function Update() {}

    Update.commandNames = ['update'];

    Update.prototype.parseOptions = function(argv) {
      var options;
      options = optimist(argv);
      options.usage("\nUsage: apm update\n\nRun `apm clean` followed by `apm install`.\n\nSee `apm help clean` and `apm help install` for more information.");
      return options.alias('h', 'help').describe('help', 'Print this usage message');
    };

    Update.prototype.showHelp = function(argv) {
      return this.parseOptions(argv).showHelp();
    };

    Update.prototype.run = function(options) {
      var finalCallback;
      finalCallback = options.callback;
      options.callback = function(error) {
        if (error != null) {
          return finalCallback(error);
        } else {
          return new Install().installDependencies(options, finalCallback);
        }
      };
      return new Clean().run(options);
    };

    return Update;

  })();

}).call(this);
