(function() {
  var BrowserWindow, OmniSharpServer, OmnisharpLocation, fs, spawn,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  fs = require('fs');

  spawn = require('child_process').spawn;

  BrowserWindow = require('remote').require('browser-window');

  OmnisharpLocation = require('omnisharp-server-binaries');

  module.exports = OmniSharpServer = (function() {
    var OmniSharpServerInstance, instance;

    function OmniSharpServer() {}

    instance = null;

    OmniSharpServer.vm = {
      isNotLoading: true,
      isLoading: false,
      isOff: true,
      isNotOff: false,
      isOn: false,
      isNotReady: true,
      isReady: false,
      isNotError: true,
      isError: false,
      isLoadingOrReady: false,
      state: "off",
      previousState: "off"
    };

    atom.on("omni-sharp-server:state-change", function(state) {
      OmniSharpServer.vm.previousState = OmniSharpServer.vm.state;
      OmniSharpServer.vm.state = state;
      OmniSharpServer.vm.isOn = state === "on";
      OmniSharpServer.vm.isOff = state === "off";
      OmniSharpServer.vm.isNotOff = state !== "off";
      OmniSharpServer.vm.isError = state === "error" || (state === "off" && OmniSharpServer.vm.previousState === "error");
      OmniSharpServer.vm.isNotError = !OmniSharpServer.vm.isError;
      OmniSharpServer.vm.isOffOrError = OmniSharpServer.vm.isError || OmniSharpServer.vm.isOff;
      OmniSharpServer.vm.isOffAndNotError = !OmniSharpServer.vm.isError && OmniSharpServer.vm.isOff;
      OmniSharpServer.vm.isLoading = state === "loading";
      OmniSharpServer.vm.isNotLoading = state !== "loading";
      OmniSharpServer.vm.isReady = state === "ready";
      OmniSharpServer.vm.isNotReady = !OmniSharpServer.vm.isReady;
      OmniSharpServer.vm.isLoadingOrReady = state === "ready" || state === "loading";
      OmniSharpServer.vm.isLoadingOrReadyOrError = OmniSharpServer.vm.isLoadingOrReady || OmniSharpServer.vm.isError;
      OmniSharpServer.vm.iconText = OmniSharpServer.vm.isError ? "omni error occured" : "";
      return atom.emit("omni-sharp-server:state-change-complete", state);
    });

    OmniSharpServerInstance = (function() {
      var location, packageDir;

      function OmniSharpServerInstance() {
        this.close = __bind(this.close, this);
        this.err = __bind(this.err, this);
        this.out = __bind(this.out, this);
      }

      packageDir = atom.packages.packageDirPaths[0];

      location = OmnisharpLocation;

      OmniSharpServerInstance.prototype.start = function() {
        var executablePath, port, serverArguments, useMono, _ref;
        useMono = process.platform !== "win32";
        executablePath = useMono ? "mono" : location;
        port = this.getPortNumber();
        serverArguments = ["-s", typeof atom !== "undefined" && atom !== null ? (_ref = atom.project) != null ? _ref.path : void 0 : void 0, "-p", port];
        if (useMono) {
          serverArguments.unshift(location);
        }
        this.child = spawn(executablePath, serverArguments);
        atom.emit("omni-sharp-server:start", this.child.pid);
        atom.emit("omni-sharp-server:state-change", "loading");
        this.child.stdout.on('data', this.out);
        this.child.stderr.on('data', this.err);
        return this.child.on('close', this.close);
      };

      OmniSharpServerInstance.prototype.out = function(data) {
        var s, _ref, _ref1;
        s = data.toString();
        if (((_ref = s.match(/Solution has finished loading/)) != null ? _ref.length : void 0) > 0) {
          atom.emit("omni-sharp-server:ready", this.child.pid);
          atom.emit("omni-sharp-server:state-change", "ready");
        }
        if (((_ref1 = s.match(/Detected an OmniSharp instance already running on port/)) != null ? _ref1.length : void 0) > 0) {
          atom.emit("omni-sharp-server:error");
          atom.emit("omni-sharp-server:state-change", "error");
          this.stop();
        }
        return atom.emit("omni-sharp-server:out", s);
      };

      OmniSharpServerInstance.prototype.err = function(data) {
        return atom.emit("omni-sharp-server:err", data.toString());
      };

      OmniSharpServerInstance.prototype.close = function(data) {
        atom.emit("omni-sharp-server:close", data);
        atom.emit("omni-sharp-server:state-change", "off");
        return this.port = null;
      };

      OmniSharpServerInstance.prototype.getPortNumber = function() {
        var currentWindow, index, windows;
        if (this.port) {
          return this.port;
        }
        windows = BrowserWindow.getAllWindows();
        currentWindow = BrowserWindow.getFocusedWindow().getProcessId();
        index = windows.findIndex((function(_this) {
          return function(w) {
            return w.getProcessId() === currentWindow;
          };
        })(this));
        this.port = 2000 + index;
        return this.port;
      };

      OmniSharpServerInstance.prototype.stop = function() {
        var _ref;
        if ((_ref = this.child) != null) {
          _ref.kill("SIGKILL");
        }
        return this.child = null;
      };

      OmniSharpServerInstance.prototype.toggle = function() {
        if (this.child) {
          return this.stop();
        } else {
          return this.start();
        }
      };

      return OmniSharpServerInstance;

    })();

    OmniSharpServer.get = function() {
      return instance != null ? instance : instance = new OmniSharpServerInstance();
    };

    return OmniSharpServer;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiIgogIF0sCiAgIm5hbWVzIjogW10sCiAgIm1hcHBpbmdzIjogIkFBQUE7QUFBQSxNQUFBLDREQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVIsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsS0FBQSxHQUFRLE9BQUEsQ0FBUSxlQUFSLENBQXdCLENBQUMsS0FEakMsQ0FBQTs7QUFBQSxFQUVBLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLFFBQVIsQ0FBaUIsQ0FBQyxPQUFsQixDQUEwQixnQkFBMUIsQ0FGaEIsQ0FBQTs7QUFBQSxFQUdBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSwyQkFBUixDQUhwQixDQUFBOztBQUFBLEVBS0EsTUFBTSxDQUFDLE9BQVAsR0FDUTtBQUNKLFFBQUEsaUNBQUE7O2lDQUFBOztBQUFBLElBQUEsUUFBQSxHQUFXLElBQVgsQ0FBQTs7QUFBQSxJQU9BLGVBQUMsQ0FBQSxFQUFELEdBQ0U7QUFBQSxNQUFBLFlBQUEsRUFBYyxJQUFkO0FBQUEsTUFDQSxTQUFBLEVBQVcsS0FEWDtBQUFBLE1BRUEsS0FBQSxFQUFPLElBRlA7QUFBQSxNQUdBLFFBQUEsRUFBVSxLQUhWO0FBQUEsTUFJQSxJQUFBLEVBQU0sS0FKTjtBQUFBLE1BS0EsVUFBQSxFQUFZLElBTFo7QUFBQSxNQU1BLE9BQUEsRUFBUyxLQU5UO0FBQUEsTUFPQSxVQUFBLEVBQVksSUFQWjtBQUFBLE1BUUEsT0FBQSxFQUFTLEtBUlQ7QUFBQSxNQVVBLGdCQUFBLEVBQWtCLEtBVmxCO0FBQUEsTUFZQSxLQUFBLEVBQU8sS0FaUDtBQUFBLE1BYUEsYUFBQSxFQUFlLEtBYmY7S0FSRixDQUFBOztBQUFBLElBdUJBLElBQUksQ0FBQyxFQUFMLENBQVEsZ0NBQVIsRUFBMEMsU0FBQyxLQUFELEdBQUE7QUFDeEMsTUFBQSxlQUFDLENBQUEsRUFBRSxDQUFDLGFBQUosR0FB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
//# sourceURL=/Users/daniel/.atom/packages/omnisharp-atom/lib/omni-sharp-server/omni-sharp-server.coffee