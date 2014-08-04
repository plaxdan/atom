(function() {
  var Access, Assign, Code, For, HEXNUM, LEVEL_TOP, Literal, Parens, Range, Ripper, Value, flatten, isArray, isEqualsLocationData, isString, locationDataToRange, nodes, rangeToLocationData, some, uniq, _, _ref, _ref1, _ref2;

  nodes = require('../vender/coffee-script/lib/coffee-script/coffee-script').nodes;

  _ref = require('../vender/coffee-script/lib/coffee-script/nodes'), Value = _ref.Value, Code = _ref.Code, Literal = _ref.Literal, For = _ref.For, Assign = _ref.Assign, Access = _ref.Access, Parens = _ref.Parens;

  flatten = require('../vender/coffee-script/lib/coffee-script/helpers').flatten;

  Range = require('atom').Range;

  _ref1 = _ = require('lodash'), isString = _ref1.isString, isArray = _ref1.isArray, uniq = _ref1.uniq, some = _ref1.some;

  _ref2 = require('./LocationDataUtil'), locationDataToRange = _ref2.locationDataToRange, rangeToLocationData = _ref2.rangeToLocationData, isEqualsLocationData = _ref2.isEqualsLocationData;

  LEVEL_TOP = 1;

  HEXNUM = /^[+-]?0x[\da-f]+/i;

  Value.prototype.isHexNumber = function() {
    return this.bareLiteral(Literal) && HEXNUM.test(this.base.value);
  };

  module.exports = Ripper = (function() {
    Ripper.find = function(root, targetLocationData) {
      var target;
      target = this.findSymbol(root, targetLocationData);
      if (target == null) {
        return [];
      }
      return this.findReference(root, target).data;
    };

    Ripper.findSymbol = function(parent, targetLocationData) {
      var target;
      target = null;
      _.each(parent._children, (function(_this) {
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
          if (_this.isKeyOfObjectAccess(parent, child)) {
            return true;
          }
          if (_this.isKeyOfObjectLiteral(parent, child)) {
            return true;
          }
          if (child instanceof Literal) {
            if (isEqualsLocationData(child.locationData, targetLocationData)) {
              target = child;
              return false;
            }
          }
          target = _this.findSymbol(child, targetLocationData);
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

    function Ripper(editor) {
      this.editor = editor;
    }

    Ripper.prototype.destruct = function() {
      return delete this.nodes;
    };

    Ripper.prototype.serialize = function() {};

    Ripper.prototype.parse = function(code, callback) {
      var err, rawNodes;
      try {
        rawNodes = nodes(code);
      } catch (_error) {
        err = _error;
        if (typeof callback === "function") {
          callback(err);
        }
        return;
      }
      this.nodes = Ripper.generateNodes(rawNodes);
      return typeof callback === "function" ? callback() : void 0;
    };

    Ripper.prototype.find = function(range) {
      var foundNodes, i, locationData, targetLocationData, _i, _len, _results;
      if (this.nodes == null) {
        return [];
      }
      targetLocationData = rangeToLocationData(range);
      foundNodes = Ripper.find(this.nodes, targetLocationData);
      _results = [];
      for (i = _i = 0, _len = foundNodes.length; _i < _len; i = ++_i) {
        locationData = foundNodes[i].locationData;
        _results.push(locationDataToRange(locationData));
      }
      return _results;
    };

    return Ripper;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLHlOQUFBOztBQUFBLEVBQUUsUUFBVSxPQUFBLENBQVEseURBQVIsRUFBVixLQUFGLENBQUE7O0FBQUEsRUFDQSxPQUF3RCxPQUFBLENBQVEsaURBQVIsQ0FBeEQsRUFBRSxhQUFBLEtBQUYsRUFBUyxZQUFBLElBQVQsRUFBZSxlQUFBLE9BQWYsRUFBd0IsV0FBQSxHQUF4QixFQUE2QixjQUFBLE1BQTdCLEVBQXFDLGNBQUEsTUFBckMsRUFBNkMsY0FBQSxNQUQ3QyxDQUFBOztBQUFBLEVBRUUsVUFBWSxPQUFBLENBQVEsbURBQVIsRUFBWixPQUZGLENBQUE7O0FBQUEsRUFHRSxRQUFVLE9BQUEsQ0FBUSxNQUFSLEVBQVYsS0FIRixDQUFBOztBQUFBLEVBSUEsUUFBb0MsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSLENBQXhDLEVBQUUsaUJBQUEsUUFBRixFQUFZLGdCQUFBLE9BQVosRUFBcUIsYUFBQSxJQUFyQixFQUEyQixhQUFBLElBSjNCLENBQUE7O0FBQUEsRUFLQSxRQUFxRSxPQUFBLENBQVEsb0JBQVIsQ0FBckUsRUFBRSw0QkFBQSxtQkFBRixFQUF1Qiw0QkFBQSxtQkFBdkIsRUFBNEMsNkJBQUEsb0JBTDVDLENBQUE7O0FBQUEsRUFRQSxTQUFBLEdBQVksQ0FSWixDQUFBOztBQUFBLEVBU0EsTUFBQSxHQUFTLG1CQVRULENBQUE7O0FBQUEsRUFVQSxLQUFLLENBQUEsU0FBRSxDQUFBLFdBQVAsR0FBcUIsU0FBQSxHQUFBO1dBQUcsSUFBQyxDQUFBLFdBQUQsQ0FBYSxPQUFiLENBQUEsSUFBMEIsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQWxCLEVBQTdCO0VBQUEsQ0FWckIsQ0FBQTs7QUFBQSxFQVlBLE1BQU0sQ0FBQyxPQUFQLEdBQ007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
//# sourceURL=/Users/daniel/.atom/packages/coffee-refactor/lib/ripper.coffee