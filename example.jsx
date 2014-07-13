/** @jsx React.DOM */
/* global tweenStateMixin, easingTypes */

var Block = React.createClass({
  render: function() {
    var style = {
      position: 'absolute',
      width: 50,
      height: 50,
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
      blockPos: {x: 50, y: 100},
      counter: 0,
    };
  },

  handleTweenClick: function() {
    this.tweenState(function(state) {return state.blockPos;}, 'x', {
      easing: easingTypes.easeInOutQuad,
      duration: 1000,
      value: this.state.blockPos.x === 50 ? 400 : 50,
    });
    this.tweenState(function(state) {return state.blockPos;}, 'y', {
      easing: easingTypes.easeInOutQuad,
      duration: 1000,
      value: this.state.blockPos.y === 100 ? 400 : 100,
    });
  },

  count: function() {
    // API shorthand
    this.tweenState('counter', {
      easing: easingTypes.easeOutQuad,
      duration: 500,
      value: this.state.counter + 500,
      onEnd: this.count
    });
  },

  componentDidMount: function() {
    this.count();
  },

  handleHardClick: function() {
    // TODO: reset the state. Needa destory those items on the queue
  },

  render: function() {
    var blockStyle = {
      left: this.getTweeningValue(function(state) {return state.blockPos;}, 'x'),
      top: this.getTweeningValue(function(state) {return state.blockPos;}, 'y'),
    };

    var boundingBoxStyle = {
      outline: '1px solid black',
      position: 'absolute',
      width: 400,
      left: 50,
      height: 350,
      top: 100,
    };

    return (
      <div>
        <div>
          {Math.round(this.getTweeningValue('counter') / 100)} {'<-'} easeOutQuad on a counter
        </div>
        <button onClick={this.handleTweenClick}>Tween Me</button>
        <div style={boundingBoxStyle} />
        <Block style={blockStyle}></Block>
      </div>
    );
  }
});

React.renderComponent(<App />, document.querySelector('.content'));
