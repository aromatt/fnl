# qfn
Synchronize calls to functions using queues, mutexes, etc.

## Lock
Wraps the provided function in a limited-lifespan mutex, preventing reentry
into the function until the provided `release` callback is called.

Example:

    var noReentry = locked(function(release, a, b, c) {

      db.find('foo', function(result) {

        process(result);  // Assume this call is synchronous

        release();        // Release the mutex here

      }, release);        // We provide `release` as an error callback to `find`,
                          // so that the lock will be released even if the find
                          // fails

    }, 5000);             // Finally, if all else fails, the lock will be
                          // released in 5 seconds no matter what.

TODO - support blocking mutex, and/or a queueing mechanism
     - support custom release/timeout functions
     - optionally raise an exception when lock cannot be obtained


