(function() {
  var Access, Assign, Code, For, HEXNUM, LEVEL_TOP, Lexer, Literal, Parens, Range, Ripper, Value, bench, config, flatten, isArray, isContains, isEqualsLocationData, isString, locationDataToRange, nodes, parse, some, uniq, updateSyntaxError, _, _ref, _ref1, _ref2;

  nodes = require('../vender/coffee-script/lib/coffee-script/coffee-script').nodes;

  Lexer = require('../vender/coffee-script/lib/coffee-script/lexer').Lexer;

  parse = require('../vender/coffee-script/lib/coffee-script/parser').parse;

  updateSyntaxError = require('../vender/coffee-script/lib/coffee-script/helpers').updateSyntaxError;

  _ref = require('../vender/coffee-script/lib/coffee-script/nodes'), Value = _ref.Value, Code = _ref.Code, Literal = _ref.Literal, For = _ref.For, Assign = _ref.Assign, Access = _ref.Access, Parens = _ref.Parens;

  flatten = require('../vender/coffee-script/lib/coffee-script/helpers').flatten;

  Range = require('atom').Range;

  _ref1 = _ = require('lodash'), isString = _ref1.isString, isArray = _ref1.isArray, uniq = _ref1.uniq, some = _ref1.some;

  _ref2 = require('./location_data_util'), locationDataToRange = _ref2.locationDataToRange, isEqualsLocationData = _ref2.isEqualsLocationData, isContains = _ref2.isContains;

  config = atom.config;

  LEVEL_TOP = 1;

  HEXNUM = /^[+-]?0x[\da-f]+/i;

  Value.prototype.isHexNumber = function() {
    return this.bareLiteral(Literal) && HEXNUM.test(this.base.value);
  };

  bench = (function() {
    var prev;
    prev = 0;
    return function() {
      var current, past;
      current = new Date().getTime();
      past = current - prev;
      prev = current;
      return "" + past + "ms";
    };
  })();

  module.exports = Ripper = (function() {
    Ripper.find = function(tokens, nodes, point) {
      var target;
      if (!this.isIdentifier(tokens, point)) {
        return [];
      }
      target = this.findSymbol(nodes, point);
      if (target == null) {
        return [];
      }
      return this.findReference(nodes, target).data;
    };

    Ripper.isIdentifier = function(tokens, point) {
      var token, _i, _len;
      for (_i = 0, _len = tokens.length; _i < _len; _i++) {
        token = tokens[_i];
        if (token[0] === 'IDENTIFIER' && isContains(token[2], point)) {
          return true;
        }
      }
      return false;
    };

    Ripper.findSymbol = function(nodes, point) {
      var target;
      target = null;
      _.each(nodes._children, (function(_this) {
        return function(child) {
          if (target != null) {
            return false;
          }
          if (child.locationData == null) {
            return true;
          }
          if (_this.isPrimitive(child)) {
            return true;
          }
          if (_this.isKeyOfObjectAccess(nodes, child)) {
            return true;
          }
          if (_this.isKeyOfObjectLiteral(nodes, child)) {
            return true;
          }
          if (child instanceof Literal) {
            if (isContains(child.locationData, point)) {
              target = child;
              return false;
            }
          }
          target = _this.findSymbol(child, point);
          if (target != null) {
            return false;
          }
        };
      })(this));
      return target;
    };

    Ripper.findReference = function(parent, target, isDeclaredInParent) {
      var data, isFixed;
      if (isDeclaredInParent == null) {
        isDeclaredInParent = this.isDeclared(target, parent);
      }
      isFixed = false;
      data = [];
      _.each(parent._children, (function(_this) {
        return function(child) {
          var childRef, isDeclared;
          if (isFixed) {
            return false;
          }
          if (child instanceof Code) {
            isDeclared = _this.isDeclared(target, child, parent);
            childRef = _this.findReference(child, target, isDeclaredInParent || isDeclared);
            if (_this.hasTarget(childRef.data, target)) {
              if (childRef.isFixed || isDeclared) {
                data = childRef.data;
                isFixed = true;
                return false;
              }
              data = data.concat(childRef.data);
              return true;
            }
            if (isDeclared) {
              return true;
            }
            if (isDeclaredInParent) {
              data = data.concat(childRef.data);
              return true;
            }
            return true;
          }
          child.scope = parent.scope;
          if (_this.isKeyOfObjectAccess(parent, child)) {
            return true;
          }
          if (_this.isKeyOfObjectLiteral(parent, child)) {
            return true;
          }
          if (_this.isSameLiteral(child, target)) {
            data.push(child);
            return true;
          }
          if (child instanceof For) {
            if (_this.isSameLiteral(child.name, target)) {
              data.push(child.name);
            } else if (_this.isSameLiteral(child.index, target)) {
              data.push(child.index);
            }
          }
          childRef = _this.findReference(child, target, isDeclaredInParent);
          if (childRef.isFixed) {
            data = childRef.data;
            isFixed = true;
            return false;
          }
          data = data.concat(childRef.data);
          return true;
        };
      })(this));
      data = uniq(data);
      return {
        isFixed: isFixed,
        data: data
      };
    };

    Ripper.isDeclared = function(target, child, parent) {
      var err, o, symbols;
      try {
        if (child.scope == null) {
          o = {
            indent: ''
          };
          if (parent == null) {
            child.compileRoot(o);
          } else {
            o.scope = parent.scope;
            child.compileNode(o);
          }
          child.scope = o.scope;
        }
        symbols = this.declaredSymbols(child.scope);
        return symbols.indexOf(target.value) !== -1;
      } catch (_error) {
        err = _error;
      }
      return false;
    };

    Ripper.hasTarget = function(refs, target) {
      return some(refs, (function(_this) {
        return function(ref) {
          return isEqualsLocationData(ref.locationData, target.locationData) && _this.isSameLiteral(ref, target);
        };
      })(this));
    };

    Ripper.declaredSymbols = function(scope) {
      var name, type, _i, _len, _ref3, _ref4, _results;
      _ref3 = scope.variables;
      _results = [];
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        _ref4 = _ref3[_i], type = _ref4.type, name = _ref4.name;
        if (this.isScopedSymbol(type, name)) {
          _results.push(name);
        }
      }
      return _results;
    };

    Ripper.isScopedSymbol = function(type, name) {
      return (type === 'var' || type === 'param') && isString(name) && name.charAt(0) !== '_';
    };

    Ripper.isPrimitive = function(node) {
      return (typeof node.isString === "function" ? node.isString() : void 0) || (typeof node.isSimpleNumber === "function" ? node.isSimpleNumber() : void 0) || (typeof node.isHexNumber === "function" ? node.isHexNumber() : void 0) || (typeof node.isRegex === "function" ? node.isRegex() : void 0);
    };

    Ripper.isKeyOfObjectAccess = function(parent, child) {
      return parent.soak === false && child.asKey && child.unfoldedSoak !== false;
    };

    Ripper.isKeyOfObjectLiteral = function(parent, child) {
      return parent.context === 'object' && child === parent.variable && parent instanceof Assign && child instanceof Value;
    };

    Ripper.isSameLiteral = function(a, b) {
      return (a != null) && (b != null) && (a.locationData != null) && (b.locationData != null) && a instanceof Literal && b instanceof Literal && a.value === b.value;
    };

    Ripper.generateNodes = function(parent) {
      var attr, child, children, _i, _j, _len, _len1, _ref3;
      if (parent.children == null) {
        return;
      }
      children = [];
      if (parent.index != null) {
        children.push(parent.index);
      }
      if (parent.name != null) {
        children.push(parent.name);
      }
      _ref3 = parent.children;
      for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
        attr = _ref3[_i];
        if (parent[attr]) {
          children.push(parent[attr]);
        }
      }
      children = flatten(children);
      for (_j = 0, _len1 = children.length; _j < _len1; _j++) {
        child = children[_j];
        this.generateNodes(child);
      }
      parent._children = children;
      return parent;
    };

    Ripper.scopeNames = ['source.coffee', 'source.litcoffee'];

    function Ripper() {
      this.lexer = new Lexer;
    }

    Ripper.prototype.destruct = function() {
      delete this.lexer;
      delete this.tokens;
      return delete this.nodes;
    };

    Ripper.prototype.serialize = function() {};

    Ripper.prototype.parse = function(code, callback) {
      var err, location, message;
      if ((config.getSettings()['coffee-refactor'] != null) && code.length > config.getSettings()['coffee-refactor']['disable in large files (chars)']) {
        console.warn('coffee-refactor is disabled in large files. You can change the size threshold in the preference pane.');
        return;
      }
      try {
        this.tokens = this.lexer.tokenize(code, {});
        this.nodes = Ripper.generateNodes(parse(this.tokens));
        return typeof callback === "function" ? callback() : void 0;
      } catch (_error) {
        err = _error;
        updateSyntaxError(err, code);
        location = err.location, message = err.message;
        if ((location != null) && (message != null)) {
          return typeof callback === "function" ? callback([
            {
              range: locationDataToRange(location),
              message: message
            }
          ]) : void 0;
        } else {
          console.warn(err);
          return typeof callback === "function" ? callback() : void 0;
        }
      }
    };

    Ripper.prototype.find = function(point) {
      var foundNodes, i, locationData, results;
      if (this.nodes == null) {
        return [];
      }
      foundNodes = Ripper.find(this.tokens, this.nodes, point);
      results = (function() {
        var _i, _len, _results;
        _results = [];
        for (i = _i = 0, _len = foundNodes.length; _i < _len; i = ++_i) {
          locationData = foundNodes[i].locationData;
          _results.push(locationDataToRange(locationData));
        }
        return _results;
      })();
      return results;
    };

    return Ripper;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLGdRQUFBOztBQUFBLEVBQUUsUUFBVSxPQUFBLENBQVEseURBQVIsRUFBVixLQUFGLENBQUE7O0FBQUEsRUFDRSxRQUFVLE9BQUEsQ0FBUSxpREFBUixFQUFWLEtBREYsQ0FBQTs7QUFBQSxFQUVFLFFBQVUsT0FBQSxDQUFRLGtEQUFSLEVBQVYsS0FGRixDQUFBOztBQUFBLEVBR0Usb0JBQXNCLE9BQUEsQ0FBUSxtREFBUixFQUF0QixpQkFIRixDQUFBOztBQUFBLEVBSUEsT0FBd0QsT0FBQSxDQUFRLGlEQUFSLENBQXhELEVBQUUsYUFBQSxLQUFGLEVBQVMsWUFBQSxJQUFULEVBQWUsZUFBQSxPQUFmLEVBQXdCLFdBQUEsR0FBeEIsRUFBNkIsY0FBQSxNQUE3QixFQUFxQyxjQUFBLE1BQXJDLEVBQTZDLGNBQUEsTUFKN0MsQ0FBQTs7QUFBQSxFQUtFLFVBQVksT0FBQSxDQUFRLG1EQUFSLEVBQVosT0FMRixDQUFBOztBQUFBLEVBTUUsUUFBVSxPQUFBLENBQVEsTUFBUixFQUFWLEtBTkYsQ0FBQTs7QUFBQSxFQU9BLFFBQW9DLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUixDQUF4QyxFQUFFLGlCQUFBLFFBQUYsRUFBWSxnQkFBQSxPQUFaLEVBQXFCLGFBQUEsSUFBckIsRUFBMkIsYUFBQSxJQVAzQixDQUFBOztBQUFBLEVBUUEsUUFBNEQsT0FBQSxDQUFRLHNCQUFSLENBQTVELEVBQUUsNEJBQUEsbUJBQUYsRUFBdUIsNkJBQUEsb0JBQXZCLEVBQTZDLG1CQUFBLFVBUjdDLENBQUE7O0FBQUEsRUFTRSxTQUFXLEtBQVgsTUFURixDQUFBOztBQUFBLEVBV0EsU0FBQSxHQUFZLENBWFosQ0FBQTs7QUFBQSxFQVlBLE1BQUEsR0FBUyxtQkFaVCxDQUFBOztBQUFBLEVBYUEsS0FBSyxD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
//# sourceURL=/Users/daniel/.atom/packages/coffee-refactor/lib/ripper.coffee