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

var Image = React.createClass({
  render: function() {
    return <div style={{width: this.props.width, height: this.props.height, background: this.props.src}} />;
  }
});

var PhotoContainer = React.createClass({
  render: function() {
    return (
      <div class="Photo" style={{width: this.props.width, height: this.props.height}}>
        {this.props.children}
      </div>
    );
  }
});

var Photo = React.createClass({
  render: function() {
    return (
      <PhotoContainer width={this.props.width} height={this.props.height}>
        <Image src={this.props.src} width="100%" height="100%" />
        <div class="PhotoInfo">
          <div class="PhotoText">
            <div class="PhotoCaption">{this.props.caption}</div>
            <div class="PhotoDomain">{this.props.domain}</div>
          </div>
          <div class="PhotoDimensions">
            {this.props.width}x{this.props.height}
          </div>
        </div>
      </PhotoContainer>
    );
  }
});

var SAMPLE_WIDTH = document.documentElement.clientWidth;
var SAMPLE_HEIGHT = document.documentElement.clientHeight;
var SRCS = ['red', 'green', 'blue', 'yellow', 'gray', 'orange'];

var TWEEN_TIME = 225;

// Some basic math we need to ensure the viewport is
// positioned correctly
function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

var App = React.createClass({
  mixins: [TweenMixin], // gives us this.tweenState()
  clampPos: function(desiredPos) {
    var min = -1 * SAMPLE_WIDTH;
    var max = SAMPLE_WIDTH;
    if (this.state.index === 0) {
      max = 0;
    }
    if (this.state.index === SRCS.length - 1) {
      min = 0;
    }
    return clamp(desiredPos, min, max);
  },
  roundPos: function(desiredPos) {
    // round to nearest multiple of SAMPLE_WIDTH
    return Math.round(desiredPos / SAMPLE_WIDTH) * SAMPLE_WIDTH;
  },
  getInitialState: function() {
    return {dragPos: 0, index: 0, animating: false};
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
      this.setState({animating: false}, this.snap);
    }
  },
  handleSwiping: function(data) {
    this.setState({
      dragPos: this.clampPos(this.state.dragPos + data.offset.x)
    });
  },
  handleSwiped: function(data) {
    this.tweenPos(this.roundPos(this.state.dragPos));
  },
  snap: function() {
    if (this.state.dragPos > 0 && this.state.index > 0) {
      this.setState({index: this.state.index - 1, dragPos: 0});
    } else if (this.state.dragPos < 0 && this.state.index < SRCS.length - 1) {
      this.setState({index: this.state.index + 1, dragPos: 0});
    } else {
      this.setState({dragPos: 0});
    }
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
      .to({dragPos: desiredPos}, TWEEN_TIME, EasingFunctions.easeOutBack)
      .to({animating: false}, 0)
      .call(window.setTimeout.bind(window, this.snap, 0)); // TODO: this is a hack
  },
  renderPhotos: function() {
    // TODO: we could pool this, right?
    var photos = {};
    for (var i = Math.max(0, this.state.index - 1); i <= Math.min(this.state.index + 1, SRCS.length - 1); i++) {
      var src = SRCS[i];
      var offset = (this.state.index - i) * -1 * SAMPLE_WIDTH;
      // TODO: could just have 3 IDs maybe to reuse DOM nodes?
      photos['photo' + i] = (
        <Sprite x={offset + this.state.dragPos} class="PhotoSprite">
          <StaticSprite animating={this.state.animating}>
            <Photo width={SAMPLE_WIDTH} height={SAMPLE_HEIGHT} src={src} />
          </StaticSprite>
        </Sprite>
      );
    }
    return photos;
  },
  render: function() {
    // Build some simple DOM -- see photos.css for how
    // it fits together.
    // force3d on the sprite to avoid a flash when copying to vram
    return (
      <SwipeTarget
          class="Viewport"
          onStartGesturing={this.handleStartGesturing}
          onStopGesturing={this.handleStopGesturing}
          onSwiping={this.handleSwiping}
          onSwiped={this.handleSwiped}>
        {this.renderPhotos()}
      </SwipeTarget>
    );
  }
});

React.renderComponent(<App />, document.body);