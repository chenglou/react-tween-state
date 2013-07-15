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

// Lorempixel sends nocache headers so when we add/remove elements they are not cached.
// NOTE: this is maybe a bad idea to keep the DOM node in memory, but it's good to keep
// the image in cache. It's just a workaround for lorempixel's no cache -- don't take
// this as a best practice since it wastes memory!
var imgElementCache = {};

var LoremPixelCachedImage = React.createClass({
  render: function() {
    return <div />;
  },
  update: function() {
    var img = imgElementCache[this.props.src];
    if (!img) {
      img = imgElementCache[this.props.src] = document.createElement('img');
      img.src = this.props.src;
      img.setAttribute('width', this.props.width);
      img.setAttribute('height', this.props.height);
    }
    var node = this.getDOMNode();
    if (node.firstChild) {
      node.removeChild(node.firstChild);
    }
    node.appendChild(img);
  },
  componentDidMount: function() {
    this.update();
  },
  componentDidUpdate: function() {
    this.update();
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
        <LoremPixelCachedImage src={this.props.src} width="100%" height="100%" />
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

var SAMPLE_PHOTOS = renderSamplePhotos(5);

var TWEEN_TIME = 200;

// Some basic math we need to ensure the viewport is
// positioned correctly
function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

var App = React.createClass({
  mixins: [TweenMixin], // gives us this.tweenState()
  clampPos: function(desiredPos) {
    var min = -2 * SAMPLE_WIDTH;
    var max = 0;
    if (this.state.index === 0) {
      max = -1 * SAMPLE_WIDTH;
    }
    if (this.state.index === SAMPLE_PHOTOS.length - 1) {
      min = -1 * SAMPLE_WIDTH;
    }
    return clamp(desiredPos, min, max);
  },
  roundPos: function(desiredPos) {
    // round to nearest multiple of SAMPLE_WIDTH
    return Math.round(desiredPos / SAMPLE_WIDTH) * SAMPLE_WIDTH;
  },
  getInitialState: function() {
    return {pos: -1 * SAMPLE_WIDTH, index: 0, animating: false, photos: this.getPhotos(0)};
  },
  getPhotos: function(index) {
    var photos = {};
    photos['photo' + (index - 1)] = SAMPLE_PHOTOS[index - 1] || <PhotoContainer width={SAMPLE_WIDTH} height={SAMPLE_HEIGHT} />;
    photos['photo' + index] = SAMPLE_PHOTOS[index];
    photos['photo' + (index + 1)] = SAMPLE_PHOTOS[index + 1] || <PhotoContainer width={SAMPLE_WIDTH} height={SAMPLE_HEIGHT} />;
    return photos
  },
  updateIndex: function() {
    var index = this.state.index - Math.round(this.state.pos / SAMPLE_WIDTH) - 1;
    var photos = this.getPhotos(index);
    this.setState({index: index, pos: -1 * SAMPLE_WIDTH, photos: photos});
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
      this.setState({animating: false}, this.updateIndex);
    }
  },
  handleSwiping: function(data) {
    this.setState({
      pos: this.clampPos(this.state.pos + data.offset.x)
    });
  },
  handleSwiped: function(data) {
    this.tweenPos(this.roundPos(this.state.pos));
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
      .to({animating: false}, 0)
      .call(window.setTimeout.bind(window, this.updateIndex, 0)); // TODO: this is a hack
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
        <Sprite x={this.state.pos} class="App" force3d={true}>
          <StaticSprite animating={this.state.animating}>
            <span>{this.state.photos}</span>
          </StaticSprite>
        </Sprite>
      </SwipeTarget>
    );
  }
});

React.renderComponent(<App />, document.body);