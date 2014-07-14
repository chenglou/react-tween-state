'use strict';

// function requestAnimationFrame(func) {
//   setTimeout(func, 1000/60);
//   setTimeout(func, 1000);
// }

// additive is the new iOS 8 default. In most cases it simulates a physics-
// looking overshoot behavior (especially with easeInOut. You can test that in
// the example
var DEFAULT_STACK_BEHAVIOR = 'ADDITIVE';
var DEFAULT_EASING = window.easingTypes.easeInOutQuad;
var DEFAULT_DURATION = 300;

var tweenState = {
  easingTypes: window.easingTypes,
  stackBehavior: {
    ADDITIVE: 'ADDITIVE',
    // QUEUED: 'QUEUED',
    DESTROY: 'DESTROY',
  }
};

tweenState.Mixin = {
  getInitialState: function() {
    return {
      tweenQueue: [],
    };
  },

  // updates: 0,

  // componentDidUpdate: function() {
  //   if (this.updates++ > 999) {
  //     throw 'infinite recursion';
  //   }
  // },

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
      a = function(state) {return state;};
    }
    this._tweenState(a, b, c);
  },

  _tweenState: function(stateRefFunc, stateName, config) {
    var state = this.state;
    var stateRef = stateRefFunc(state);

    // see the reasoning for these defaults at the top
    config.stackBehavior = config.stackBehavior || DEFAULT_STACK_BEHAVIOR;
    config.easing = config.easing || DEFAULT_EASING;
    config.duration = config.duration || DEFAULT_DURATION;

    var newTweenQueue;
    if (config.stackBehavior === tweenState.stackBehavior.DESTROY) {
      newTweenQueue = state.tweenQueue.filter(function(item) {
        return item.stateName !== config.stateName && item.stateRefFunc(state) !== stateRefFunc(state);
      });
    }

    state.tweenQueue.push({
      stateRefFunc: stateRefFunc,
      stateName: stateName,
      initVal: stateRef[stateName],
      config: config,
      initTime: Date.now(),
    });

    // tweenState calls setState
    // sorry for mutating. No idea where in the state the value is
    stateRef[stateName] = config.value;
    if (newTweenQueue) {
      // might as well spare an allocation if we're already mutating above
      state.tweenQueue = newTweenQueue;
    }
    this.setState(this.state);

    if (state.tweenQueue.length === 1) {
      this.startRaf();
    }
  },

  getTweeningValue: function(a, b) {
    // see tweenState API
    if (typeof a === 'string') {
      b = a;
      a = function(state) {return state;};
    }
    return this._getTweeningValue(a, b);
  },

  _getTweeningValue: function(stateRefFunc, stateName) {
    var state = this.state;
    var stateRef = stateRefFunc(state);
    var tweeningValue = stateRef[stateName];
    var now = Date.now();

    for (var i = 0; i < state.tweenQueue.length; i++) {
      var item = state.tweenQueue[i];
      var itemStateRef = item.stateRefFunc(state);
      if (item.stateName !== stateName || itemStateRef !== stateRef) {
        continue;
      }

      var progressTime = now - item.initTime > item.config.duration ?
        item.config.duration :
        now - item.initTime;

      var contrib = -item.config.value + item.config.easing(
        progressTime,
        item.initVal,
        item.config.value,
        item.config.duration
        // TODO: some funcs accept a 5th param
      );
      tweeningValue += contrib;
    }

    return tweeningValue;
  },

  rafCb: function() {
    var state = this.state;
    if (state.tweenQueue.length === 0) {
      return;
    }

    var now = Date.now();
    state.tweenQueue.forEach(function(item) {
      if (now - item.initTime >= item.config.duration) {
        item.config.onEnd && item.config.onEnd();
      }
    });

    var newTweenQueue = state.tweenQueue.filter(function(item) {
      return now - item.initTime < item.config.duration;
    });

    this.setState({
      tweenQueue: newTweenQueue,
    });

    requestAnimationFrame(this.rafCb);
  },

  startRaf: function() {
    requestAnimationFrame(this.rafCb);
  },

};

window.tweenState = tweenState;
