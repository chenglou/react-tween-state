/**
 * @jsx React.DOM
 */

// Swipe gestures in React!

// Create some utility classes.
function Vector(x, y) {
  this.x = x;
  this.y = y;
}

// TODO: we could pool these in the future maybe, so
// create them with a helper function.
function vector(x, y) {
  return new Vector(x, y);
}

function SwipingEvent(offset, time, swiping) {
  this.offset = offset;
  this.time = time;
  this.swiping = swiping;
}

function swipingEvent(offset, time) {
  return new SwipingEvent(offset, time);
}

function SwipedEvent(velocity) {
  this.velocity = velocity;
}

function swipedEvent(velocity) {
  return new SwipedEvent(velocity);
}

// We can avoid a square root by doing the comparison
// within the function.
function isDistanceGreaterThan(v1, v2, d) {
  // http://jsperf.com/pow-vs-mul
  var xd = (v2.x - v1.x);
  var yd = (v2.y - v1.y);
  return xd * xd + yd * yd > d * d;
}

// We need to know the difference between a tap and a
// swipe; we define a swipe by moving at least 2px
// throughout its lifetime.
var MIN_SWIPE_DISTANCE = 2;

var SwipeTarget = React.createClass({
  getInitialState: function() {
    return {
      lastTouchPos: null,
      lastTouchVelocity: null,
      lastTouchTime: null,
      touchStartPos: null,
      swiping: false
    };
  },

  handleTouchStart: function(e) {
    var touch = e.targetTouches[0];

    if (this.props.onStartGesturing) {
      this.props.onStartGesturing();
    }

    this.setState({
      lastTouchPos: vector(touch.screenX, touch.screenY),
      lastTouchVelocity: vector(0, 0),
      lastTouchTime: Date.now(),
      // Create a second vector here because we mutate
      // the first one to save GC
      touchStartPos: vector(touch.screenX, touch.screenY),
      swiping: false
    });

    // We return false from all touch handlers so the
    // browser doesn't scroll.
    return false;
  },

  handleTouchMove: function(e) {
    var touch = e.targetTouches[0];
    var time = Date.now();
    var timeDelta = time - this.state.lastTouchTime;
    var offsetX = touch.screenX - this.state.lastTouchPos.x;
    var offsetY = touch.screenY - this.state.lastTouchPos.y;

    // If the swipe has ever moved 2px from the origin, we
    // are doing a swipe gesture.
    var swiping = this.state.swiping || isDistanceGreaterThan(
      this.state.lastTouchPos,
      this.state.touchStartPos,
      MIN_SWIPE_DISTANCE
    );

    if (this.props.onSwiping && swiping) {
      this.props.onSwiping(swipingEvent(vector(offsetX, offsetY), timeDelta, swiping));
    }

    // Reuse the last obj for less GCs, even though
    // mutating state is bad form in React. This is a
    // hot path and we know what we're doing.
    var lastTouchVelocity = this.state.lastTouchVelocity;
    lastTouchVelocity.x = offsetX / timeDelta;
    lastTouchVelocity.y = offsetY / timeDelta;

    var lastTouchPos = this.state.lastTouchPos;
    // TODO: I think these numbers are incorrect on Android
    lastTouchPos.x = touch.screenX;
    lastTouchPos.y = touch.screenY;

    this.setState({
      lastTouchPos: lastTouchPos,
      lastTouchVelocity: lastTouchVelocity,
      lastTouchTime: time,
      swiping: swiping
    });

    // Again, return false so the browser doesn't get it.
    return false;
  },

  handleTouchEnd: function(e) {
    if (this.props.onStopGesturing) {
      this.props.onStopGesturing(this.state.swiping);
    }

    // TODO: is it possible the velocity has changed since
    // the last move event? Like if the user swipes, holds,
    // and then lets go?
    if (this.props.onSwiped && this.state.swiping) {
      this.props.onSwiped(swipedEvent(this.state.lastTouchVelocity));
    }
    return false;
  },

  render: function() {
    // Area of improvement: make it work for mouse events.
    return this.transferPropsTo(
      <div
          onTouchStart={this.handleTouchStart}
          onTouchEnd={this.handleTouchEnd}
          onTouchMove={this.handleTouchMove}>
        {this.props.children}
      </div>
    );
  }
});

// Need this to get happy touch events in React. By the way
// this example uses a custom build of React which injects
// TapEventPlugin, which is needed if you ever want
// onTouchTap. It is not included by default in React today
React.initializeTouchEvents(true);

window.SwipeTarget = SwipeTarget;