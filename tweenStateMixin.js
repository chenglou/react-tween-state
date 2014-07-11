'use strict';

var tweenStateMixin = {
  getInitialState: function() {
    // TODO: find a way to get component's initial state and copy them unto
    // tweenLayer non-messily
    return {
      tweenQueue: [],
      tweenLayer: {},
    };
  },

  // updates: 0,

  // componentDidUpdate: function() {
  //   if (this.updates++ > 999) {
  //     throw 'infinite recursion';
  //   }
  // },

  tweenState: function(stateName, config) {
    var state = this.state;
    // TODO: see TODO in getInitialState
    if (state.tweenLayer[stateName] == null) {
      // initial value is the current transitioning value
      state.tweenLayer[stateName] = state[stateName];
    }

    state.tweenQueue.push({
      stateName: stateName,
      initVal: state.tweenLayer[stateName],
      config: config,
      initTime: Date.now(),
    });
    // tweenState calls setState
    var newState = {};
    newState[stateName] = config.value;
    this.setState(newState);

    if (state.tweenQueue.length === 1) {
      this.startRaf();
    }
  },

  rafCb: function() {
    var state = this.state;
    if (state.tweenQueue.length === 0) {
      return;
    }

    // TODO: poll this
    var newTweenLayer = {};

    var now = Date.now();
    state.tweenQueue.forEach(function(item) {
      var progressTime = now - item.initTime > item.config.duration ?
        item.config.duration :
        now - item.initTime;

      newTweenLayer[item.stateName] = item.config.easing(
        progressTime,
        item.initVal,
        item.config.value,
        item.config.duration
        // TODO: some funcs accept a 5th param
      );
    }, this);

    state.tweenQueue.forEach(function(item) {
      if (now - item.initTime >= item.config.duration) {
        item.config.onEnd && item.config.onEnd();
      }
    });

    var newTweenQueue = state.tweenQueue.filter(function(item) {
      return now - item.initTime < item.config.duration;
    });

    this.setState({
      tweenLayer: newTweenLayer,
      tweenQueue: newTweenQueue,
    });

    requestAnimationFrame(this.rafCb);
  },

  startRaf: function() {
    requestAnimationFrame(this.rafCb);
  },

};

window.tweenStateMixin = tweenStateMixin;
