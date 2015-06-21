'use strict';

import tweenState from '../';
import React from 'react';

export default React.createClass({
  mixins: [tweenState.Mixin],

  getInitialState: function() {
    return {counter: 0};
  },

  componentDidMount: function() {
    this.count();
  },

  count: function() {
    // This is the API you'll probably use 90% of the time.
    this.tweenState('counter', {
      duration: 500,
      endValue: this.state.counter + 500,
      onEnd: this.count
    });
  },

  render: function() {
    return (
      <div>
        easeOutQuad on a counter! {Math.round(this.getTweeningValue('counter') / 100)}
      </div>
    );
  }
});
