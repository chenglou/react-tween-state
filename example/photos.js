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

var Photo = React.createClass({
  render: function() {
    return (
      <div
        class="Photo"
        style={{
          width: this.props.width,
          height: this.props.height,
          backgroundImage: 'url(' + this.props.src + ')'
        }}>
        <div class="PhotoInfo">
          <div class="PhotoText">
            <div class="PhotoCaption">{this.props.caption}</div>
            <div class="PhotoDomain">{this.props.domain}</div>
          </div>
          <div class="PhotoDimensions">
            {this.props.width}x{this.props.height}
          </div>
        </div>
      </div>
    );
  }
});

var SAMPLE_WIDTH = 240;
var SAMPLE_HEIGHT = 320;

function renderSamplePhotos(n) {
  var photos = [];
  for (var i = 0; i < n; i++) {
    photos.push(
      <Photo
      src={'http://lorempixel.com/' + SAMPLE_WIDTH + '/' + SAMPLE_HEIGHT + '/sports/' + (i + 1)}
        width={SAMPLE_WIDTH}
        height={SAMPLE_HEIGHT}
        caption={'Sample image ' + i}
        domain="lorempixel.com"
        key={'photo' + i}
      />
    );
  }
  return photos;
}

SAMPLE_PHOTOS = renderSamplePhotos(5);

var TWEEN_TIME = 275;

var App = React.createClass({
  mixins: [TweenMixin], // gives us this.tweenState()
  getInitialState: function() {
    return {pos: 0, animating: false};
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
  handleSwiping: function(data) {
    this.setState({
      pos: this.state.pos + data.offset.x
    });
  },
  handleSwiped: function() {
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
      .to({pos: desiredPos}, TWEEN_TIME, EasingFunctions.easeOutBack)
      .to({animating: false}, 0);
  },
  render: function() {
    // Build some simple DOM -- see layout.css for how
    // it fits together.
    return (
      <SwipeTarget
          class="Viewport"
          onStartGesturing={this.handleStartGesturing}
          onStopGesturing={this.handleStopGesturing}
          onSwiping={this.handleSwiping}
          onSwiped={this.handleSwiped}>
        <Sprite x={this.state.pos} class="App">
          <StaticSprite animating={this.state.animating}>
            <span>{SAMPLE_PHOTOS}</span>
          </StaticSprite>
        </Sprite>
      </SwipeTarget>
    );
  }
});

React.renderComponent(<App />, document.body);