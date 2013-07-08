// To implement this example I originally used TweenJS. It
// is easy to use, well-supported and has beautiful easing
// functions. Unfortunately it was dropping frames, so I
// rewrote an API-compatible version here that does not
// drop frames. I hope they stop dropping frames in the
// future so we can switch back to it again, but I didn't
// have time to profile it.

// Since someone else will probably build a better one, I
// didn't document this code too much. Just look at
// http://www.createjs.com/#!/TweenJS for usage info.

// What's important is that it's clocked on
// requestAnimationFrame(); see tick() for some notes.

// Go to the end to see the mixin.

// Lifted from https://gist.github.com/gre/1650294

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
  this.deltas = null;
  this.starts = null;
}

copyProperties(
  TweenStep.prototype, {
    start: function(target, time) {
      this.startTime = time;
      this.deltas = {};
      this.starts = {};
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
        if (this.time === 0) {
          // Special case instant update
          if (this.easing) {
            this.easing(1);
          }
          copyProperties(target, this.dest);
          return;
        }

        this.start(target, time);
      }
      var pct = Math.min((time - this.startTime) / this.time, 1.0);
      for (var key in this.deltas) {
        target[key] = this.starts[key] + this.easing(pct) * this.deltas[key];
      }
    }
  }
);

var allTweens = [];
var ticking = false;

function tick() {
  // TODO: we could pool newTweens to save gc
  var newTweens = [];
  var time = Date.now();
  for (var i = 0; i < allTweens.length; i++) {
    var tween = allTweens[i];
    if (!tween.isDone()) {
      tween.tick(time)
      newTweens.push(tween);
    } else {
      tween.cleanup();
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

function Tween(target, cfg) {
  this.target = target;
  this.queue = [];
  this.queuePos = 0;
  this.lastStepStartTime = null;

  if (cfg.override && this.target.__tween) {
    Tween.removeTweens(this.target);
  }
  this.target.__tween = this;

  allTweens.push(this);

  queueTick();
}

Tween.get = function(target, cfg) {
  return new Tween(target, cfg);
};

Tween.removeTweens = function(target) {
  if (target.__tween) {
    target.__tween.cancel();
    target.__tween.cleanup();
  }
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
    cancel: function() {
      this.queue.length = 0;
    },
    cleanup: function() {
      this.target.__tween = null;
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
    call: function(func) {
      this.queue.push(
        new TweenStep({}, 0, function(d) {
          if (d === 1) {
            func();
          }
        })
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
    var t = Tween.get(this.state, cfg);
    // Every time the tween updates call setState();
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