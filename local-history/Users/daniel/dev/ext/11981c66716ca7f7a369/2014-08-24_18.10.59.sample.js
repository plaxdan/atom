var Promise = require('es6-promise').Promise;


var handlerA = function () {
  return waitFor([handlerB])
    .then(function () {
      console.log('handlerA');
    });
};
var handlerB = function () {
  return waitFor([handlerD])
    .then(function () {
      console.log('handlerB');
    });
};
var handlerC = function () {
  console.log('handlerC');
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, 2000);
  });
};
var handlerD = function () {
  return waitFor([handlerC]) // replace handlerC to handlerA to force circular dependency
    .then(function () {
      console.log('handlerD');
    });
};


var state = {};
var master = [handlerA, handlerB, handlerC, handlerD];


var waitFor = function (handlers) {
  return execute(handlers);
};


var execute = function (handlers) {
  return new Promise(function (resolve, reject) {
    var queue = handlers.slice();

    var finished = function () {
      resolve();
    };

    var run = function () {
      if (queue.length === 0) return finished();

      var handler = queue.shift();

      var pos = master.indexOf(handler);
      if (pos === -1 && state[handler] === 'done') return run();
      if (pos === -1) return reject(new Error('circular dependency'));

      master.splice(pos, 1);

      Promise.resolve()
        .then(handler)
        .then(updateState.bind(null, handler))
        .then(run, reject);
    };

    run();
  });
};


var updateState = function (handler) {
  state[handler] = 'done';
};


var success = function () {
  console.log('success');
};

var fail = function () {
  console.log('fail', arguments);
};

execute(master)
  .then(success, fail);
