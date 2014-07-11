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
      initTime: Date.now(),
    });
    // tweenState proxies to setState
    var newState = {};
    newState[stateName] = config.value;
    this.setState(newState);

    if (this.state.tweenQueue.length === 1) {
      this.startRaf();
    }
  },

  rafCb: function() {
    if (this.state.tweenQueue.length === 0) {
      return;
    }

    // TODO: poll this
    var newTweenLayerState = {};

    var now = Date.now();
    this.state.tweenQueue.forEach(function(item) {
      var progressTime = now - item.initTime > item.config.duration ?
        item.config.duration :
        now - item.initTime;

      newTweenLayerState[item.stateName] = item.config.easing(
        progressTime,
        item.initVal,
        item.config.value,
        item.config.duration
        // TODO: some funcs accept a 5th param
      );
    }.bind(this));

    this.setState({
      tweenLayer: newTweenLayerState
    });

    this.state.tweenQueue = this.state.tweenQueue.filter(function(item) {
      var notDone = now - item.initTime < item.config.duration;
			if(!notDone && item.config.onFinish){
				setTimeout(item.config.onFinish, 0);
			}
			return notDone;
    });

    requestAnimationFrame(this.rafCb);
  },

  startRaf: function() {
    requestAnimationFrame(this.rafCb);
  },

};

window.tweenStateMixin = tweenStateMixin;
