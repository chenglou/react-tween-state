'use strict';

// function requestAnimationFrame(func) {
//   setTimeout(func, 1000/60);
//   setTimeout(func, 1000);
// }

var tweenStateMixin = {
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

  tweenState: function(stateName, config) {
    var state = this.state;

    state.tweenQueue.push({
      stateName: stateName,
      initVal: state[stateName],
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

  getTweeningValue: function(stateName) {
    var state = this.state;
    var tweeningValue = state[stateName];
    var now = Date.now();

    for (var i = 0; i < state.tweenQueue.length; i++) {
      var item = state.tweenQueue[i];
      if (item.stateName !== stateName) {
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

    state.tweenQueue.forEach(function(item) {
      if (now - item.initTime >= item.config.duration) {
        item.config.onEnd && item.config.onEnd();
      }
    });

    var now = Date.now();
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

window.tweenStateMixin = tweenStateMixin;
