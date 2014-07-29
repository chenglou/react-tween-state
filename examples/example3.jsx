/** @jsx React.DOM */

var tweenState = require('../');
var React = require('react');

var App3 = React.createClass({
  mixins: [tweenState.Mixin],

  getInitialState: function() {
    return {
      block: {x: 0, y: 0}
    };
  },

  handleTweenClick: function(event) {
    var rect = this.refs.parent.getDOMNode().getBoundingClientRect(),
        boxRect = this.refs.box.getDOMNode().getBoundingClientRect(),
        parentX = rect.left + document.body.scrollLeft,
        parentY = rect.top + document.body.scrollTop,
        animateX = event.pageX - parentX,
        animateY = event.pageY - parentY;

    if (animateX < 0) {
      animateX = 0;
    } else if (animateX > rect.width - boxRect.width) {
      animateX = rect.width - boxRect.width;
    }
    if (animateY < 0) {
      animateY = 0;
    } else if (animateY > rect.height - boxRect.height) {
      animateY = rect.height - boxRect.height;
    }

    this.tweenState(function(state) {return state.block;}, 'x', {
      easing: tweenState.easingTypes.easeInOutQuad,
      stackBehavior: tweenState.stackBehavior.ADDITIVE,
      duration: 500,
      endValue: animateX
    });

    this.tweenState(function(state) {return state.block;}, 'y', {
      easing: tweenState.easingTypes.easeInOutQuad,
      stackBehavior: tweenState.stackBehavior.ADDITIVE,
      duration: 500,
      endValue: animateY
    });
  },

  render: function() {
    var blockStyle = {
      top: this.getTweeningValue(function(state) {return state.block;}, 'y'),
      left: this.getTweeningValue(function(state) {return state.block;}, 'x'),
    };

    return (
      <div style={{padding: 13}}>
        <div>Click anywhere to move the box.</div>
        <div ref="parent" className="squareBoxStyle" onClick={this.handleTweenClick}>
          <div ref="box" className="block" style={blockStyle} />
        </div>
      </div>
    );
  }
});

React.renderComponent(<App3 />, document.querySelector('#content3'));