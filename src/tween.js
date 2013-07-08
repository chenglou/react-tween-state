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

// Lifted from https://github.com/danro/jquery-easing/blob/master/jquery.easing.js (BSD license)
// Based on Robert Penner's easing equations
var EasingFunctions = {
  // t: current time, b: begInnIng value, c: change In value, d: duration
  def: 'easeOutQuad',
  swing: function (x, t, b, c, d) {
    return this[this.def](x, t, b, c, d);
  },
  easeInQuad: function (x, t, b, c, d) {
    return c*(t/=d)*t + b;
  },
  easeOutQuad: function (x, t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  },
  easeInOutQuad: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t + b;
    return -c/2 * ((--t)*(t-2) - 1) + b;
  },
  easeInCubic: function (x, t, b, c, d) {
    return c*(t/=d)*t*t + b;
  },
  easeOutCubic: function (x, t, b, c, d) {
    return c*((t=t/d-1)*t*t + 1) + b;
  },
  easeInOutCubic: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t + b;
    return c/2*((t-=2)*t*t + 2) + b;
  },
  easeInQuart: function (x, t, b, c, d) {
    return c*(t/=d)*t*t*t + b;
  },
  easeOutQuart: function (x, t, b, c, d) {
    return -c * ((t=t/d-1)*t*t*t - 1) + b;
  },
  easeInOutQuart: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
    return -c/2 * ((t-=2)*t*t*t - 2) + b;
  },
  easeInQuint: function (x, t, b, c, d) {
    return c*(t/=d)*t*t*t*t + b;
  },
  easeOutQuint: function (x, t, b, c, d) {
    return c*((t=t/d-1)*t*t*t*t + 1) + b;
  },
  easeInOutQuint: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
    return c/2*((t-=2)*t*t*t*t + 2) + b;
  },
  easeInSine: function (x, t, b, c, d) {
    return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
  },
  easeOutSine: function (x, t, b, c, d) {
    return c * Math.sin(t/d * (Math.PI/2)) + b;
  },
  easeInOutSine: function (x, t, b, c, d) {
    return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
  },
  easeInExpo: function (x, t, b, c, d) {
    return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
  },
  easeOutExpo: function (x, t, b, c, d) {
    return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
  },
  easeInOutExpo: function (x, t, b, c, d) {
    if (t==0) return b;
    if (t==d) return b+c;
    if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
    return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
  },
  easeInCirc: function (x, t, b, c, d) {
    return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
  },
  easeOutCirc: function (x, t, b, c, d) {
    return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
  },
  easeInOutCirc: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
    return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
  },
  easeInElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
  },
  easeOutElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
  },
  easeInOutElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
  },
  easeInBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c*(t/=d)*t*((s+1)*t - s) + b;
  },
  easeOutBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
  },
  easeInOutBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
    return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
  },
  easeInBounce: function (x, t, b, c, d) {
    return c - this.easeOutBounce (x, d-t, 0, c, d) + b;
  },
  easeOutBounce: function (x, t, b, c, d) {
    if ((t/=d) < (1/2.75)) {
      return c*(7.5625*t*t) + b;
    } else if (t < (2/2.75)) {
      return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
    } else if (t < (2.5/2.75)) {
      return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
    } else {
      return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
    }
  },
  easeInOutBounce: function (x, t, b, c, d) {
    if (t < d/2) return this.easeInBounce (x, t*2, 0, c, d) * .5 + b;
    return this.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
  }
};

function wrapEasingFunction(f) {
  return function(t, x) {
    return f(x, t, 0, 1, 1);
  };
}

// Normalize jQuery-style easing functions
for (var key in EasingFunctions) {
  if (typeof EasingFunctions[key] === 'function') {
    EasingFunctions[key] = wrapEasingFunction(EasingFunctions[key].bind(EasingFunctions));
  }
}

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