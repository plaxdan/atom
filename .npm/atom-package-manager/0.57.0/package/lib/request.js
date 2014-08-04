(function() {
  var config, loadOptionsFromNpm, npm, request;

  npm = require('npm');

  request = require('request');

  config = require('./config');

  loadOptionsFromNpm = function(requestOptions, callback) {
    var npmOptions;
    npmOptions = {
      userconfig: config.getUserConfigPath(),
      globalconfig: config.getGlobalConfigPath()
    };
    return npm.load(npmOptions, function() {
      if (requestOptions.proxy == null) {
        requestOptions.proxy = npm.config.get('https-proxy') || npm.config.get('proxy');
      }
      if (requestOptions.strictSSL == null) {
        requestOptions.strictSSL = npm.config.get('strict-ssl');
      }
      return request.get(requestOptions, callback);
    });
  };

  module.exports = {
    get: function(requestOptions, callback) {
      return loadOptionsFromNpm(requestOptions, function() {
        return request.get(requestOptions, callback);
      });
    },
    del: function(requestOptions, callback) {
      return loadOptionsFromNpm(requestOptions, function() {
        return request.del(requestOptions, callback);
      });
    },
    post: function(requestOptions, callback) {
      return loadOptionsFromNpm(requestOptions, function() {
        return request.post(requestOptions, callback);
      });
    },
    createReadStream: function(requestOptions, callback) {
      return loadOptionsFromNpm(requestOptions, function() {
        return callback(request.get(requestOptions));
      });
    }
  };

}).call(this);
