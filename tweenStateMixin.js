'use strict';

var tweenStateMixin = {
  getInitialState: function() {
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
    this.state.tweenQueue.push({
      stateName: stateName,
      initVal: this.state[stateName],
      config: config,
      currentTime: 0,
    });
    console.log(this.state.tweenQueue.length);

    if (this.state.tweenQueue.length === 1) {
      this.startRaf();
    }
  },

  rafCb: function() {
    if (this.state.tweenQueue.length === 0) {
      return;
    }
    // the time increase happens before actually playing a frame, since the
    // initial state value was already the first frame
    this.state.tweenQueue.forEach(function(item) {
      item.currentTime += 1000 / 60;
    });

    // TODO: poll this
    var newState = {};

    this.state.tweenQueue.forEach(function(item) {
      // this.state.bla.nested.thing
      var currentTime = item.currentTime > item.config.duration ?
        item.config.duration :
        item.currentTime;

      newState[item.stateName] = item.config.easing(
        currentTime,
        item.initVal,
        item.config.value,
        item.config.duration
        // TODO: some funcs accept a 5th param
      );
    }.bind(this));

    this.setState(newState);

    this.state.tweenQueue = this.state.tweenQueue.filter(function(item) {
      return item.currentTime < item.config.duration;
    });

    requestAnimationFrame(this.rafCb);
  },

  startRaf: function() {
    requestAnimationFrame(this.rafCb);
  },

};

window.tweenStateMixin = tweenStateMixin;
