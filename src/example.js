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
  handleSwiping: function(data) {
    this.setState({
      pos: this.clampPos(
        this.state.pos + data.offset.x
      )
    });
    return false;
  },
  handleTouchStart: function() {
    this.setState({animating: 1});
  },
  handleStopSwiping: function(swiping) {
    if (!swiping) {
      this.setState({animating: 0});
    }
  },
  handleSwiped: function(data) {
    // TODO: look at velocity as part of the ease
    var desiredPos = round(this.state.pos, -150, 0, .33);
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
  render: function() {
    return (
      <Sprite x={this.state.pos} class="App">
        <SwipeTarget
            class="SwipeTarget"
            onTouchStart={this.handleTouchStart}
            onStopSwiping={this.handleStopSwiping}
            onSwiping={this.handleSwiping}
            onSwiped={this.handleSwiped}>
          <div class="Menu">
            Menu
          </div>
          <div class="Content">
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
  render: function() {
    var start = Date.now();
    // drop some frames
    while (Date.now() - start < 100) {}
    return <p>Expensive component: {this.props.ticks}</p>;
  }
});

React.renderComponent(<App />, document.body);