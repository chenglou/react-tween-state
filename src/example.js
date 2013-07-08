/**
 * @jsx React.DOM
 */

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

function round(n, min, max, pct) {
  pct = pct || .5;
  if (n > min + (max - min) * pct) {
    return max;
  } else {
    return min;
  }
}

var App = React.createClass({
  mixins: [TweenMixin],
  componentDidMount: function() {
    setInterval(this.updateTicks, 500);
  },
  updateTicks: function() {
    this.setState({ticks: this.state.ticks + 1});
  },
  getInitialState: function() {
    return {pos: -150, animating: 0, ticks: 0};
  },
  clampPos: function(desiredPos) {
    return clamp(desiredPos, -150, 0);
  },
  roundPos: function(desiredPos) {
    return round(desiredPos, -150, 0, .4);
  },
  handleSwiping: function(data) {
    this.setState({
      pos: this.clampPos(
        this.state.pos + data.offset.x
      )
    });
    return false;
  },
  handleStartGesturing: function() {
    this.setState({animating: 1});
  },
  handleStopGesturing: function(swiping) {
    if (!swiping) {
      this.setState({animating: 0});
    }
  },
  handleSwiped: function(data) {
    // TODO: look at velocity as part of the ease
    var desiredPos = this.roundPos(this.state.pos);
    this.tweenState()
      .to({pos: desiredPos}, 200, EasingFunctions.easeInOutCubic)
      .to({animating: 0}, 0); //createjs.Ease.bounceOut);
    return false;
  },
  handleOpen: function() {
    this.tweenState()
      .to({animating: 1}, 0)
      .to({pos: this.state.pos === 0 ? -150 : 0}, 200, EasingFunctions.easeInOutCubic)
      .to({animating: 0}, 0);
    return false;
  },
  handleCloseMenu: function() {
    if (this.state.pos !== 0) {
      return false;
    }
    this.tweenState()
      .to({animating: 1}, 0)
      .to({pos: -150}, 200, EasingFunctions.easeInOutCubic)
      .to({animating: 0}, 0);
    return false;
  },
  render: function() {
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
                  onTouchTap={this.handleOpen}>
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

var ExpensiveComponent = React.createClass({
  getInitialState: function() {
    return {dropFrames: false};
  },
  handleToggle: function() {
    this.setState({dropFrames: !this.state.dropFrames});
  },
  render: function() {
    var start = Date.now();
    // drop some frames
    if (this.state.dropFrames) {
      while (Date.now() - start < 100) {}
    }
    return <p>Expensive component: {this.props.ticks}. <a href="javascript:;" onTouchTap={this.handleToggle}>{this.state.dropFrames ? 'Stop ' : 'Start '} dropping frames</a></p>;
  }
});

React.renderComponent(<App />, document.body);