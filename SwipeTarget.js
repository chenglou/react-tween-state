/**
 * @jsx React.DOM
 */

var SwipeTarget = React.createClass({
  getInitialState: function() {
    return {
      lastTouchPos: null,
      lastTouchVelocity: null,
      lastTouchTime: null,
    };
  },

  handleTouchStart: function(e) {
    var touch = e.targetTouches[0];
    this.setState({
      lastTouchPos: {
        x: touch.screenX,
        y: touch.screenY
      },
      lastTouchVelocity: {
        x: 0,
        y: 0
      },
      lastTouchTime: Date.now()
    });
    return false;
  },

  handleTouchMove: function(e) {
    var touch = e.targetTouches[0];
    var time = Date.now();
    var timeDelta = time - this.state.lastTouchTime;
    var offsetX = touch.screenX - this.state.lastTouchPos.x;
    var offsetY = touch.screenY - this.state.lastTouchPos.y;

    if (this.props.onSwipe) {
      this.props.onSwipe({
        offset: {
          x: offsetX,
          y: offsetY
        },
        time: timeDelta
      });
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
      lastTouchTime: time
    });

    return false;
  },

  handleTouchEnd: function(e) {
    if (this.props.onSwipeEnd) {
      this.props.onSwipe({
        vector: {
          x: (touch.screenX - this.state.lastTouchX)
        },
        time: Date.now() - this.state.lastTouchTime
      });
    }
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