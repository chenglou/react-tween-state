'use strict';

var easingTypes = require('tween-functions');

// additive is the new iOS 8 default. In most cases it simulates a physics-
// looking overshoot behavior (especially with easeInOut. You can test that in
// the example
var DEFAULT_STACK_BEHAVIOR = 'ADDITIVE';
var DEFAULT_EASING = easingTypes.easeInOutQuad;
var DEFAULT_DURATION = 300;
var DEFAULT_DELAY = 0;

var tweenState = {
  easingTypes: easingTypes,
  stackBehavior: {
    ADDITIVE: 'ADDITIVE',
    DESTRUCTIVE: 'DESTRUCTIVE',
  }
};

tweenState.Mixin = {
  getInitialState: function() {
    return {
      tweenQueue: [],
    };
  },

  tweenState: function(path, config) {
    if (typeof path === 'string') {
      path = [path];
    }
    this._tweenState(path, config);
  },

  _tweenState: function(path, config) {
    this.setState(function(state) {
      var stateRef = state;
      for (var i = 0; i < path.length - 1; i++) {
        stateRef = stateRef[path[i]];
      }
      var stateName = path[path.length - 1];
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

      var pathHash = path.join('|');
      var newTweenQueue = state.tweenQueue;
      if (newConfig.stackBehavior === tweenState.stackBehavior.DESTRUCTIVE) {
        newTweenQueue = state.tweenQueue.filter(function(item) {
          return item.pathHash !== pathHash;
        });
      }

      newTweenQueue.push({
        path: path,
        pathHash: pathHash,
        config: newConfig,
        initTime: Date.now() + newConfig.delay,
      });

      // sorry for mutating. For perf reasons we don't want to deep clone.
      // guys, can we please all start using persistent collections so that
      // we can stop worrying about nonesense like this
      stateRef[stateName] = newConfig.endValue;
      if (newTweenQueue.length === 1) {
        this.startRaf();
      }

      // this will also include the above mutated update
      return {tweenQueue: newTweenQueue};
    });
  },

  getTweeningValue: function(path) {
    if (typeof path === 'string') {
      path = [path];
    }
    return this._getTweeningValue(path);
  },

  _getTweeningValue: function(path) {
    var state = this.state;

    var tweeningValue = state;
    for (var j = 0; j < path.length; j++) {
      tweeningValue = tweeningValue[path[j]];
    }
    var now = Date.now();

    var pathHash = path.join('|');
    for (var i = 0; i < state.tweenQueue.length; i++) {
      var item = state.tweenQueue[i];
      if (item.pathHash !== pathHash) {
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
    var state = this.state;
    if (state.tweenQueue.length === 0) {
      return;
    }

    var now = Date.now();
    var newTweenQueue = [];

    for (var i = 0; i < state.tweenQueue.length; i++) {
      var item = state.tweenQueue[i];
      if (now - item.initTime < item.config.duration) {
        newTweenQueue.push(item);
      } else {
        item.config.onEnd && item.config.onEnd();
      }
    }

    // onEnd might trigger a parent callback that removes this component
    if (!this.isMounted()) {
      return;
    }

    this.setState({
      tweenQueue: newTweenQueue,
    });

    requestAnimationFrame(this._rafCb);
  },

  startRaf: function() {
    requestAnimationFrame(this._rafCb);
  },

};

module.exports = tweenState;
