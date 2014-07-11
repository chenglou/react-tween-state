/** @jsx React.DOM */
/* global tweenStateMixin, easingTypes */

var Block = React.createClass({
  render: function() {
    var style = {
      position: 'absolute',
      width: 50,
      height: 70,
      border: '1px solid blue'
    };

    return this.transferPropsTo(
      <div style={style}>
        Hi
      </div>
    );
  }
});

var App = React.createClass({
  mixins: [tweenStateMixin],

  getInitialState: function() {
    return {
      blockPosition: 50,
    };
  },

  handleTweenClick: function() {
    this.tweenState('blockPosition', {
      easing: easingTypes.easeOutQuad,
      duration: 300,
      value: this.state.blockPosition == 50 ? 300 : 50,
      onEnd: function() {
        console.log('Done!');
      }
    });
  },

  handleHardClick: function() {
    // reset the state. Let's see how additive animation handles a duration of
    // 0
  },

  render: function() {
    var blockStyle = {
      // TODO: see TODO in getInitialState in mixin
      left: this.state.tweenLayer.blockPosition || this.state.blockPosition,
      top: 50
    };

    return (
      <div>
        <button onClick={this.handleTweenClick}>Tween Me</button>
        <Block style={blockStyle}></Block>
      </div>
    );
  }
});

React.renderComponent(<App />, document.querySelector('.content'));
