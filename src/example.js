/**
 * @jsx React.DOM
 */

// Some basic math we need to ensure the viewport is
// positioned correctly
function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

// Used to round with a variable midpoint, i.e. we favor
// opening the menu
function round(n, min, max, pct) {
  pct = pct || .5;
  if (n > min + (max - min) * pct) {
    return max;
  } else {
    return min;
  }
}

// Tween constants
var POS_CLOSED = -150;
var POS_OPEN = 0;
var TWEEN_TIME = 200;

var App = React.createClass({
  mixins: [TweenMixin], // gives us this.tweenState()

  // Set up some trivial animation such that we are
  // reconciling a child component being animated. Most
  // views will be less complex!
  componentDidMount: function() {
    setInterval(this.updateTicks, 500);
  },
  updateTicks: function() {
    this.setState({ticks: this.state.ticks + 1});
  },
  getInitialState: function() {
    // pos is the current x position (menu open or closed)
    // animating is a boolean that is true when we are
    // opening or closing the menu. We use it to disable
    // reconcilation if there are expensive components
    // in the tree.
    return {pos: POS_CLOSED, animating: false, ticks: 0};
  },
  // wrappers around clamp() and round() for use with
  // this UI
  clampPos: function(desiredPos) {
    return clamp(desiredPos, POS_CLOSED, POS_OPEN);
  },
  roundPos: function(desiredPos) {
    return round(desiredPos, POS_CLOSED, POS_OPEN, .4);
  },
  // Here comes the fun stuff: gestures! Not really
  // animation related, but a cool part of the demo.
  handleSwiping: function(data) {
    // When the user is dragging their finger across the
    // screen, have the menu track it exactly. Note that
    // SwipeTarget requires the user to move 2px for it
    // to count as a real swipe, this is to prevent
    // confusion with taps. So it takes a frame or two
    // for the swipe to start. This is by design; if you
    // don't like it you can change SwipeTarget.
    this.setState({
      pos: this.clampPos(
        this.state.pos + data.offset.x
      )
    });
  },
  handleStartGesturing: function() {
    // This is fired onTouchStart. We want the browser
    // focused solely on animation during this time, so
    // set our animating state flag.
    this.setState({animating: true});
  },
  handleStopGesturing: function(swiping) {
    // This is fired onTouchEnd. If the user has not moved
    // at least 2px, then we don't consider it a swipe. If
    // the user *has* swiped then the tween will reset
    // animating; if not swiping we reset it here.
    if (!swiping) {
      this.setState({animating: false});
    }
  },
  handleSwiped: function(data) {
    // When the user completes a swipe, round the location
    // to whether it should be open or closed, and tween
    // to it.
    // TODO: look at velocity as part of the ease such
    // that you can "throw" the menu closed if you swipe
    // harder. This is easy -- just implement a new ease
    // function that takes data.velocity.x into account.
    this.tweenPos(this.roundPos(this.state.pos));
  },
  handleToggle: function() {
    // Simple: just tween the menu open or closed when the
    // button is tapped.
    this.tweenPos(this.state.pos === POS_OPEN ? POS_CLOSED : POS_OPEN);
  },
  handleCloseMenu: function() {
    // If you tap the content area while the menu is open
    // it should close.
    if (this.state.pos !== POS_OPEN) {
      return;
    }
    this.tweenPos(POS_CLOSED);
  },
  tweenPos: function(desiredPos) {
    // A simple wrapper around our tweening behavior. We
    // want to do a few things: set the animating flag
    // if it has not been set yet, tween to the right
    // place in 200ms, and always clear the animating
    // flag.
    var tween = this.tweenState({override: true});
    if (!this.state.animating) {
      tween.to({animating: true}, 0);
    }
    tween
      .to({pos: desiredPos}, TWEEN_TIME, EasingFunctions.easeOutBack) //easeInOutBounce)
      .to({animating: false}, 0);
  },
  render: function() {
    // Build some simple DOM -- see layout.css for how
    // it fits together.
    return (
      <Sprite x={this.state.pos} class="App">
        <SwipeTarget
            class="SwipeTarget"
            onStartGesturing={this.handleStartGesturing}
            onStopGesturing={this.handleStopGesturing}
            onSwiping={this.handleSwiping}
            onSwiped={this.handleSwiped}>
          <div class="Menu">
            Menu
          </div>
          <div class="Content" onTouchTap={this.handleCloseMenu}>
            <div class="TopBar">
              <a
                  href="javascript:;"
                  class="Button"
                  role="button"
                  onTouchTap={this.handleToggle}>
                <i class="icon-reorder"></i>
              </a>
              Top bar
            </div>
            <div class="Body">
              <p>Open the left menu on a touch device (either drag or tap the button)</p>
              <StaticSprite animating={this.state.animating}>
                <ExpensiveComponent ticks={this.state.ticks} />
              </StaticSprite>
            </div>
          </div>
        </SwipeTarget>
      </Sprite>
    );
  }
});

// Animation demos are usually simple -- this simulates
// what happens if you have a really slow component
// that drops frames. This component will pause the render
// loop for 100ms which is definitely noticeable. We use
// the animating flag in the component above along with
// StaticSprite to mitigate this issue. Try toggling it
// and looking at how smooth the animation. Force
// the animating flag to false in the component above
// to compare.
var ExpensiveComponent = React.createClass({
  getInitialState: function() {
    return {dropFrames: false};
  },
  handleToggle: function() {
    this.setState({dropFrames: !this.state.dropFrames});
  },
  render: function() {
    var start = Date.now();
    if (this.state.dropFrames) {
      // Pause 100ms-ish
      while (Date.now() - start < 100) {}
    }
    return <p>Expensive component: <strong>{this.props.ticks}</strong>. <a href="javascript:;" onTouchTap={this.handleToggle}>{this.state.dropFrames ? 'Stop ' : 'Start '} dropping frames</a></p>;
  }
});

React.renderComponent(<App />, document.body);