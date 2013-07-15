// React batches all mutations that happen in a single
// event tick into a single reconcile. We can do the same
// thing for requestAnimationFrame(). This means you can
// have a ton of different tweens for very little cost, as
// they will coalesce into a single reconcile.
var _requestAnimationFrame = window.requestAnimationFrame;

// Completely take over the ReactUpdates system.

var batchedUpdates = React.Updates.batchedUpdates;

React.Updates.batchedUpdates = function(func) {
  func();
};

window.requestAnimationFrame = function(func) {
  return _requestAnimationFrame(function() {
    // This is the magic that does it. Note: this was
    // exported in my custom build of React; it is not
    // available in the prebuilt versions yet.
    batchedUpdates(func);
  });
};