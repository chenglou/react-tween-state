/**
 * @jsx React.DOM
 */

function Vector(x, y) {
  this.x = x;
  this.y = y;
}

// TODO: we could pool these in the future maybe
function vector(x, y) {
  return new Vector(x, y);
}

function SwipingEvent(offset, time, swiped) {
  this.offset = offset;
  this.time = time;
  this.swiped = swiped;
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

function isDistanceGreaterThan(v1, v2, d) {
  // http://jsperf.com/pow-vs-mul
  var xd = (v2.x - v1.x);
  var yd = (v2.y - v1.y);
  return xd * xd + yd * yd > d * d;
}

var MIN_SWIPE_DISTANCE = 2;

var SwipeTarget = React.createClass({
  getInitialState: function() {
    return {
      lastTouchPos: null,
      lastTouchVelocity: null,
      lastTouchTime: null,
      touchStartPos: null,
      swiped: false
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
      touchStartPos: vector(touch.screenX, touch.screenY),
      swiped: false
    });
    return false;
  },

  handleTouchMove: function(e) {
    var touch = e.targetTouches[0];
    var time = Date.now();
    var timeDelta = time - this.state.lastTouchTime;
    var offsetX = touch.screenX - this.state.lastTouchPos.x;
    var offsetY = touch.screenY - this.state.lastTouchPos.y;

    var swiped = this.state.swiped || isDistanceGreaterThan(
      this.state.lastTouchPos,
      this.state.touchStartPos,
      MIN_SWIPE_DISTANCE
    );

    if (this.props.onSwiping) {
      this.props.onSwiping(swipingEvent(vector(offsetX, offsetY), timeDelta, swiped));
    }

    // reuse the last obj for less GCs, even though
    // mutating state is bad form in React.
    var lastTouchVelocity = this.state.lastTouchVelocity;
    lastTouchVelocity.x = offsetX / timeDelta;
    lastTouchVelocity.y = offsetY /  timeDelta;

    var lastTouchPos = this.state.lastTouchPos;
    lastTouchPos.x = touch.screenX;
    lastTouchPos.y = touch.screenY;

    this.setState({
      lastTouchPos: lastTouchPos,
      lastTouchVelocity: lastTouchVelocity,
      lastTouchTime: time,
      swiped: swiped
    });

    return false;
  },

  handleTouchEnd: function(e) {
    if (this.props.onStopGesturing) {
      this.props.onStopGesturing(this.state.swiped);
    }

    // TODO: these velocity calcs could be better? Is there an issue if
    // you hold for a long time?
    if (this.props.onSwiped && this.state.swiped) {
      this.props.onSwiped(swipedEvent(this.state.lastTouchVelocity));
    }
    return false;
  },

  render: function() {
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

React.initializeTouchEvents(true);

window.SwipeTarget = SwipeTarget;