/*
 * Easing Functions - inspired from http://gizma.com/easing/
 * only considering the t value for the range [0, 1] => [0, 1]
 */
var EasingFunctions = {
  // no easing, no acceleration
  linear: function (t) { return t },
  // accelerating from zero velocity
  easeInQuad: function (t) { return t*t },
  // decelerating to zero velocity
  easeOutQuad: function (t) { return t*(2-t) },
  // acceleration until halfway, then deceleration
  easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
  // accelerating from zero velocity
  easeInCubic: function (t) { return t*t*t },
  // decelerating to zero velocity
  easeOutCubic: function (t) { return (--t)*t*t+1 },
  // acceleration until halfway, then deceleration
  easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
  // accelerating from zero velocity
  easeInQuart: function (t) { return t*t*t*t },
  // decelerating to zero velocity
  easeOutQuart: function (t) { return 1-(--t)*t*t*t },
  // acceleration until halfway, then deceleration
  easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
  // accelerating from zero velocity
  easeInQuint: function (t) { return t*t*t*t*t },
  // decelerating to zero velocity
  easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
  // acceleration until halfway, then deceleration
  easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
};

function copyProperties(dst, src) {
  for (var k in src) {
    if (!src.hasOwnProperty(k)) {
      continue;
    }
    dst[k] = src[k];
  }
  return dst;
}

function TweenStep(dest, time, easing) {
  this.dest = dest;
  this.time = time;
  this.easing = easing;
  this.startTime = null;
  this.deltas = {};
  this.starts = {};
}

copyProperties(
  TweenStep.prototype, {
    start: function(target, time) {
      this.startTime = time;
      for (var key in this.dest) {
        if (!this.dest.hasOwnProperty(key)) {
          continue;
        }
        this.deltas[key] = this.dest[key] - target[key];
        this.starts[key] = target[key];
      }
    },
    tick: function(target, time) {
      if (this.startTime === null) {
        this.start(target, time);
      }
      var pct = (time - this.startTime) / this.time;
      for (var key in this.deltas) {
        target[key] = this.starts[key] + this.easing(pct) * this.deltas[key];
      }
    }
  }
);

var allTweens = [];
var ticking = false;

function tick() {
  var newTweens = [];
  var time = Date.now();
  for (var i = 0; i < allTweens.length; i++) {
    var tween = allTweens[i];
    if (!tween.isDone()) {
      tween.tick(time)
      newTweens.push(tween);
    }
  }
  allTweens = newTweens;
  if (allTweens.length === 0) {
    ticking = false;
  } else {
    requestAnimationFrame(tick);
  }
}

function queueTick() {
  if (ticking) {
    return;
  }
  ticking = true;
  requestAnimationFrame(tick);
}

function Tween(target) {
  this.target = target;
  this.queue = [];
  this.queuePos = 0;
  this.lastStepStartTime = null;
  allTweens.push(this);

  queueTick();
}

Tween.get = function(target) {
  return new Tween(target);
};

// To maintain API compatibility with TweenJS we need
// to return an object that looks like this. We pool it
// here such that we don't trigger additional GCs which
// would suck during a tween.
var EVENT_SINGLETON = {target: {target: null}};

copyProperties(
  Tween.prototype, {
    addEventListener: function(event, func) {
      if (event === 'change') {
        this.onChange = func;
      }
    },
    to: function(dest, time, easing) {
      this.queue.push(new TweenStep(dest, time, easing));
      return this;
    },
    wait: function(time) {
      this.queue.push(
        new TweenStep({}, time, function(d) { return d; })
      );
      return this;
    },
    tickTweenStep: function(time) {
      this.queue[this.queuePos].tick(
        this.target,
        time
      );
      EVENT_SINGLETON.target.target = this.target;
      this.onChange(EVENT_SINGLETON);
    },
    tick: function(time) {
      if (this.isDone()) {
        return;
      }
      if (this.lastStepStartTime === null) {
        this.lastStepStartTime = time;
      } else if (time - this.lastStepStartTime > this.queue[this.queuePos].time) {
        this.tickTweenStep(this.lastStepStartTime + this.queue[this.queuePos].time);
        this.lastStepStartTime = time;
        this.queuePos++;
      }
      if (this.isDone()) {
        return;
      }
      this.tickTweenStep(time);
    },
    isDone: function() {
      return this.queuePos >= this.queue.length;
    }
  }
);

var TweenMixin = {
  tweenState: function(cfg) {
    // NOTE: while the tween is going on, setState() will be a no-op.
    var tweenState = {};
    copyProperties(tweenState, this.state);
    var t = Tween.get(tweenState); //createjs.Tween.get(tweenState, cfg);
    t.addEventListener('change', this.change);
    return t;
  },
  change: function(e) {
    this.setState(e.target.target);
  }
};

window.Tween = Tween;
window.TweenMixin = TweenMixin;
window.EasingFunctions = EasingFunctions;