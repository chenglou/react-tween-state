import easingTypes, {easeInOutQuad} from 'tween-functions';
import requestAnimationFrame from 'raf';

// additive is the new iOS 8 default. In most cases it simulates a physics-
// looking overshoot behavior (especially with easeInOut. You can test that in
// the example
let DEFAULT_STACK_BEHAVIOR = 'ADDITIVE';
let DEFAULT_EASING = easeInOutQuad;
let DEFAULT_DURATION = 300;
let DEFAULT_DELAY = 0;

let stackBehavior = {
  ADDITIVE: 'ADDITIVE',
  DESTRUCTIVE: 'DESTRUCTIVE',
};
let Mixin = {
  _rafID: null,

  getInitialState() {
    return {
      tweenQueue: [],
    };
  },

  componentWillUnmount() {
    requestAnimationFrame.cancel(this._rafID);
    this._rafID = -1;
  },

  tweenState(path, {easing, duration, delay, beginValue, endValue, onEnd, stackBehavior: configSB}) {
    this.setState(state => {
      let cursor = state;
      let stateName;
      // see comment below on pash hash
      let pathHash;
      if (typeof path === 'string') {
        stateName = path;
        pathHash = path;
      } else {
        for (let i = 0; i < path.length - 1; i++) {
          cursor = cursor[path[i]];
        }
        stateName = path[path.length - 1];
        pathHash = path.join('|');
      }
      // see the reasoning for these defaults at the top of file
      let newConfig = {
        easing: easing || DEFAULT_EASING,
        duration: duration == null ? DEFAULT_DURATION : duration,
        delay: delay == null ? DEFAULT_DELAY : delay,
        beginValue: beginValue == null ? cursor[stateName] : beginValue,
        endValue: endValue,
        onEnd: onEnd,
        stackBehavior: configSB || DEFAULT_STACK_BEHAVIOR,
      };

      let newTweenQueue = state.tweenQueue;
      if (newConfig.stackBehavior === stackBehavior.DESTRUCTIVE) {
        newTweenQueue = state.tweenQueue.filter(item => item.pathHash !== pathHash);
      }

      // we store path hash, so that during value retrieval we can use hash
      // comparison to find the path. See the kind of shitty thing you have to
      // do when you don't have value comparison for collections?
      newTweenQueue.push({
        pathHash: pathHash,
        config: newConfig,
        initTime: Date.now() + newConfig.delay,
      });

      // sorry for mutating. For perf reasons we don't want to deep clone.
      // guys, can we please all start using persistent collections so that
      // we can stop worrying about nonesense like this
      cursor[stateName] = newConfig.endValue;
      if (newTweenQueue.length === 1) {
        this._rafID = requestAnimationFrame(this._rafCb);
      }

      // this will also include the above mutated update
      return {tweenQueue: newTweenQueue};
    });
  },

  getTweeningValue(path) {
    let state = this.state;

    let tweeningValue;
    let pathHash;
    if (typeof path === 'string') {
      tweeningValue = state[path];
      pathHash = path;
    } else {
      tweeningValue = state;
      for (let i = 0; i < path.length; i++) {
        tweeningValue = tweeningValue[path[i]];
      }
      pathHash = path.join('|');
    }
    let now = Date.now();

    for (let i = 0; i < state.tweenQueue.length; i++) {
      let item = state.tweenQueue[i];
      if (item.pathHash !== pathHash) {
        continue;
      }

      let progressTime = now - item.initTime > item.config.duration ?
        item.config.duration :
        Math.max(0, now - item.initTime);
      // `now - item.initTime` can be negative if initTime is scheduled in the
      // future by a delay. In this case we take 0

      let contrib = -item.config.endValue + item.config.easing(
        progressTime,
        item.config.beginValue,
        item.config.endValue,
        item.config.duration,
        // TODO: some funcs accept a 5th param
      );
      tweeningValue += contrib;
    }

    return tweeningValue;
  },

  _rafCb() {
    let state = this.state;
    if (state.tweenQueue.length === 0) {
      return;
    }

    let now = Date.now();
    let newTweenQueue = [];

    for (let i = 0; i < state.tweenQueue.length; i++) {
      let item = state.tweenQueue[i];
      if (now - item.initTime < item.config.duration) {
        newTweenQueue.push(item);
      } else {
        item.config.onEnd && item.config.onEnd();
      }
    }

    // onEnd might trigger a parent callback that removes this component
    // -1 means we've canceled it in componentWillUnmount
    if (this._rafID === -1) {
      return;
    }

    this.setState({
      tweenQueue: newTweenQueue,
    });

    this._rafID = requestAnimationFrame(this._rafCb);
  },
};

export default {
  Mixin,
  easingTypes,
  stackBehavior,
};
