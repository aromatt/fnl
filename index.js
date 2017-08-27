let DEFAULT_TIMEOUT = 60 * 1000;

function passThrough() {
  let lock = null;
  let timeout = DEFAULT_TIMEOUT;
  let fn;
  let opts;
  let resultFn = function(err, result) {
    if (err) {
      return console.error(err);
    } else {
      return result;
    }
  };

  if (typeof arguments[0] !== 'function') {
    throw({ message: "First argument must be a function." });
  } else {
    fn = [].shift.call(arguments);
  }

  if (typeof arguments[0] === 'function') {
    resultFn = [].shift.call(arguments);
  }

  if (typeof arguments[0] === 'object') {
    opts = [].shift.call(arguments);
    if (opts.hasOwnProperty('timeout')) {
      if (typeof opts.timeout === 'number') {
        timeout = opts.timeout;
      } else {
        throw({ message: "'timeout' must be a number" });
      }
    }
  }

  let release = function(err, result) {
    if (err) console.error(err);
    if (fn.lock == lock) { fn.lock = null; }
    clearTimeout(lock);
    resultFn(err, result);
  };
  let hold = function() {
    if (fn.lock) { return false; }
    fn.lock = lock = setTimeout(release, timeout);
    return true;
  };

  return function() {
    if (!hold()) { return; }
    [].unshift.apply(arguments, [release]);
    return fn.apply(fn, arguments);
  };
}

function queued() {
  let timeout = DEFAULT_TIMEOUT;
  let timer;
  let fn;
  let opts;
  let resultFn = function(err, result) {
    if (err) {
      return console.error(err);
    } else {
      return result;
    }
  };

  if (typeof arguments[0] !== 'function') {
    throw({ message: "First argument must be a function." });
  } else {
    fn = [].shift.call(arguments);
  }

  if (typeof arguments[0] === 'function') {
    resultFn = [].shift.call(arguments);
  }

  if (typeof arguments[0] === 'object') {
    opts = [].shift.call(arguments);
    if (opts.hasOwnProperty('timeout')) {
      if (typeof opts.timeout === 'number') {
        timeout = opts.timeout;
      } else {
        throw({ message: "'timeout' must be a number" });
      }
    }
  }

  fn.queue = [];

  let invoke = function(args) {
    if (!fn.queue[0]) { return; }
    timer = setTimeout(release, timeout);
    fn.apply(fn, fn.queue[0]);
  }

  let release = function(err, result) {
    if (err) console.error(err);
    clearTimeout(timer);
    resultFn(err, result);

    fn.queue.shift();
    if (fn.queue.length > 0) {
      setImmediate(invoke);
    }
  };

  return function() {
    [].unshift.apply(arguments, [release]);
    fn.queue.push(arguments);
    if (fn.queue.length === 1) {
      return invoke();
    }
    return null;
  };
}

module.exports.passThrough = passThrough;
module.exports.queued = queued;
