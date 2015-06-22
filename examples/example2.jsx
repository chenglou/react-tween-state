'use strict';

import {easingTypes, stackBehavior, Mixin} from '../';
import React from 'react';

function translateXStyle(val) {
  return {
    transform: `translateZ(0) translateX(${val}px)`,
    WebkitTransform: `translateZ(0) translateX(${val}px)`,
  };
}

export default React.createClass({
  mixins: [Mixin],

  getInitialState: function() {
    return {
      blocks: [0, 0, 0],
    };
  },

  handleTweenClick: function() {
    // If you want to update nested values in your state, pass an array path
    // instead of a string

    // dumb destructive animation
    this.tweenState(['blocks', 0], {
      easing: easingTypes.easeInOutQuad,
      stackBehavior: stackBehavior.DESTRUCTIVE,
      duration: 1000,
      endValue: this.state.blocks[0] === 0 ? 400 : 0,
    });
    // slightly smarter destructive animation. Current CSS default
    this.tweenState(['blocks', 1], {
      easing: easingTypes.easeInOutQuad,
      stackBehavior: stackBehavior.DESTRUCTIVE,
      duration: 1000,
      beginValue: this.getTweeningValue(['blocks', 1]),
      endValue: this.state.blocks[1] === 0 ? 400 : 0,
    });
    // optimal default
    this.tweenState(['blocks', 2], {
      easing: easingTypes.easeInOutQuad,
      stackBehavior: stackBehavior.ADDITIVE,
      duration: 1000,
      endValue: this.state.blocks[2] === 0 ? 400 : 0,
    });
    // BTW, stackBehavior.DESTRUCTIVE + duration 0 effectively cancels all the
    // in-flight animations.
  },

  render: function() {
    var block1Style = translateXStyle(this.getTweeningValue(['blocks', 0]));
    var block2Style = translateXStyle(this.getTweeningValue(['blocks', 1]));
    var block3Style = translateXStyle(this.getTweeningValue(['blocks', 2]));

    return (
      <div style={{padding: 10}}>
        <div>
          <button onClick={this.handleTweenClick}>Click Me Repeatedly</button>
        </div>

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
