'use strict';

var easingTypes = require('tween-functions');

// additive is the new iOS 8 default. In most cases it simulates a physics-
// looking overshoot behavior (especially with easeInOut. You can test that in
// the example
var DEFAULT_STACK_BEHAVIOR = 'ADDITIVE';
var DEFAULT_EASING = easingTypes.easeInOutQuad;
var DEFAULT_DURATION = 300;
var DEFAULT_DELAY = 0;

// see usage below
function returnState(state) {
  return state;
}

var tweenState = {
  easingTypes: easingTypes,
  stackBehavior: {
    ADDITIVE: 'ADDITIVE',
    DESTRUCTIVE: 'DESTRUCTIVE',
  }
};

tweenState.Mixin = {
  tweenQueue: [],

  tweenState: function(a, b, c) {
    // tweenState(stateNameString, config)
    // tweenState(stateRefFunc, stateNameString, config)

    // passing a state name string and retrieving it later from this.state
    // doesn't work for values in deeply nested collections (unless you design
    // the API to be able to parse 'this.state.my.nested[1]', meh). Passing a
    // direct, resolved reference wouldn't work either, since that reference
    // points to the old state rather than the subsequent new ones.
    if (typeof a === 'string') {
      c = b;
      b = a;
      a = returnState;
    }
    this._tweenState(a, b, c);
  },

  _tweenState: function(stateRefFunc, stateName, config) {
    // _pendingState doesn't exist in React 0.13 anymore. No harm leaving it
    // here for backward compat
    var stateRef = stateRefFunc(this.state);

    // see the reasoning for these defaults at the top
    var newConfig = {
      easing: config.easing || DEFAULT_EASING,
      duration: config.duration == null ? DEFAULT_DURATION : config.duration,
      delay: config.delay == null ? DEFAULT_DELAY : config.delay,
      beginValue: config.beginValue == null ? stateRef[stateName] : config.beginValue,
      endValue: config.endValue,
      onEnd: config.onEnd,
      stackBehavior: config.stackBehavior || DEFAULT_STACK_BEHAVIOR,
    };

    var newTweenQueue = this.tweenQueue;
    if (newConfig.stackBehavior === tweenState.stackBehavior.DESTRUCTIVE) {
      newTweenQueue = this.tweenQueue.filter(function(item) {
        return item.stateName !== stateName || item.stateRefFunc(state) !== stateRef;
      });
    }

    newTweenQueue.push({
      stateRefFunc: stateRefFunc,
      stateName: stateName,
      config: newConfig,
      initTime: Date.now() + newConfig.delay,
    });

    // tweenState calls setState
    // sorry for mutating. No idea where in the state the value is
    stateRef[stateName] = newConfig.endValue;
    // this will also include the above update
    this.tweenQueue = newTweenQueue;
    this.forceUpdate();

    if (newTweenQueue.length === 1) {
      this.startRaf();
    }
  },

  getTweeningValue: function(a, b) {
    // see tweenState API
    if (typeof a === 'string') {
      b = a;
      a = returnState;
    }
    return this._getTweeningValue(a, b);
  },

  _getTweeningValue: function(stateRefFunc, stateName) {
    var state = this.state;
    var stateRef = stateRefFunc(state);
    var tweeningValue = stateRef[stateName];
    var now = Date.now();

    for (var i = 0; i < this.tweenQueue.length; i++) {
      var item = this.tweenQueue[i];
      var itemStateRef = item.stateRefFunc(state);
      if (item.stateName !== stateName || itemStateRef !== stateRef) {
        continue;
      }

      var progressTime = now - item.initTime > item.config.duration ?
        item.config.duration :
        Math.max(0, now - item.initTime);
      // `now - item.initTime` can be negative if initTime is scheduled in the
      // future by a delay. In this case we take 0

      var contrib = -item.config.endValue + item.config.easing(
        progressTime,
        item.config.beginValue,
        item.config.endValue,
        item.config.duration
        // TODO: some funcs accept a 5th param
      );
      tweeningValue += contrib;
    }

    return tweeningValue;
  },

  _rafCb: function() {
    if (this.tweenQueue.length === 0) {
      return;
    }

    var now = Date.now();
    var newTweenQueue = [];

    for (var i = 0; i < this.tweenQueue.length; i++) {
      var item = this.tweenQueue[i];
      if (now - item.initTime < item.config.duration) {
        newTweenQueue.push(item);
      } else {
        item.config.onEnd && item.config.onEnd();
      }
    }

    this.tweenQueue = newTweenQueue;
    this.forceUpdate();

    requestAnimationFrame(this._rafCb);
  },

  startRaf: function() {
    requestAnimationFrame(this._rafCb);
  },

};

module.exports = tweenState;
