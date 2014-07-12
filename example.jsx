/** @jsx React.DOM */
/* global tweenStateMixin, easingTypes */

var Block = React.createClass({
  render: function() {
    var style = {
      position: 'absolute',
      width: 50,
      height: 70,
      outline: '1px solid blue',
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
      easing: easingTypes.easeInOutQuad,
      duration: 1000,
      value: this.state.blockPosition === 50 ? 400 : 50,
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
      // TODO: compute on the fly instead
      left: this.state.tweenLayer.blockPosition || this.state.blockPosition,
      top: 50
    };

    var boundingBoxStyle = {
      outline: '1px solid black',
      position: 'absolute',
      width: 400,
      left: 50,
      height: 80,
      top: 50,
    };

    return (
      <div>
        <button onClick={this.handleTweenClick}>Tween Me</button>
        <div style={boundingBoxStyle} />
        <Block style={blockStyle}></Block>
      </div>
    );
  }
});

React.renderComponent(<App />, document.querySelector('.content'));
