(function() {
  var EventEmitter2, ModuleManager, config, isFunction, packageManager, satisfies,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  satisfies = require('semver').satisfies;

  EventEmitter2 = require('eventemitter2').EventEmitter2;

  config = atom.config, packageManager = atom.packages;

  isFunction = function(func) {
    return (typeof func) === 'function';
  };

  module.exports = ModuleManager = (function(_super) {
    __extends(ModuleManager, _super);

    ModuleManager.prototype.modules = {};

    ModuleManager.prototype.version = '0.0.0';

    function ModuleManager() {
      this.update = __bind(this.update, this);
      ModuleManager.__super__.constructor.apply(this, arguments);
      this.setMaxListeners(0);
      this.update();
    }

    ModuleManager.prototype.destruct = function() {
      return delete this.modules;
    };

    ModuleManager.prototype.update = function() {
      var engines, metaData, name, requiredVersion, _i, _len, _ref, _results;
      this.modules = {};
      _ref = packageManager.getAvailablePackageMetadata();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        metaData = _ref[_i];
        name = metaData.name, engines = metaData.engines;
        if (!(!packageManager.isPackageDisabled(name) && ((requiredVersion = engines != null ? engines.refactor : void 0) != null) && satisfies(this.version, requiredVersion))) {
          continue;
        }
        _results.push(this.activate(name));
      }
      return _results;
    };

    ModuleManager.prototype.activate = function(name) {
      return packageManager.activatePackage(name).then((function(_this) {
        return function(pkg) {
          var Ripper, module, scopeName, _i, _len, _ref;
          Ripper = (module = pkg.mainModule).Ripper;
          if (!((Ripper != null) && Array.isArray(Ripper.scopeNames) && isFunction(Ripper.prototype.parse) && isFunction(Ripper.prototype.find))) {
            console.error("'" + name + "' should implement Ripper.scopeNames, Ripper.parse() and Ripper.find()");
            return;
          }
          _ref = Ripper.scopeNames;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            scopeName = _ref[_i];
            _this.modules[scopeName] = module;
          }
          return _this.emit('changed');
        };
      })(this));
    };

    ModuleManager.prototype.getModule = function(sourceName) {
      return this.modules[sourceName];
    };

    return ModuleManager;

  })(EventEmitter2);

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDJFQUFBO0lBQUE7O21TQUFBOztBQUFBLEVBQUUsWUFBYyxPQUFBLENBQVEsUUFBUixFQUFkLFNBQUYsQ0FBQTs7QUFBQSxFQUNFLGdCQUFrQixPQUFBLENBQVEsZUFBUixFQUFsQixhQURGLENBQUE7O0FBQUEsRUFFRSxjQUFBLE1BQUYsRUFBb0Isc0JBQVYsUUFGVixDQUFBOztBQUFBLEVBSUEsVUFBQSxHQUFhLFNBQUMsSUFBRCxHQUFBO1dBQVUsQ0FBQyxNQUFBLENBQUEsSUFBRCxDQUFBLEtBQWlCLFdBQTNCO0VBQUEsQ0FKYixDQUFBOztBQUFBLEVBTUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUVKLG9DQUFBLENBQUE7O0FBQUEsNEJBQUEsT0FBQSxHQUFTLEVBQVQsQ0FBQTs7QUFBQSw0QkFDQSxPQUFBLEdBQVMsT0FEVCxDQUFBOztBQUdhLElBQUEsdUJBQUEsR0FBQTtBQUNYLDZDQUFBLENBQUE7QUFBQSxNQUFBLGdEQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQUEsTUFDQSxJQUFDLENBQUEsZUFBRCxDQUFpQixDQUFqQixDQURBLENBQUE7QUFBQSxNQU9BLElBQUMsQ0FBQSxNQUFELENBQUEsQ0FQQSxDQURXO0lBQUEsQ0FIYjs7QUFBQSw0QkFhQSxRQUFBLEdBQVUsU0FBQSxHQUFBO2FBR1IsTUFBQSxDQUFBLElBQVEsQ0FBQSxRQUhBO0lBQUEsQ0FiVixDQUFBOztBQUFBLDRCQWtCQSxNQUFBLEdBQVEsU0FBQSxHQUFBO0FBQ04sVUFBQSxrRUFBQTtBQUFBLE1BQUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxFQUFYLENBQUE7QUFFQTtBQUFBO1dBQUEsMkNBQUE7NEJBQUE7QUFFRSxRQUFFLGdCQUFBLElBQUYsRUFBUSxtQkFBQSxPQUFSLENBQUE7QUFDQSxRQUFBLElBQUEsQ0FBQSxDQUFnQixDQUFBLGNBQWUsQ0FBQyxpQkFBZixDQUFpQyxJQUFqQyxDQUFELElBQ0EseUVBREEsSUFFQSxTQUFBLENBQVUsSUFBQyxDQUFBLE9BQVgsRUFBb0IsZUFBcEIsQ0FGaEIsQ0FBQTtBQUFBLG1CQUFBO1NBREE7QUFBQSxzQkFJQSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQVYsRUFKQSxDQUZGO0FBQUE7c0JBSE07SUFBQSxDQWxCUixDQUFBOztBQUFBLDRCQTZCQSxRQUFBLEdBQVUsU0FBQyxJQUFELEdBQUE7YUFDUixjQUNBLENBQUMsZUFERCxDQUNpQixJQURqQixDQUVBLENBQUMsSUFGRCxDQUVNLENBQUEsU0FBQSxLQUFBLEdBQUE7ZUFBQSxTQUFDLEdBQUQsR0FBQTtBQUdKLGNBQUEseUNBQUE7QUFBQSxVQUFFLFNBQVcsQ0FBQSxNQUFBLEdBQVMsR0FBRyxDQUFDLFVBQWIsRUFBWCxNQUFGLENBQUE7QUFFQSxVQUFBLElBQUEsQ0FBQSxDQUFPLGdCQUFBLElBQ0EsS0FBSyxDQUFDLE9BQU4sQ0FBYyxNQUFNLENBQUMsVUFBckIsQ0FEQSxJQUVBLFVBQUEsQ0FBVyxNQUFNLENBQUEsU0FBRSxDQUFBLEtBQW5CLENBRkEsSUFHQSxVQUFBLENBQVcsTUFBTSxDQUFBLFNBQUUsQ0FBQSxJQUFuQixDQUhQLENBQUE7QUFJRSxZQUFBLE9BQU8sQ0FBQyxLQUFSLENBQWUsR0FBQSxHQUFFLElBQUYsR0FBUSx3RUFBdkIsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FMRjtXQUZBO0FBU0E7QUFBQSxlQUFBLDJDQUFBO2lDQUFBO0FBQ0UsWUFBQSxLQUFDLENBQUEsT0FBUSxDQUFBLFNBQUEsQ0FBVCxHQUFzQixNQUF0QixDQURGO0FBQUEsV0FUQTtpQkFZQSxLQUFDLENBQUEsSUFBRCxDQUFNLFNBQU4sRUFmSTtRQUFBLEVBQUE7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBRk4sRUFEUTtJQUFBLENBN0JWLENBQUE7O0FBQUEsNEJBaURBLFNBQUEsR0FBVyxTQUFDLFVBQUQsR0FBQTthQUNULElBQUMsQ0FBQSxPQUFRLENBQUEsVUFBQSxFQURBO0lBQUEsQ0FqRFgsQ0FBQTs7eUJBQUE7O0tBRjBCLGNBUDVCLENBQUE7QUFBQSIKfQ==
//# sourceURL=/Users/daniel/.atom/packages/refactor/lib/ModuleManager.coffee