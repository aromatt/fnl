export function queued() {
  let timeout = null;
  let fn;
  let opts;
  let queue = [];

  // The first argument must be the function to wrap
  if (typeof arguments[0] !== 'function') {
    throw({ message: "First argument must be a function." });
  } else {
    fn = [].shift.call(arguments);
  }

  // Accept { timout: <milliseconds> }
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

  let invoke = function() {
    // Any calls left in the queue?
    if (!queue[0]) { return; }

    // Set up release callback for this invocation. It will either be called
    // by the user or triggered by the timeout.
    let released = false;
    let release = function() {
      if (released) { return; }
      released = true;

      // Clear this call's timer.
      clearTimeout(timer);

      // Remove this call from the queue. A call stays in the queue during
      // its execution.
      queue.shift();

      // Place next invoke() in runtime's event queue, to be executed as
      // soon as the current execution stack is cleared.
      if (queue.length > 0) {
	setTimeout(invoke, 0);
      }
    };

    // Set up the timeout
    let timer;
    if (timeout) {
      timer = setTimeout(release, timeout);
    }

    // Call the user's function
    return fn.call(fn, release, ...queue[0]);
  }

  return function() {
    // Enqueue this call
    queue.push(arguments);

    // If there were no other calls in the queue, then invoke immediately.
    // Otherwise, this call will be invoked by an earlier call's release
    // callback.
    if (queue.length === 1) {
      return invoke();
    }
    // TODO return a Promise
    return null;
  };
}

export function passThrough() {
  let locked = false;
  let timeout = null;
  let timer;
  let fn;
  let opts;

  // The first argument must be the function to wrap
  if (typeof arguments[0] !== 'function') {
    throw({ message: "First argument must be a function." });
  } else {
    fn = [].shift.call(arguments);
  }

  // Accept { timout: <milliseconds> }
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

  let release = function() {
    locked = false;
    clearTimeout(timer);
  };

  let obtain = function() {
    if (locked) { return false; }
    if (timeout) {
      timer = setTimeout(release, timeout);
    }
    locked = true;
    return true;
  };

  return function() {
    if (!obtain()) { return; }
    return fn.call(fn, release, ...arguments);
  };
}
