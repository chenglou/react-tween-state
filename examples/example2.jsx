/** @jsx React.DOM */

var tweenState = require('../tweenState');
var React = require('react');

var App2 = React.createClass({
  mixins: [tweenState.Mixin],

  getInitialState: function() {
    return {
      blocks: [0, 0, 0],
    };
  },

  handleTweenClick: function() {
    // If you want to update nested values in your state, use this API instead.

    // dumb destructive animation
    this.tweenState(function(state) {return state.blocks;}, '0', {
      easing: tweenState.easingTypes.easeInOutQuad,
      stackBehavior: tweenState.stackBehavior.DESTRUCTIVE,
      duration: 1000,
      endValue: this.state.blocks[0] === 0 ? 400 : 0,
    });
    // slightly smarter destructive animation. Current CSS default
    this.tweenState(function(state) {return state.blocks;}, '1', {
      easing: tweenState.easingTypes.easeInOutQuad,
      stackBehavior: tweenState.stackBehavior.DESTRUCTIVE,
      duration: 1000,
      beginValue: this.getTweeningValue(function(state) {return state.blocks;}, '1'),
      endValue: this.state.blocks[1] === 0 ? 400 : 0,
    });
    // optimal default
    this.tweenState(function(state) {return state.blocks;}, '2', {
      easing: tweenState.easingTypes.easeInOutQuad,
      stackBehavior: tweenState.stackBehavior.ADDITIVE,
      duration: 1000,
      endValue: this.state.blocks[2] === 0 ? 400 : 0,
    });
    // BTW, stackBehavior.DESTRUCTIVE + duration 0 effectively cancels all the
    // in-flight animations.
  },

  render: function() {
    var block1Style = {
      left: this.getTweeningValue(function(state) {return state.blocks;}, '0'),
    };

    var block2Style = {
      left: this.getTweeningValue(function(state) {return state.blocks;}, '1'),
    };

    var block3Style = {
      left: this.getTweeningValue(function(state) {return state.blocks;}, '2'),
    };

    return (
      <div style={{padding: 10}}>
        <div><button onClick={this.handleTweenClick}>Tween Me</button></div>

        Dumb Destructive Transition
        <div className="boundingBoxStyle">
          <div className="block" style={block1Style} />
        </div>

        Slightly smarter Destructive Transition (CSS default)
        <div className="boundingBoxStyle">
          <div className="block" style={block2Style} />
        </div>

        Optimal default (additive animation, iOS 8 default)
        <div className="boundingBoxStyle">
          <div className="block" style={block3Style} />
        </div>
      </div>
    );
  }
});

React.renderComponent(<App2 />, document.querySelector('#content2'));
