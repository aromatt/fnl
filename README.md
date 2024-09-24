# lockwrap
Funnel a function's invocations into a queue or guard them with a nonblocking mutex.

## queued
Forces a function's calls into a queue, causing them to execute sequentially.

Example:

    var queuedFn = queued(function(release, a, doRelease) {
      console.log("value:", a);
      if (doRelease) {
        console.log("I will release.");
        setTimeout(release, 100);
      } else {
        console.log("I will not release; I will time out");
      }
    }, { timeout: 100 });

    queuedFn(1, true);
    queuedFn(2, true);
    queuedFn(3, true);
    queuedFn(4, false);
    console.log("Done queueing calls");

Sample output:

    value: 1
    I will release.
    Done queueing calls
    value: 2
    I will release.
    value: 3
    I will release.
    value: 4
    I will not release; I will time out


## locked
Wraps the provided function in a limited-lifespan, nonblocking mutex, preventing
reentry into the function until the provided `release` callback is called.

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


# TODO
* support custom release/timeout functions
* optionally raise an exception when lock cannot be obtained


