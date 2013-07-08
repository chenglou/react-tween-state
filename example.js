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
  getInitialState: function() {
    return {pos: -150, lastTouch: null};
  },
  clampPos: function(desiredPos) {
    return clamp(desiredPos, -150, 0);
  },
  handleTouchMove: function(e) {
    var touch = e.targetTouches[0];
    this.setState({
      pos: this.clampPos(
        this.state.pos + (touch.screenX - this.state.lastTouch)
      ),
      lastTouch: touch.screenX
    });
    return false;
  },
  handleTouchStart: function(e) {
    var touch = e.targetTouches[0];
    this.setState({lastTouch: touch.screenX});
    return false;
  },
  handleTouchEnd: function(e) {
    var desiredPos = round(this.state.pos, -150, 0, .33);
    this.tween().to({pos: desiredPos}, 200, EasingFunctions.easeInOutCubic); //createjs.Ease.bounceOut);
    return false;
  },
  handleOpen: function() {
    this.tween().to({pos: this.state.pos === 0 ? -150 : 0}, 200, EasingFunctions.easeInOutCubic);
    return false;
  },
  getStyle: function() {
    return {
      '-webkit-transform': 'translate3d(' + this.state.pos + 'px, 0, 0)'
    };
  },
  render: function() {
    return (
      <div
          style={this.getStyle()}
          class="App"
          onTouchStart={this.handleTouchStart}
          onTouchEnd={this.handleTouchEnd}
          onTouchMove={this.handleTouchMove}>
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
            Body
          </div>
        </div>
      </div>
    );
  }
});

React.renderComponent(<App />, document.body);